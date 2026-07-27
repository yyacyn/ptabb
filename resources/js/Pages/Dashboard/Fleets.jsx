import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Ship, Plus, Search, FileText, Edit2, Image as ImageIcon } from 'lucide-react';

export default function Fleets({ fleets = [] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const getVesselImage = (vessel) => {
        if (!vessel) return '/images/card_bulk_vessel.png';
        const img = vessel.featured_image;
        if (!img) return '/images/card_bulk_vessel.png';
        
        if (img.startsWith('http://') || img.startsWith('https://')) return img;
        if (img.startsWith('/images/') || img.startsWith('/storage/')) return img;
        if (img.startsWith('storage/') || img.startsWith('images/')) return `/${img}`;
        
        return `/images/fleet/${img}`;
    };

    const getPdfUrl = (vessel) => {
        if (!vessel || !vessel.ship_particular_pdf) return null;
        const pdf = vessel.ship_particular_pdf;
        if (pdf.startsWith('http://') || pdf.startsWith('https://')) return pdf;
        if (pdf.startsWith('/documents/') || pdf.startsWith('/storage/')) return pdf;
        if (pdf.startsWith('documents/') || pdf.startsWith('storage/')) return `/${pdf}`;
        return `/documents/fleets/${pdf}`;
    };

    const filteredFleets = (fleets || []).filter(f => {
        const name = f.ship_name || f.name || '';
        const cat = f.vessel_type || f.category?.name || f.category || '';
        const imo = f.imo_number || f.imo || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
               imo.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Ship className="w-3.5 h-3.5" /> FLEET MANAGEMENT
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            Fleet Specs & Voyage Data
                        </h2>
                    </div>

                    <Link 
                        href={route('fleets.create')}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add New Vessel
                    </Link>
                </div>
            }
        >
            <Head title="Fleet Management — PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">
                    
                    {/* Search Bar */}
                    <div className="bg-white rounded-[8px] p-4 border border-[#E5E7EB] shadow-sm flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by vessel name, category, or IMO..."
                                className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-[8px] text-xs focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>
                        <span className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8]">
                            Showing {filteredFleets.length} Vessels
                        </span>
                    </div>

                    {/* Vessel Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {filteredFleets.map((vessel) => {
                            const vesselName = vessel.ship_name || vessel.name;
                            const categoryName = vessel.vessel_type || vessel.category?.name || vessel.category || 'Bulk Carrier';
                            const dwtValue = vessel.dwt || vessel.deadweight ? `${vessel.dwt || vessel.deadweight} DWT` : 'N/A';
                            const imoNumber = vessel.imo_number || vessel.imo || 'N/A';
                            const classSociety = vessel.classification_society || vessel.class || 'BKI / RINA';
                            const imgSrc = getVesselImage(vessel);
                            const pdfUrl = getPdfUrl(vessel);

                            return (
                                <div 
                                    key={vessel.id} 
                                    className="bg-white rounded-[8px] border border-[#E5E7EB] p-4 shadow-sm hover:border-[#00629D] hover:shadow-[0_4px_20px_rgba(0,98,157,0.25)] transition-all duration-300 flex flex-col justify-between group"
                                >
                                    <div>
                                        {/* Featured Image Box */}
                                        <div className="h-44 w-full bg-[#141B2C] rounded-[6px] overflow-hidden relative mb-3.5 border border-[#E5E7EB]">
                                            <img
                                                src={imgSrc}
                                                alt={vesselName}
                                                title={vesselName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/card_bulk_vessel.png';
                                                }}
                                            />
                                            <div className="absolute top-2 left-2 bg-[#141B2C]/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider border border-white/10">
                                                {categoryName}
                                            </div>
                                            <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase ${
                                                (vessel.status || '').includes('service') || vessel.status === 'Active' 
                                                    ? 'bg-emerald-500/90 text-white' 
                                                    : 'bg-amber-500/90 text-white'
                                            }`}>
                                                {(vessel.status || 'in_service').replace('_', ' ')}
                                            </div>
                                        </div>

                                        {/* Vessel Title */}
                                        <h3 className="font-bold text-lg text-[#141B2C] group-hover:text-[#00629D] transition-colors leading-snug mb-2">
                                            {vesselName}
                                        </h3>

                                        {/* Spec Telemetry Row */}
                                        <div className="space-y-1.5 font-['JetBrains_Mono'] text-xs text-[#404750] pt-3 border-t border-[#E5E7EB]">
                                            <div className="flex justify-between">
                                                <span className="text-[#8AAFC8]">Capacity:</span>
                                                <span className="font-bold text-[#141B2C]">{dwtValue}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#8AAFC8]">IMO No:</span>
                                                <span className="font-bold text-[#141B2C]">{imoNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#8AAFC8]">Class:</span>
                                                <span className="font-bold text-[#141B2C]">{classSociety}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#8AAFC8]">Area:</span>
                                                <span className="font-bold text-[#00629D] truncate max-w-[120px]">{vessel.operational_area || 'Asia'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="pt-3 border-t border-[#E5E7EB] mt-4 flex items-center justify-between gap-2">
                                        <Link 
                                            href={route('fleets.edit', vessel.id)}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 bg-[#F5F5F5] hover:bg-[#141B2C] hover:text-white rounded-[6px] text-xs font-semibold transition-colors cursor-pointer"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit Specs
                                        </Link>

                                        {pdfUrl ? (
                                            <a 
                                                href={pdfUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="p-1.5 text-[#00629D] hover:bg-[#00629D]/10 rounded-[6px] transition-colors" 
                                                title="View PDF Particulars"
                                            >
                                                <FileText className="w-4.5 h-4.5" />
                                            </a>
                                        ) : (
                                            <span className="p-1.5 text-slate-300 cursor-not-allowed" title="No PDF Attached">
                                                <FileText className="w-4.5 h-4.5" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
