import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Ship, ArrowLeft, ArrowRight, FileText, CheckCircle2, Loader2, Sparkles, Plus, X } from 'lucide-react';
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
        operational_area: fleet?.operational_area || (isEditing ? '' : 'Asia, Southeast Asia'),
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('featured_image', file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Modal Action to Add a New Vessel Category
    const handleAddCategorySubmit = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        setSubmittingCat(true);
        setCatError(null);

        try {
            const res = await axios.post(route('fleets.categories.store'), {
                name: newCatName.trim(),
                description: newCatDesc.trim(),
            });

            if (res.data && res.data.category) {
                const newCat = res.data.category;
                const updatedList = res.data.categories || [...categoriesList, newCat];
                
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
            }
        } catch (err) {
            console.error('Error adding category:', err);
            setCatError(err.response?.data?.errors?.name?.[0] || 'Failed to add vessel category. Please try again.');
        } finally {
            setSubmittingCat(false);
        }
    };

    // AI PDF Specification Parser with OpenRouter + Local Fallback
    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setData('ship_particular_pdf', file);
        setParsingPdf(true);
        setParseSuccessMessage(null);

        const formData = new FormData();
        formData.append('ship_particular_pdf', file);

        const detailedSpecKeys = [
            'loa', 'lbp', 'breadth', 'depth', 'dwt', 'capacity',
            'gross_tonnage', 'net_tonnage', 'light_ship', 'summer_draft',
            'build_year', 'flag', 'classification_society', 'port_of_registry',
            'call_sign', 'mmsi', 'hull_no', 'speed'
        ];

        try {
            const aiRes = await axios.post(route('fleets.parse-pdf'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (aiRes.data && aiRes.data.success && aiRes.data.data) {
                const parsed = aiRes.data.data;
                detailedSpecKeys.forEach(k => {
                    if (parsed[k] !== undefined && parsed[k] !== null && parsed[k] !== '') {
                        setData(k, parsed[k]);
                    }
                });

                setParseSuccessMessage(`AI parsed PDF successful! Detailed specs auto-populated.`);
                setParsingPdf(false);
                return;
            }
        } catch (err) {
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

            detailedSpecKeys.forEach(key => {
                if (extracted[key]) {
                    setData(key, extracted[key]);
                }
            });

            setParseSuccessMessage(`PDF uploaded! Auto-filled ${countExtracted} detailed vessel specifications into the form. Please re-check all fields to ensure accuracy.`);
        } catch (err) {
            console.error('PDF processing error:', err);
            setParseSuccessMessage('PDF uploaded successfully. Please review and complete detailed specifications.');
        } finally {
            setParsingPdf(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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
                        <Link 
                            href={route('fleets.index')}
                            className="font-['JetBrains_Mono'] text-xs font-bold text-[#00629D] hover:underline uppercase tracking-wider mb-1 flex items-center gap-1.5"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Fleet List
                        </Link>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight flex items-center gap-2">
                            <Ship className="w-6 h-6 text-[#00629D]" />
                            {isEditing ? `Edit Ship: ${fleet.ship_name}` : 'Add New Vessel Specs'}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={`${isEditing ? 'Edit Ship' : 'Add Vessel'} — PT. ABB`} />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 space-y-6">
                    
                    <form onSubmit={handleSubmit} className="bg-[#FFFFFF] rounded-[10px] border border-[#E5E7EB] shadow-sm overflow-hidden">
                        
                        {/* 2 Clean Tab Header Navigation */}
                        <div className="flex border-b border-[#E5E7EB] bg-[#F5F5F5]/50 px-6 pt-4 space-x-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('basic')}
                                className={`pb-3 px-6 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                                    activeTab === 'basic' 
                                        ? 'border-[#00629D] text-[#00629D] bg-white rounded-t-[8px]' 
                                        : 'border-transparent text-[#404750] hover:text-[#141B2C]'
                                }`}
                            >
                                Basic Info
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('detailed')}
                                className={`pb-3 px-6 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                                    activeTab === 'detailed' 
                                        ? 'border-[#00629D] text-[#00629D] bg-white rounded-t-[8px]' 
                                        : 'border-transparent text-[#404750] hover:text-[#141B2C]'
                                }`}
                            >
                                Detailed Specs
                            </button>
                        </div>

                        <div className="p-6 sm:p-8">
                            
                            {/* TAB 1: BASIC INFO */}
                            {activeTab === 'basic' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                                Ship Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.ship_name}
                                                onChange={(e) => setData('ship_name', e.target.value)}
                                                placeholder="e.g. MV. PRILLY / MV. MUMBAI"
                                                required
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                            {errors.ship_name && <p className="text-xs text-red-500 mt-1">{errors.ship_name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                                IMO Number <span className="text-red-500">*</span> <span className="text-slate-400 font-normal">(7 digits)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.imo_number}
                                                onChange={(e) => setData('imo_number', e.target.value)}
                                                placeholder="e.g. 8816364"
                                                required
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                            {errors.imo_number && <p className="text-xs text-red-500 mt-1">{errors.imo_number}</p>}
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
                                                    Vessel Type / Category
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCategoryModal(true)}
                                                    className="text-xs font-bold text-[#00629D] hover:underline flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add Category
                                                </button>
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
                                                    + Add New Category...
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Operational Area Selection */}
                                    <div>
                                        <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                            Operational Area <span className="text-red-500">*</span>
                                        </label>
                                        <div className="border border-[#E5E7EB] rounded-[8px] p-3 max-h-40 overflow-y-auto space-y-1.5 bg-[#F5F5F5]/30">
                                            {operationalAreasList.map((area) => {
                                                const checked = selectedAreas.includes(area);
                                                return (
                                                    <label key={area} className="flex items-center gap-2 text-xs text-[#141B2C] cursor-pointer hover:text-[#00629D]">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleOperationalArea(area)}
                                                            className="rounded border-[#E5E7EB] text-[#00629D] focus:ring-[#00629D]"
                                                        />
                                                        <span>{area}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Vessel Description Field */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-xs font-bold text-[#141B2C]">
                                                Vessel Description & Overview
                                            </label>
                                            <span className={`font-['JetBrains_Mono'] text-[11px] ${
                                                (data.description || '').length >= 190 ? 'text-amber-600 font-bold' : 'text-[#8AAFC8]'
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

                                    {/* Featured Vessel Image Upload & Preview */}
                                    <div>
                                        <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                            Featured Image <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 file:mr-4 file:py-1.5 file:px-3 file:rounded-[6px] file:border-0 file:text-xs file:font-semibold file:bg-[#00629D] file:text-white hover:file:bg-[#3F96DD] cursor-pointer"
                                        />
                                        <p className="text-[11px] text-slate-400 mt-1">Max 5MB, JPG / PNG / WEBP format</p>

                                        {previewImage && (
                                            <div className="mt-3">
                                                <span className="text-xs font-bold text-[#141B2C] block mb-1">Current Image Preview:</span>
                                                <div className="w-64 h-36 rounded-[8px] border border-[#E5E7EB] overflow-hidden bg-slate-100 shadow-inner">
                                                    <img src={previewImage} alt="Vessel Preview" className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-6 border-t border-[#E5E7EB] flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('detailed')}
                                            className="inline-flex items-center gap-2 bg-[#00629D] hover:bg-[#3F96DD] text-white text-xs font-semibold px-5 py-2.5 rounded-[6px] transition-all cursor-pointer"
                                        >
                                            Next: Detailed Specs
                                            <ArrowRight className="w-4 h-4" />
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-2.5 rounded-[6px] transition-all shadow-sm cursor-pointer"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {isEditing ? 'Update Ship' : 'Save Ship'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: DETAILED SPECS */}
                            {activeTab === 'detailed' && (
                                <div className="space-y-6">
                                    
                                    {/* 1. AI PDF File Input */}
                                    <div className="pb-6 border-b border-[#E5E7EB]">
                                        <label className="text-xs font-bold text-[#141B2C] mb-1.5 flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                            Ship Particular Document (PDF) — AI Intelligent Auto-Fill
                                        </label>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handlePdfUpload}
                                            className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 file:mr-4 file:py-1.5 file:px-3 file:rounded-[6px] file:border-0 file:text-xs file:font-semibold file:bg-[#00629D] file:text-white hover:file:bg-[#3F96DD] cursor-pointer"
                                        />
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Upload a PDF specification sheet. AI will automatically extract and fill in detailed specs below. Please re-check all fields after uploading.
                                        </p>

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

                                        {fleet?.ship_particular_pdf && (
                                            <div className="mt-2.5 flex items-center justify-between bg-[#F5F5F5] border border-[#E5E7EB] rounded-[8px] p-3">
                                                <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#00629D] font-bold">
                                                    <FileText className="w-4 h-4 text-[#00629D] shrink-0" />
                                                    <span className="truncate max-w-[320px] sm:max-w-[420px]">
                                                        Current File: {fleet.ship_particular_pdf.split('/').pop()}
                                                    </span>
                                                </div>
                                                <a 
                                                    href={fleet.ship_particular_pdf.startsWith('/documents/') || fleet.ship_particular_pdf.startsWith('/storage/') ? fleet.ship_particular_pdf : `/documents/fleets/${fleet.ship_particular_pdf}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-semibold text-[#00629D] hover:underline flex items-center gap-1 shrink-0"
                                                >
                                                    View PDF Document &rarr;
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. Primary Tonnage & Capacity Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Build Year</label>
                                            <input
                                                type="number"
                                                value={data.build_year}
                                                onChange={(e) => setData('build_year', e.target.value)}
                                                placeholder="e.g. 1989"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Deadweight (DWT - t)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.dwt}
                                                onChange={(e) => setData('dwt', e.target.value)}
                                                placeholder="e.g. 4235.00"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Hold / Cargo Capacity (M3 / MT)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.capacity}
                                                onChange={(e) => setData('capacity', e.target.value)}
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
                                                type="number"
                                                step="0.01"
                                                value={data.gross_tonnage}
                                                onChange={(e) => setData('gross_tonnage', e.target.value)}
                                                placeholder="e.g. 2264"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Net Tonnage (NT)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.net_tonnage}
                                                onChange={(e) => setData('net_tonnage', e.target.value)}
                                                placeholder="e.g. 680"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Light Ship (t)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.light_ship}
                                                onChange={(e) => setData('light_ship', e.target.value)}
                                                placeholder="e.g. 1197"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Avg Ship Speed (Knots)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={data.speed}
                                                onChange={(e) => setData('speed', e.target.value)}
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
                                                value={data.mmsi}
                                                onChange={(e) => setData('mmsi', e.target.value)}
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
                                                type="number"
                                                step="0.01"
                                                value={data.summer_draft}
                                                onChange={(e) => setData('summer_draft', e.target.value)}
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
                                                type="number"
                                                step="0.01"
                                                value={data.loa}
                                                onChange={(e) => setData('loa', e.target.value)}
                                                placeholder="e.g. 91.00"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">LBP (m)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.lbp}
                                                onChange={(e) => setData('lbp', e.target.value)}
                                                placeholder="e.g. 85.00"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Breadth (m)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.breadth}
                                                onChange={(e) => setData('breadth', e.target.value)}
                                                placeholder="e.g. 14.50"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Depth (m)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.depth}
                                                onChange={(e) => setData('depth', e.target.value)}
                                                placeholder="e.g. 7.20"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-6 border-t border-[#E5E7EB] flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('basic')}
                                            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-xs font-semibold px-5 py-2.5 rounded-[6px] transition-all cursor-pointer"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Previous: Basic Info
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-2.5 rounded-[6px] transition-all shadow-sm cursor-pointer"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {isEditing ? 'Update Ship' : 'Save Ship'}
                                        </button>
                                    </div>

                                </div>
                            )}

                        </div>
                    </form>

                </div>
            </div>

            {/* ADD CATEGORY MODAL DIALOG */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-['Hanken_Grotesk'] animate-in fade-in duration-200">
                    <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-2xl max-w-md w-full p-6 space-y-5">
                        
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
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
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    placeholder="e.g. Chemical Tanker, Floating Crane, Offshore Tug"
                                    required
                                    className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                    Category Description <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    value={newCatDesc}
                                    onChange={(e) => setNewCatDesc(e.target.value)}
                                    rows={3}
                                    placeholder="Short description of this vessel category fleet..."
                                    className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>

                            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCategoryModal(false);
                                        setCatError(null);
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-xs font-semibold px-4 py-2 rounded-[6px] transition-all cursor-pointer"
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

                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
