import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Ship, ArrowLeft, ArrowRight, FileText, CheckCircle2, Loader2, Sparkles, Plus, X, Trash2, AlertTriangle, ChevronDown, Eye } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import axios from 'axios';

// Configure pdf.js worker CDN for client-side text extraction fallback
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export default function Edit({ fleet = null, categories = [] }) {
    const [activeTab, setActiveTab] = useState('basic');
    const [parsingPdf, setParsingPdf] = useState(false);
    const [parseSuccessMessage, setParseSuccessMessage] = useState(null);

    // Dynamic Category Management State
    const [categoriesList, setCategoriesList] = useState(categories || []);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatDesc, setNewCatDesc] = useState('');
    const [submittingCat, setSubmittingCat] = useState(false);
    const [catError, setCatError] = useState(null);
    const [nameError, setNameError] = useState(null);
    const [imoError, setImoError] = useState(null);
    const [categoryError, setCategoryError] = useState(null);
    const [areaError, setAreaError] = useState(null);
    const [imageError, setImageError] = useState(null);
    const [pdfError, setPdfError] = useState(null);
    const [showDeleteCatModal, setShowDeleteCatModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [deletingCat, setDeletingCat] = useState(false);
    const [deleteCatError, setDeleteCatError] = useState(null);
    const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
    const areaDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target)) {
                setIsAreaDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const resolveImage = (img) => {
        if (!img) return null;
        if (img.startsWith('http://') || img.startsWith('https://')) return img;
        if (img.startsWith('/images/') || img.startsWith('/storage/')) return img;
        if (img.startsWith('storage/') || img.startsWith('images/')) return `/${img}`;
        return `/images/fleet/${img}`;
    };

    const [previewImage, setPreviewImage] = useState(resolveImage(fleet?.featured_image));

    const isEditing = !!fleet;

    const { data, setData, post, processing, errors } = useForm({
        _method: isEditing ? 'PUT' : 'POST',
        ship_name: fleet?.ship_name || '',
        imo_number: fleet?.imo_number || '',
        category_id: fleet?.category_id || '',
        vessel_type: fleet?.vessel_type || (isEditing ? '' : 'Cement Carrier'),
        status: fleet?.status || 'in_service',
        operational_area: fleet?.operational_area || '',
        build_year: fleet?.build_year || (isEditing ? '' : new Date().getFullYear()),
        dwt: fleet?.dwt || '',
        capacity: fleet?.capacity || '',
        gross_tonnage: fleet?.gross_tonnage || '',
        net_tonnage: fleet?.net_tonnage || '',
        light_ship: fleet?.light_ship || '',
        summer_draft: fleet?.summer_draft || '',
        flag: fleet?.flag || (isEditing ? '' : 'INDONESIA'),
        classification_society: fleet?.classification_society || (isEditing ? '' : 'RINA'),
        port_of_registry: fleet?.port_of_registry || '',
        call_sign: fleet?.call_sign || '',
        mmsi: fleet?.mmsi || '',
        ip_address: fleet?.ip_address || '',
        hull_no: fleet?.hull_no || '',
        loa: fleet?.loa || '',
        lbp: fleet?.lbp || '',
        breadth: fleet?.breadth || '',
        depth: fleet?.depth || '',
        speed: fleet?.speed || '',
        description: fleet?.description || '',
        voyage_description: fleet?.voyage_description || '',
        featured_image: null,
        ship_particular_pdf: null,
    });

    const operationalAreasList = [
        'Asia',
        'Southeast Asia',
        'Far East',
        'Middle East',
        'Europe',
        'Africa',
        'Global'
    ];

    const selectedAreas = (data.operational_area || '').split(',').map(s => s.trim()).filter(Boolean);

    const toggleOperationalArea = (area) => {
        let updated = [...selectedAreas];
        if (updated.includes(area)) {
            updated = updated.filter(a => a !== area);
        } else {
            updated.push(area);
        }
        setData('operational_area', updated.join(', '));
    };

    const handleIntInput = (field, maxLen = 15) => (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, maxLen);
        setData(field, val);
    };

    const handleDecInput = (field, maxLen = 15) => (e) => {
        let val = e.target.value.replace(/[^0-9.]/g, '');
        const parts = val.split('.');
        if (parts.length > 2) {
            val = `${parts[0]}.${parts.slice(1).join('')}`;
        }
        setData(field, val.slice(0, maxLen));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
        if (!isImage) {
            setImageError('The featured image must be a file of type: jpeg, png, jpg, webp.');
            setData('featured_image', null);
            setPreviewImage(null);
            e.target.value = null;
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setImageError('The featured image may not be greater than 5MB.');
            setData('featured_image', null);
            setPreviewImage(null);
            e.target.value = null;
            return;
        }

        setImageError(null);
        setData('featured_image', file);
        setPreviewImage(URL.createObjectURL(file));
    };

    // Modal Action to Add a New Vessel Category
    const handleAddCategorySubmit = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        if (newCatName.trim().length > 255) {
            setCatError('The category name must not be greater than 255 characters.');
            return;
        }

        const isDuplicate = categoriesList.some(c => (c.name || '').toLowerCase().trim() === newCatName.toLowerCase().trim());
        if (isDuplicate) {
            setCatError('A vessel category with this name already exists.');
            return;
        }

        setSubmittingCat(true);
        setCatError(null);

        try {
            const res = await axios.post(route('fleets.categories.store'), {
                name: newCatName.trim(),
                description: newCatDesc.trim(),
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            const responseData = res.data;
            const newCat = responseData?.category || responseData;

            if (newCat && newCat.id) {
                const updatedList = responseData?.categories || [...categoriesList, newCat];

                setCategoriesList(updatedList);

                // Auto-select newly created category in the vessel form
                setData(prevData => ({
                    ...prevData,
                    category_id: newCat.id,
                    vessel_type: newCat.name,
                }));

                // Reset and close modal
                setNewCatName('');
                setNewCatDesc('');
                setShowCategoryModal(false);
            } else {
                setCatError('Failed to parse category response.');
            }
        } catch (err) {
            console.error('Error adding category:', err);
            const errMsg = err.response?.data?.errors?.name?.[0]
                        || err.response?.data?.errors?.description?.[0]
                        || err.response?.data?.message 
                        || 'A category with this name already exists.';
            setCatError(errMsg);
        } finally {
            setSubmittingCat(false);
        }
    };

    // Modal Action to Delete Selected Vessel Category
    const handleDeleteCategorySubmit = async () => {
        const catId = categoryToDelete?.id || data.category_id;
        if (!catId) return;
        setDeletingCat(true);
        setDeleteCatError(null);

        try {
            const res = await axios.delete(route('fleet-category.destroy', catId), {
                headers: { 'Accept': 'application/json' }
            });

            const updatedList = res.data?.categories || categoriesList.filter(c => String(c.id) !== String(catId));
            setCategoriesList(updatedList);
            if (String(data.category_id) === String(catId)) {
                setData(prev => ({
                    ...prev,
                    category_id: '',
                    vessel_type: '',
                }));
            }
            setCategoryToDelete(null);
            setShowDeleteCatModal(false);
        } catch (err) {
            console.error('Error deleting category:', err);
            setDeleteCatError(err.response?.data?.message || 'Failed to delete vessel category. Please try again.');
        } finally {
            setDeletingCat(false);
        }
    };

    const autoSelectCategory = (extractedVesselType, extractedShipName, currentCategories = []) => {
        let typeToMatch = extractedVesselType || '';

        if (!typeToMatch && extractedShipName) {
            const lowerName = String(extractedShipName).toLowerCase();
            if (lowerName.includes('tug')) typeToMatch = 'Tugboat';
            else if (lowerName.includes('barge')) typeToMatch = 'Deck Barge';
            else if (lowerName.includes('cement') || lowerName.includes('mv')) typeToMatch = 'Cement Carrier';
        }

        if (!typeToMatch && currentCategories.length > 0) {
            return { category_id: currentCategories[0].id, vessel_type: currentCategories[0].name };
        }

        if (!typeToMatch) return null;

        const normType = String(typeToMatch).toLowerCase().trim();

        // 1. Exact match against DB categories
        let found = currentCategories.find(c => String(c.name).toLowerCase().trim() === normType);
        if (found) return { category_id: found.id, vessel_type: found.name };

        // 2. Substring match against DB categories
        found = currentCategories.find(c => {
            const cName = String(c.name).toLowerCase().trim();
            return normType.includes(cName) || cName.includes(normType);
        });
        if (found) return { category_id: found.id, vessel_type: found.name };

        // 3. Keyword matching (cement, carrier, tug, barge, bulk, cargo)
        const keywords = ['cement', 'tug', 'barge', 'carrier', 'bulk', 'tanker', 'container'];
        for (const kw of keywords) {
            if (normType.includes(kw)) {
                const catMatch = currentCategories.find(c => String(c.name).toLowerCase().includes(kw));
                if (catMatch) return { category_id: catMatch.id, vessel_type: catMatch.name };
            }
        }

        if (currentCategories.length > 0) {
            return { category_id: currentCategories[0].id, vessel_type: currentCategories[0].name };
        }

        return { category_id: '', vessel_type: typeToMatch };
    };

    const autoDetectOperationalArea = (parsed = {}, fullText = '') => {
        const combined = `${parsed.operational_area || ''} ${parsed.flag || ''} ${parsed.port_of_registry || ''} ${parsed.description || ''} ${fullText}`.toLowerCase();
        const areas = new Set();

        if (combined.includes('southeast asia') || combined.includes('indonesia') || combined.includes('jakarta') || combined.includes('surabaya') || combined.includes('priok') || combined.includes('rina') || combined.includes('bki')) {
            areas.add('Asia');
            areas.add('Southeast Asia');
        }
        if (combined.includes('far east') || combined.includes('china') || combined.includes('japan') || combined.includes('korea')) {
            areas.add('Far East');
        }
        if (combined.includes('middle east') || combined.includes('dubai') || combined.includes('uae')) {
            areas.add('Middle East');
        }
        if (combined.includes('europe')) {
            areas.add('Europe');
        }
        if (combined.includes('africa')) {
            areas.add('Africa');
        }
        if (combined.includes('global') || combined.includes('international') || combined.includes('worldwide')) {
            areas.add('Global');
        }

        return Array.from(areas).join(', ');
    };

    // AI PDF Specification Parser with OpenRouter + Local Fallback
    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            setPdfError('The ship particular pdf must be a file of type: pdf.');
            setParseSuccessMessage(null);
            setData('ship_particular_pdf', null);
            e.target.value = null;
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setPdfError('The specification document may not be greater than 10MB.');
            setParseSuccessMessage(null);
            setData('ship_particular_pdf', null);
            e.target.value = null;
            return;
        }

        setPdfError(null);
        setData('ship_particular_pdf', file);
        setParsingPdf(true);
        setParseSuccessMessage(null);

        const formData = new FormData();
        formData.append('ship_particular_pdf', file);

        const detailedSpecKeys = [
            'ship_name', 'imo_number', 'vessel_type', 'operational_area', 'description',
            'loa', 'lbp', 'breadth', 'depth', 'dwt', 'capacity',
            'gross_tonnage', 'net_tonnage', 'light_ship', 'summer_draft',
            'build_year', 'flag', 'classification_society', 'port_of_registry',
            'call_sign', 'mmsi', 'ip_address', 'hull_no', 'speed'
        ];

        try {
            const aiRes = await axios.post(route('fleets.parse-pdf'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (aiRes.data && aiRes.data.success && aiRes.data.data) {
                const parsed = aiRes.data.data;
                let countExtracted = 0;
                const updateValues = {};

                detailedSpecKeys.forEach(k => {
                    if (parsed[k] !== undefined && parsed[k] !== null && parsed[k] !== '' && parsed[k] !== 'N/A') {
                        updateValues[k] = parsed[k];
                        countExtracted++;
                    }
                });

                const catMatch = autoSelectCategory(updateValues.vessel_type || parsed.vessel_type, updateValues.ship_name || parsed.ship_name, categoriesList);
                if (catMatch) {
                    if (catMatch.category_id) updateValues.category_id = catMatch.category_id;
                    if (catMatch.vessel_type) updateValues.vessel_type = catMatch.vessel_type;
                }

                const autoArea = autoDetectOperationalArea(updateValues, '');
                if (autoArea) {
                    updateValues.operational_area = autoArea;
                }

                if (countExtracted > 0) {
                    setData(prev => ({
                        ...prev,
                        ...updateValues,
                    }));
                    setCategoryError(null);
                    setAreaError(null);
                    setPdfError(null);
                    setParseSuccessMessage(`AI parsed PDF successful! Auto-filled ${countExtracted} vessel specifications, category, and operational areas.`);
                } else {
                    setPdfError(null);
                    setParseSuccessMessage('PDF attached! No text specifications could be automatically parsed — please re-check or fill in vessel details manually.');
                }
                setParsingPdf(false);
                return;
            }
        } catch (err) {
            if (err.response?.status === 422 && err.response?.data?.message) {
                setPdfError(err.response.data.message);
                setParseSuccessMessage(null);
                setParsingPdf(false);
                return;
            }
            console.warn('AI Parser endpoint error, executing local fallback parser:', err);
        }

        // Fallback to local text extractor
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + ' ';
            }

            const extracted = {};
            let countExtracted = 0;

            const loaLbpMatch = fullText.match(/LOA\s*\/\s*LBP\s*:?\s*([\d\.]+)\s*m?\s*\/\s*([\d\.]+)/i);
            if (loaLbpMatch) {
                extracted.loa = loaLbpMatch[1];
                extracted.lbp = loaLbpMatch[2];
                countExtracted += 2;
            } else {
                const loaMatch = fullText.match(/LOA\s*:?\s*([\d\.]+)/i);
                if (loaMatch) { extracted.loa = loaMatch[1]; countExtracted++; }
                const lbpMatch = fullText.match(/LBP\s*:?\s*([\d\.]+)/i);
                if (lbpMatch) { extracted.lbp = lbpMatch[1]; countExtracted++; }
            }

            const breadthMatch = fullText.match(/Breadth\s*(?:\(MLD\))?\s*:?\s*([\d\.]+)/i);
            if (breadthMatch) { extracted.breadth = breadthMatch[1]; countExtracted++; }

            const depthMatch = fullText.match(/Depth\s*(?:\(MLD\))?\s*:?\s*([\d\.]+)/i);
            if (depthMatch) { extracted.depth = depthMatch[1]; countExtracted++; }

            const draftMatch = fullText.match(/Summer\s*Draft\s*:?\s*([\d\.]+)/i);
            if (draftMatch) { extracted.summer_draft = draftMatch[1]; countExtracted++; }

            const dwtMatch = fullText.match(/(?:Summer\s*)?DWT\s*:?\s*([\d\.,]+)/i);
            if (dwtMatch) { extracted.dwt = dwtMatch[1].replace(/,/g, ''); countExtracted++; }

            const capMatch = fullText.match(/(?:Hold\s*Capacity|Cargo\s*Capacity)\s*:?\s*([\d\.,]+)/i);
            if (capMatch) { extracted.capacity = capMatch[1].replace(/,/g, ''); countExtracted++; }

            const gtNtMatch = fullText.match(/GT\s*\/\s*NT\s*:?\s*([\d\.,]+)\s*t?\s*\/\s*([\d\.,]+)/i);
            if (gtNtMatch) {
                extracted.gross_tonnage = gtNtMatch[1].replace(/,/g, '');
                extracted.net_tonnage = gtNtMatch[2].replace(/,/g, '');
                countExtracted += 2;
            } else {
                const gtMatch = fullText.match(/GT\s*:?\s*([\d\.,]+)/i);
                if (gtMatch) { extracted.gross_tonnage = gtMatch[1].replace(/,/g, ''); countExtracted++; }
                const ntMatch = fullText.match(/NT\s*:?\s*([\d\.,]+)/i);
                if (ntMatch && !ntMatch[1].toLowerCase().includes('tba')) {
                    extracted.net_tonnage = ntMatch[1].replace(/,/g, '');
                    countExtracted++;
                }
            }

            const lightShipMatch = fullText.match(/Light\s*Ship\s*:?\s*([\d\.,]+)/i);
            if (lightShipMatch) { extracted.light_ship = lightShipMatch[1].replace(/,/g, ''); countExtracted++; }

            const speedMatch = fullText.match(/(?:Av\.\s*Speed|Avg?\s*(?:Ship\s*)?Speed|Speed)\s*:?\s*(?:abt\.?\s*)?([\d\.]+)/i);
            if (speedMatch) { extracted.speed = speedMatch[1]; countExtracted++; }

            const yearMatch = fullText.match(/Built\s*Year\s*:?\s*(\d{4})/i);
            if (yearMatch) { extracted.build_year = yearMatch[1]; countExtracted++; }

            const flagMatch = fullText.match(/Nationality\s*:?\s*([A-Za-z]+)/i);
            if (flagMatch) { extracted.flag = flagMatch[1].toUpperCase(); countExtracted++; }

            const portMatch = fullText.match(/Port\s*of\s*Registry\s*:?\s*([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
            if (portMatch) { extracted.port_of_registry = trim(portMatch[1]); }

            const classMatch = fullText.match(/Class(?:ification)?\s*(?:Society)?\s*:?\s*([A-Za-z0-9\/]+(?:\s+[A-Za-z0-9\/]+)?)/i);
            if (classMatch) { extracted.classification_society = trim(classMatch[1]); }

            const callSignMatch = fullText.match(/Call\s*Sign\s*:?\s*([A-Z0-9]+)/i);
            if (callSignMatch) { extracted.call_sign = callSignMatch[1]; countExtracted++; }

            const mmsiMatch = fullText.match(/MMSI\s*:?\s*([\d\s]+)/i);
            if (mmsiMatch) { extracted.mmsi = trim(mmsiMatch[1]); }

            const hullMatch = fullText.match(/Hull\s*No\.?\s*:?\s*([A-Z0-9\-]+)/i);
            if (hullMatch) { extracted.hull_no = hullMatch[1]; countExtracted++; }

            const nameMatch = fullText.match(/(?:MV\.|M\/V)\s*([A-Z0-9\s\-]{3,30})/i) || fullText.match(/\b(PRILLY|MUMBAI|IRIANA|BARUNA|KANYO|RYUOH)\b/i);
            if (nameMatch) { extracted.ship_name = trim(nameMatch[0]); countExtracted++; }

            const imoMatch = fullText.match(/IMO\s*(?:No\.?|Number)?\s*:?\s*(\d{7})/i) || fullText.match(/\b9\d{6}\b/) || fullText.match(/\b8\d{6}\b/);
            if (imoMatch) { extracted.imo_number = imoMatch[1] || imoMatch[0]; countExtracted++; }

            const typeMatch = fullText.match(/(?:Vessel\s*Type|Type\s*of\s*Vessel|Type)\s*:?\s*([A-Za-z0-9\s\-\(\)]+)/i)
                || fullText.match(/(Cement Carrier|Bulk Carrier|Tugboat|Deck Cargo Barge|Pneumatic Bulk Cement Carrier)/i);
            if (typeMatch) { extracted.vessel_type = trim(typeMatch[1]); countExtracted++; }

            const updateValues = {};
            detailedSpecKeys.forEach(key => {
                if (extracted[key]) {
                    updateValues[key] = extracted[key];
                }
            });

            const catMatch = autoSelectCategory(updateValues.vessel_type || extracted.vessel_type, updateValues.ship_name || extracted.ship_name, categoriesList);
            if (catMatch) {
                if (catMatch.category_id) updateValues.category_id = catMatch.category_id;
                if (catMatch.vessel_type) updateValues.vessel_type = catMatch.vessel_type;
            }

            const autoArea = autoDetectOperationalArea(updateValues, fullText);
            if (autoArea) {
                updateValues.operational_area = autoArea;
            }

            if (countExtracted > 0) {
                setData(prev => ({
                    ...prev,
                    ...updateValues,
                }));
                setCategoryError(null);
                setAreaError(null);
                setPdfError(null);
                setParseSuccessMessage(`PDF uploaded! Auto-filled ${countExtracted} vessel specification(s), category, and operational areas into the form.`);
            } else {
                setPdfError(null);
                setParseSuccessMessage('PDF uploaded & attached! No text specifications could be automatically parsed — please re-check or fill in vessel details manually.');
            }
        } catch (err) {
            console.error('PDF processing error:', err);
            setPdfError('The uploaded PDF does not appear to be a valid vessel specification document. Please check the file and try again.');
            setParseSuccessMessage(null);
        } finally {
            setParsingPdf(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setNameError(null);
        setImoError(null);
        setCategoryError(null);
        setAreaError(null);
        setImageError(null);
        setPdfError(null);

        let hasError = false;

        if (!data.ship_name?.trim()) {
            setNameError('The ship name field is required.');
            hasError = true;
        }

        const imoStr = String(data.imo_number || '').trim();
        if (!imoStr || !/^(IMO\s*)?\d{7}$/i.test(imoStr)) {
            setImoError('The IMO number must consist of 7 digits (e.g. 9123456 or IMO 9123456).');
            hasError = true;
        }

        if (!data.category_id && !data.vessel_type?.trim()) {
            setCategoryError('The vessel category field is required.');
            hasError = true;
        }

        if (!data.operational_area?.trim()) {
            setAreaError('The operational area field is required.');
            hasError = true;
        }

        if (!isEditing && !data.featured_image && !previewImage) {
            setImageError('The featured image field is required.');
            hasError = true;
        }

        if (hasError) {
            setActiveTab('basic');
            return;
        }

        const targetUrl = isEditing ? route('fleets.update', fleet.id) : route('fleets.store');
        post(targetUrl, {
            forceFormData: true,
            preserveScroll: false,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Ship className="w-3.5 h-3.5" /> FLEET & MARITIME OPERATIONS
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            {isEditing ? `Edit Ship: ${fleet.ship_name}` : 'Add New Vessel Specs'}
                        </h2>
                    </div>

                    <Link
                        href={route('fleets.index')}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#404750] bg-white border border-[#E5E7EB] px-4 py-2.5 rounded-[8px] hover:bg-slate-50 hover:text-[#141B2C] transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Fleet Overview
                    </Link>
                </div>
            }
        >
            <Head title={`${isEditing ? 'Edit Ship' : 'Add Vessel'} - PT. PABB`} />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 space-y-6">

                    <form onSubmit={handleSubmit} className="bg-[#FFFFFF] rounded-[10px] border border-[#E5E7EB] shadow-sm overflow-hidden">

                        {/* 2 Clean Tab Header Navigation */}
                        <div className="flex  border-[#E5E7EB] bg-[#F5F5F5]/50 px-6 pt-4 space-x-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('basic')}
                                className={`pb-3 px-6 text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'basic'
                                        ? 'border-[#00629D] border-b-2  text-[#00629D] bg-white rounded-t-[8px]'
                                        : 'transparent text-[#404750] hover:text-[#141B2C]'
                                    }`}
                            >
                                Basic Info
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('detailed')}
                                className={`pb-3 px-6 text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'detailed'
                                        ? 'border-[#00629D] border-b-2  text-[#00629D] bg-white rounded-t-[8px]'
                                        : 'ransparent text-[#404750] hover:text-[#141B2C]'
                                    }`}
                            >
                                Detailed Specs
                            </button>
                        </div>

                        <div className="p-6 sm:p-8">

                            {/* TAB 1: BASIC INFO */}
                            <div className={activeTab === 'basic' ? 'space-y-6' : 'hidden'}>

                                    {/* 1. AI PDF File Input */}
                                    <div className=" border-[#E5E7EB]">
                                        <label className="text-xs font-bold text-[#141B2C] mb-1.5 flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                            Ship Particular Document (PDF) - AI Intelligent Auto-Fill
                                        </label>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handlePdfUpload}
                                            className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 file:mr-4 file:py-1.5 file:px-3 file:rounded-[6px] file:border-0 file:text-xs file:font-semibold file:bg-[#00629D] file:text-white hover:file:bg-[#3F96DD] cursor-pointer"
                                        />
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Upload a PDF specification sheet. AI will automatically extract and fill in vessel specifications. Please re-check all fields after uploading.
                                        </p>
                                        {(pdfError || errors.ship_particular_pdf) && (
                                            <p className="text-xs text-red-500 mt-1.5 font-medium">{pdfError || errors.ship_particular_pdf}</p>
                                        )}

                                        {parsingPdf && (
                                            <p className="text-xs font-semibold text-[#00629D] mt-2 flex items-center gap-1.5">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00629D]" /> AI model is analyzing PDF document...
                                            </p>
                                        )}

                                        {parseSuccessMessage && (
                                            <div className="mt-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-[6px] flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <span>{parseSuccessMessage}</span>
                                            </div>
                                        )}

                                        {data.ship_particular_pdf instanceof File && (
                                            <div className="mt-2.5 flex items-center justify-between bg-sky-50 border border-sky-200 rounded-[8px] p-3">
                                                <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#00629D] font-bold">
                                                    <FileText className="w-4 h-4 text-[#00629D] shrink-0" />
                                                    <span className="truncate max-w-[260px] sm:max-w-[360px]">
                                                        Attached PDF: {data.ship_particular_pdf.name} ({(data.ship_particular_pdf.size / 1024).toFixed(1)} KB)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const url = URL.createObjectURL(data.ship_particular_pdf);
                                                            window.open(url, '_blank');
                                                        }}
                                                        className="text-xs font-semibold text-[#00629D] hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        View PDF
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('ship_particular_pdf', null)}
                                                        className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {fleet?.ship_particular_pdf && !data.ship_particular_pdf && (
                                            <div className="mt-2.5 flex items-center justify-between bg-[#F5F5F5] border border-[#E5E7EB] rounded-[8px] p-3">
                                                <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#00629D] font-bold">
                                                    <FileText className="w-4 h-4 text-[#00629D] shrink-0" />
                                                    <span className="truncate max-w-[300px] sm:max-w-[400px]">
                                                        Current File: {fleet.ship_particular_pdf.split('/').pop()}
                                                    </span>
                                                </div>
                                                <a
                                                    href={fleet.ship_particular_pdf.startsWith('/documents/') || fleet.ship_particular_pdf.startsWith('/storage/') ? fleet.ship_particular_pdf : `/documents/fleets/${fleet.ship_particular_pdf}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-semibold text-[#00629D] hover:underline flex items-center gap-1 shrink-0"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View PDF
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                                Ship Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.ship_name}
                                                onChange={(e) => setData('ship_name', e.target.value.slice(0, 255))}
                                                placeholder="e.g. MV. PRILLY / MV. MUMBAI"
                                                maxLength={255}
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                            {(data.ship_name || '').length >= 255 && (
                                                <p className="text-xs text-amber-600 mt-1 font-medium">Maximum limit reached (255 chars).</p>
                                            )}
                                            {(nameError || errors.ship_name) && <p className="text-xs text-red-500 mt-1 font-medium">{nameError || errors.ship_name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                                IMO Number <span className="text-red-500">*</span> <span className="text-slate-400 font-normal">(7 digits)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.imo_number}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    if (/^imo/i.test(val)) {
                                                        const digits = val.replace(/\D/g, '').slice(0, 7);
                                                        setData('imo_number', digits ? `IMO ${digits}` : 'IMO ');
                                                    } else {
                                                        const digits = val.replace(/\D/g, '').slice(0, 7);
                                                        setData('imo_number', digits);
                                                    }
                                                }}
                                                placeholder="e.g. 9123456 or IMO 9123456"
                                                title="IMO number must be 7 digits (e.g. 9123456 or IMO 9123456)"
                                                maxLength={11}
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                            {(imoError || errors.imo_number) && <p className="text-xs text-red-500 mt-1 font-medium">{imoError || errors.imo_number}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                                Status <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                            >
                                                <option value="in_service">In Service</option>
                                                <option value="available">Available</option>
                                                <option value="in_docking">In Docking</option>
                                                <option value="maintenance">Maintenance</option>
                                                <option value="chartered">Chartered</option>
                                            </select>
                                        </div>

                                        {/* Dynamic Vessel Category Dropdown with "+ Add Category" button */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-xs font-bold text-[#141B2C]">
                                                    Vessel Type / Category <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    {data.category_id && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowDeleteCatModal(true)}
                                                            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                                                            title="Delete selected category"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete Category
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCategoryModal(true)}
                                                        className="text-xs font-bold text-[#00629D] hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" /> Add Category
                                                    </button>
                                                </div>
                                            </div>
                                            <select
                                                value={data.category_id || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '__ADD_NEW__') {
                                                        setShowCategoryModal(true);
                                                    } else {
                                                        const cat = categoriesList.find(c => String(c.id) === String(val));
                                                        if (cat) {
                                                            setData({
                                                                ...data,
                                                                category_id: cat.id,
                                                                vessel_type: cat.name,
                                                            });
                                                        } else {
                                                            setData({
                                                                ...data,
                                                                category_id: '',
                                                                vessel_type: val,
                                                            });
                                                        }
                                                    }
                                                }}
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                            >
                                                <option value="">-- Select Vessel Category --</option>
                                                {categoriesList.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                                {/* Fallback default options if DB has none */}
                                                {categoriesList.length === 0 && (
                                                    <>
                                                        <option value="Cement Carrier">Pneumatic Bulk Cement Carrier</option>
                                                        <option value="Tugboat">Twin-Screw Ocean Tugboat</option>
                                                        <option value="Deck Barge">Deck Cargo Barge</option>
                                                    </>
                                                )}
                                                <option value="__ADD_NEW__" className="font-bold text-[#00629D] bg-blue-50">
                                                    + Add Category...
                                                </option>
                                            </select>
                                            {(categoryError || errors.vessel_type || errors.category_id) && (
                                                <p className="text-xs text-red-500 mt-1 font-medium">{categoryError || errors.vessel_type || errors.category_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Operational Area & Featured Image Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Left Column: Operational Area & Sailink Device IP */}
                                        <div className="space-y-4">
                                            {/* Operational Area Selection (Dropdown Checkbox) */}
                                            <div ref={areaDropdownRef} className="relative">
                                                <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                                    Operational Area <span className="text-red-500">*</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                                                    className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 bg-white text-left flex items-center justify-between focus:border-[#00629D] focus:ring-1 focus:ring-[#00629D] transition-colors cursor-pointer"
                                                >
                                                    <span className="truncate text-[#141B2C] font-medium">
                                                        {selectedAreas.length > 0
                                                            ? selectedAreas.join(', ')
                                                            : '-- Select Operational Area(s) --'}
                                                    </span>
                                                    <ChevronDown className={`w-4 h-4 text-[#404750] shrink-0 transition-transform duration-200 ${isAreaDropdownOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                {isAreaDropdownOpen && (
                                                    <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-[8px] shadow-lg p-2 max-h-56 overflow-y-auto space-y-1">
                                                        {operationalAreasList.map((area) => {
                                                            const checked = selectedAreas.includes(area);
                                                            return (
                                                                <label
                                                                    key={area}
                                                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs cursor-pointer transition-colors ${
                                                                        checked ? 'bg-[#00629D]/10 text-[#00629D] font-bold' : 'hover:bg-slate-50 text-[#141B2C]'
                                                                    }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={checked}
                                                                        onChange={() => toggleOperationalArea(area)}
                                                                        className="rounded border-[#E5E7EB] text-[#00629D] focus:ring-[#00629D] cursor-pointer"
                                                                    />
                                                                    <span>{area}</span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {(areaError || errors.operational_area) && (
                                                    <p className="text-xs text-red-500 mt-1 font-medium">{areaError || errors.operational_area}</p>
                                                )}
                                            </div>

                                            {/* Sailink Device IP */}
                                            <div>
                                                <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                                    Sailink Device IP
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.ip_address}
                                                    onChange={(e) => setData('ip_address', e.target.value)}
                                                    placeholder="e.g. 10.161.126.81"
                                                    className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                                />
                                                {errors.ip_address && (
                                                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.ip_address}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Featured Vessel Image Upload & Preview */}
                                        <div>
                                            <div>
                                                <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                                    Featured Image <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    required={!isEditing && !previewImage}
                                                    className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 file:mr-4 file:py-1.5 file:px-3 file:rounded-[6px] file:border-0 file:text-xs file:font-semibold file:bg-[#00629D] file:text-white hover:file:bg-[#3F96DD] cursor-pointer"
                                                />
                                                <p className="text-[11px] text-slate-400 mt-1">Max 5MB, JPG / PNG / WEBP format</p>
                                                {(imageError || errors.featured_image) && (
                                                    <p className="text-xs text-red-500 mt-1.5 font-medium">{imageError || errors.featured_image}</p>
                                                )}
                                            </div>

                                            {previewImage && (
                                                <div className="mt-3">
                                                    <span className="text-xs font-bold text-[#141B2C] block mb-1">Current Image Preview:</span>
                                                    <div className="w-full aspect-[16/10] rounded-[8px] border border-[#E5E7EB] overflow-hidden bg-[#141B2C] shadow-inner relative">
                                                        <img src={previewImage} alt="Vessel Preview" className="w-full h-full object-cover" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Vessel Description Field */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-xs font-bold text-[#141B2C]">
                                                Vessel Description & Overview
                                            </label>
                                            <span className={`font-['JetBrains_Mono'] text-[11px] ${(data.description || '').length >= 190 ? 'text-amber-600 font-bold' : 'text-[#8AAFC8]'
                                                }`}>
                                                {(data.description || '').length} / 200 chars
                                            </span>
                                        </div>
                                        <textarea
                                            value={data.description || ''}
                                            onChange={(e) => setData('description', e.target.value.slice(0, 200))}
                                            maxLength={200}
                                            rows={3}
                                            placeholder="General overview, vessel features, primary trading operational notes (max 200 characters)..."
                                            className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D] leading-relaxed font-normal"
                                        />
                                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-6  border-[#E5E7EB] flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('detailed')}
                                            className="inline-flex items-center gap-2 bg-[#00629D] hover:bg-[#3F96DD] text-white text-xs font-semibold px-5 py-2.5 rounded-[6px] transition-[colors,shadow,opacity,transform] cursor-pointer"
                                        >
                                            Next: Detailed Specs
                                            <ArrowRight className="w-4 h-4" />
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-2.5 rounded-[6px] transition-[colors,shadow,opacity,transform] shadow-sm cursor-pointer"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {isEditing ? 'Update Ship' : 'Save Ship'}
                                        </button>
                                    </div>
                                </div>

                            {/* TAB 2: DETAILED SPECS */}
                            <div className={activeTab === 'detailed' ? 'space-y-6' : 'hidden'}>

                                    {/* 2. Primary Tonnage & Capacity Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Build Year</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={data.build_year}
                                                onChange={handleIntInput('build_year', 4)}
                                                placeholder="e.g. 1989"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Deadweight (DWT - t)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={data.dwt}
                                                onChange={handleDecInput('dwt', 12)}
                                                placeholder="e.g. 4235.00"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Hold / Cargo Capacity (M3 / MT)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={data.capacity}
                                                onChange={handleDecInput('capacity', 12)}
                                                placeholder="e.g. 3577.14"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>
                                    </div>

                                    {/* 3. Tonnage & Speed Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Gross Tonnage (GT)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={data.gross_tonnage}
                                                onChange={handleDecInput('gross_tonnage', 12)}
                                                placeholder="e.g. 2264"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Net Tonnage (NT)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={data.net_tonnage}
                                                onChange={handleDecInput('net_tonnage', 12)}
                                                placeholder="e.g. 680"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Light Ship (t)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={data.light_ship}
                                                onChange={handleDecInput('light_ship', 12)}
                                                placeholder="e.g. 1197"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Avg Ship Speed (Knots)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={data.speed}
                                                onChange={handleDecInput('speed', 6)}
                                                placeholder="e.g. 10.0"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>
                                    </div>

                                    {/* 4. Flag, Registry & Class Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Flag State / Nationality</label>
                                            <input
                                                type="text"
                                                value={data.flag}
                                                onChange={(e) => setData('flag', e.target.value)}
                                                placeholder="e.g. INDONESIA"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Port of Registry</label>
                                            <input
                                                type="text"
                                                value={data.port_of_registry}
                                                onChange={(e) => setData('port_of_registry', e.target.value)}
                                                placeholder="e.g. Jakarta / Ulaan Baatar"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Classification Society</label>
                                            <input
                                                type="text"
                                                value={data.classification_society}
                                                onChange={(e) => setData('classification_society', e.target.value)}
                                                placeholder="e.g. RINA / BKI / NK"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>
                                    </div>

                                    {/* 5. Identification Numbers Grid (Call Sign, MMSI, Hull No., Summer Draft) */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Call Sign</label>
                                            <input
                                                type="text"
                                                value={data.call_sign}
                                                onChange={(e) => setData('call_sign', e.target.value)}
                                                placeholder="e.g. JVTW8 / YBDL2"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">MMSI Number</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={data.mmsi}
                                                onChange={handleIntInput('mmsi', 9)}
                                                placeholder="e.g. 525012357"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Hull Number</label>
                                            <input
                                                type="text"
                                                value={data.hull_no}
                                                onChange={(e) => setData('hull_no', e.target.value)}
                                                placeholder="e.g. 323 / OE-170"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Summer Draft (m)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={data.summer_draft}
                                                onChange={handleDecInput('summer_draft', 6)}
                                                placeholder="e.g. 5.95"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>
                                    </div>

                                    {/* 6. Vessel Dimensions Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">LOA (m)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={data.loa}
                                                onChange={handleDecInput('loa', 8)}
                                                placeholder="e.g. 91.00"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">LBP (m)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={data.lbp}
                                                onChange={handleDecInput('lbp', 8)}
                                                placeholder="e.g. 85.00"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Breadth (m)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={data.breadth}
                                                onChange={handleDecInput('breadth', 8)}
                                                placeholder="e.g. 14.50"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Depth (m)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={data.depth}
                                                onChange={handleDecInput('depth', 8)}
                                                placeholder="e.g. 7.20"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-6  border-[#E5E7EB] flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('basic')}
                                            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-xs font-semibold px-5 py-2.5 rounded-[6px] transition-[colors,shadow,opacity,transform] cursor-pointer"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Previous: Basic Info
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-2.5 rounded-[6px] transition-[colors,shadow,opacity,transform] shadow-sm cursor-pointer"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {isEditing ? 'Update Ship' : 'Save Ship'}
                                        </button>
                                    </div>

                                </div>

                        </div>
                    </form>

                </div>
            </div>

            {/* ADD CATEGORY MODAL DIALOG */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-['Hanken_Grotesk'] animate-in fade-in duration-200">
                    <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-2xl max-w-md w-full p-6 space-y-5">

                        <div className="flex items-center justify-between  border-[#E5E7EB] pb-3">
                            <h3 className="text-base font-bold text-[#141B2C] flex items-center gap-2">
                                <Plus className="w-4 h-4 text-[#00629D]" />
                                Add New Vessel Category
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCategoryModal(false);
                                    setCatError(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {catError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-[6px]">
                                {catError}
                            </div>
                        )}

                        <form onSubmit={handleAddCategorySubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value.slice(0, 255))}
                                    maxLength={255}
                                    placeholder="e.g. Chemical Tanker, Floating Crane, Offshore Tug"
                                    required
                                    className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                                {(newCatName || '').length >= 255 && (
                                    <p className="text-xs text-amber-600 mt-1 font-medium">Maximum limit reached (255 chars).</p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-[#141B2C]">
                                        Category Description <span className="text-slate-400 font-normal">(Optional)</span>
                                    </label>
                                    <span className={`font-['JetBrains_Mono'] text-[11px] ${(newCatDesc || '').length >= 450 ? 'text-amber-600 font-bold' : 'text-[#8AAFC8]'}`}>
                                        {(newCatDesc || '').length} / 500 chars
                                    </span>
                                </div>
                                <textarea
                                    value={newCatDesc}
                                    onChange={(e) => setNewCatDesc(e.target.value.slice(0, 500))}
                                    maxLength={500}
                                    rows={3}
                                    placeholder="Short description of this vessel category fleet..."
                                    className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>

                            <div className="pt-3  border-[#E5E7EB] flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCategoryModal(false);
                                        setCatError(null);
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-xs font-semibold px-4 py-2 rounded-[6px] transition-[colors,shadow,opacity,transform] cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingCat || !newCatName.trim()}
                                    className="inline-flex items-center gap-1.5 bg-[#00629D] hover:bg-[#3F96DD] text-white text-xs font-semibold px-5 py-2 rounded-[6px] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                                >
                                    {submittingCat ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-3.5 h-3.5" />
                                            Save Category
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Existing Categories List with Individual Delete Buttons */}
                        {/* {categoriesList.length > 0 && (
                            <div className="pt-4  border-[#E5E7EB] space-y-2">
                                <label className="block text-xs font-bold text-[#141B2C]">
                                    Existing Vessel Categories ({categoriesList.length})
                                </label>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                    {categoriesList.map((cat) => (
                                        <div key={cat.id} className="flex items-center justify-between p-2.5 border border-[#E5E7EB] rounded-[8px]">
                                            <div>
                                                <p className="text-xs font-bold text-[#141B2C]">{cat.name}</p>
                                                {cat.description && (
                                                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{cat.description}</p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCategoryToDelete(cat)}
                                                className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-[6px] transition-colors cursor-pointer"
                                                title={`Delete ${cat.name}`}
                                            >
                                                <Trash2 className="w-4 h-4 text-rose-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}

                    </div>
                </div>
            )}

            {/* DELETE CATEGORY CONFIRMATION MODAL */}
            {(showDeleteCatModal || categoryToDelete) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-['Hanken_Grotesk'] animate-in fade-in duration-200">
                    <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-2xl max-w-md w-full p-6 space-y-5">
                        <div className="flex items-center justify-between  border-[#E5E7EB] pb-3">
                            <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                                Confirm Category Deletion
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteCatModal(false);
                                    setCategoryToDelete(null);
                                    setDeleteCatError(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {deleteCatError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-[6px]">
                                {deleteCatError}
                            </div>
                        )}

                        <p className="text-xs text-[#141B2C] leading-relaxed">
                            Are you sure you want to delete the category <span className="font-bold text-rose-600">{categoryToDelete?.name || categoriesList.find(c => String(c.id) === String(data.category_id))?.name || data.vessel_type}</span>? This action is permanent and cannot be undone.
                        </p>

                        <div className="pt-3  border-[#E5E7EB] flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteCatModal(false);
                                    setCategoryToDelete(null);
                                    setDeleteCatError(null);
                                }}
                                disabled={deletingCat}
                                className="bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-xs font-semibold px-4 py-2 rounded-[6px] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteCategorySubmit}
                                disabled={deletingCat}
                                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-5 py-2 rounded-[6px] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                            >
                                {deletingCat ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete Category
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
