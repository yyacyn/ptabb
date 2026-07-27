import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Ship, ArrowLeft, ArrowRight, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Edit({ fleet = null, categories = [] }) {
    const [activeTab, setActiveTab] = useState('basic');

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
        flag: fleet?.flag || (isEditing ? '' : 'INDONESIA'),
        classification_society: fleet?.classification_society || (isEditing ? '' : 'BKI / RINA'),
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const targetUrl = isEditing ? route('fleets.update', fleet.id) : route('fleets.store');
        post(targetUrl);
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
                    
                    <form onSubmit={handleSubmit} className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-sm overflow-hidden">
                        
                        {/* Tab Header Navigation */}
                        <div className="flex border-b border-[#E5E7EB] bg-[#F5F5F5]/50 px-6 pt-4">
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
                                                placeholder="e.g. MV. MUMBAI / MV. IRIANA"
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
                                                placeholder="e.g. 6655778"
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

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                                Vessel Type / Category
                                            </label>
                                            <select
                                                value={data.vessel_type}
                                                onChange={(e) => setData('vessel_type', e.target.value)}
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                            >
                                                <option value="Cement Carrier">Pneumatic Bulk Cement Carrier</option>
                                                <option value="Tugboat">Twin-Screw Ocean Tugboat</option>
                                                <option value="Deck Barge">Deck Cargo Barge</option>
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
                                        <p className="text-[11px] text-slate-400 mt-1">Select one or multiple operational trade areas</p>
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

                                    {/* Navigation Action Buttons */}
                                    <div className="pt-6 border-t border-[#E5E7EB] flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('detailed')}
                                            className="inline-flex items-center gap-2 bg-[#00629D] hover:bg-[#3F96DD] text-white text-xs font-semibold px-5 py-2.5 rounded-[6px] transition-all"
                                        >
                                            Next: Detailed Specs
                                            <ArrowRight className="w-4 h-4" />
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-2.5 rounded-[6px] transition-all shadow-sm"
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
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Build Year</label>
                                            <input
                                                type="number"
                                                value={data.build_year}
                                                onChange={(e) => setData('build_year', e.target.value)}
                                                placeholder="e.g. 2015"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Deadweight (DWT)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.dwt}
                                                onChange={(e) => setData('dwt', e.target.value)}
                                                placeholder="e.g. 10723"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Cargo Capacity (MT)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.capacity}
                                                onChange={(e) => setData('capacity', e.target.value)}
                                                placeholder="e.g. 8860"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Gross Tonnage (GT)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.gross_tonnage}
                                                onChange={(e) => setData('gross_tonnage', e.target.value)}
                                                placeholder="e.g. 7200"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Net Tonnage (NT)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.net_tonnage}
                                                onChange={(e) => setData('net_tonnage', e.target.value)}
                                                placeholder="e.g. 3500"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Speed (Knots)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={data.speed}
                                                onChange={(e) => setData('speed', e.target.value)}
                                                placeholder="e.g. 11.5"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Flag State</label>
                                            <input
                                                type="text"
                                                value={data.flag}
                                                onChange={(e) => setData('flag', e.target.value)}
                                                placeholder="e.g. Indonesia"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Classification Society</label>
                                            <input
                                                type="text"
                                                value={data.classification_society}
                                                onChange={(e) => setData('classification_society', e.target.value)}
                                                placeholder="e.g. BKI / RINA / ABS"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>
                                    </div>

                                    {/* Dimensions */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-[#141B2C] mb-1.5">LOA (m)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.loa}
                                                onChange={(e) => setData('loa', e.target.value)}
                                                placeholder="e.g. 118.5"
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
                                                placeholder="e.g. 110.0"
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
                                                placeholder="e.g. 20.0"
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
                                                placeholder="e.g. 9.5"
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 font-['JetBrains_Mono'] focus:border-[#00629D] focus:ring-[#00629D]"
                                            />
                                        </div>
                                    </div>

                                    {/* Particular PDF Upload */}
                                    <div>
                                        <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                            Ship Particular PDF Document
                                        </label>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => setData('ship_particular_pdf', e.target.files[0])}
                                            className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 file:mr-4 file:py-1.5 file:px-3 file:rounded-[6px] file:border-0 file:text-xs file:font-semibold file:bg-[#00629D] file:text-white hover:file:bg-[#3F96DD] cursor-pointer"
                                        />
                                        <p className="text-[11px] text-slate-400 mt-1">PDF format only, maximum 10MB file size</p>

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

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-bold text-[#141B2C] mb-1.5">Vessel & Engine Description</label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={3}
                                            placeholder="Engine specs, discharge rate, cargo gear details..."
                                            className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D]"
                                        />
                                    </div>

                                    {/* Navigation Action Buttons */}
                                    <div className="pt-6 border-t border-[#E5E7EB] flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('basic')}
                                            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-xs font-semibold px-5 py-2.5 rounded-[6px] transition-all"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Previous: Basic Info
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-2.5 rounded-[6px] transition-all shadow-sm"
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
        </AuthenticatedLayout>
    );
}
