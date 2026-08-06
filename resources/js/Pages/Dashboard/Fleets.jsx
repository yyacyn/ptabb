import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { CheckCircle2, Ship, Plus, Search, FileText, Edit2, Filter, ChevronLeft, ChevronRight, RotateCcw, ArrowUpDown, Trash2, AlertTriangle, X } from 'lucide-react';

export default function Fleets({ fleets = [] }) {
    const pageProps = usePage().props;
    const flash = pageProps.flash || {};
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [sortBy, setSortBy] = useState('created_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingVessel, setDeletingVessel] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const itemsPerPage = 8;

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

    // Extract unique categories list for filter dropdown
    const availableCategories = useMemo(() => {
        const cats = new Set();
        (fleets || []).forEach(f => {
            const catName = f.vessel_type || f.category?.name || f.category;
            if (catName) cats.add(catName);
        });
        return Array.from(cats);
    }, [fleets]);

    // Multi-criteria Filter & Sort logic
    const filteredFleets = useMemo(() => {
        let result = (fleets || []).filter(f => {
            const name = f.ship_name || f.name || '';
            const cat = f.vessel_type || f.category?.name || f.category || '';
            const imo = f.imo_number || f.imo || '';
            const status = f.status || '';

            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  imo.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === 'ALL' || cat.toLowerCase() === selectedCategory.toLowerCase();
            const matchesStatus = selectedStatus === 'ALL' || status.toLowerCase() === selectedStatus.toLowerCase();

            return matchesSearch && matchesCategory && matchesStatus;
        });

        // Apply Sorting
        return result.sort((a, b) => {
            const nameA = (a.ship_name || a.name || '').toLowerCase();
            const nameB = (b.ship_name || b.name || '').toLowerCase();
            const dwtA = parseFloat(a.dwt || a.deadweight || 0);
            const dwtB = parseFloat(b.dwt || b.deadweight || 0);
            const yearA = parseInt(a.build_year || 0, 10);
            const yearB = parseInt(b.build_year || 0, 10);
            const idA = parseInt(a.id || 0, 10);
            const idB = parseInt(b.id || 0, 10);

            switch (sortBy) {
                case 'name_asc':
                    return nameA.localeCompare(nameB);
                case 'name_desc':
                    return nameB.localeCompare(nameA);
                case 'dwt_desc':
                    return dwtB - dwtA;
                case 'dwt_asc':
                    return dwtA - dwtB;
                case 'year_desc':
                    return yearB - yearA;
                case 'year_asc':
                    return yearA - yearB;
                case 'created_asc':
                    return idA - idB;
                case 'created_desc':
                default:
                    return idB - idA;
            }
        });
    }, [fleets, searchTerm, selectedCategory, selectedStatus, sortBy]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredFleets.length / itemsPerPage) || 1;
    const paginatedFleets = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredFleets.slice(start, start + itemsPerPage);
    }, [filteredFleets, currentPage, itemsPerPage]);

    // Reset pagination to page 1 on filter/sort change
    const handleSearchChange = (val) => {
        setSearchTerm(val);
        setCurrentPage(1);
    };

    const handleCategoryChange = (val) => {
        setSelectedCategory(val);
        setCurrentPage(1);
    };

    const handleStatusChange = (val) => {
        setSelectedStatus(val);
        setCurrentPage(1);
    };

    const handleSortChange = (val) => {
        setSortBy(val);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('ALL');
        setSelectedStatus('ALL');
        setSortBy('created_desc');
        setCurrentPage(1);
    };

    const handleConfirmDelete = () => {
        if (!deletingVessel) return;
        setIsDeleting(true);
        router.delete(route('fleets.destroy', deletingVessel.id), {
            onFinish: () => {
                setIsDeleting(false);
                setDeletingVessel(null);
            }
        });
    };

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
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-[colors,shadow,opacity,transform] cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add New Vessel
                    </Link>
                </div>
            }
        >
            <Head title="Fleet Management - PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">
                    
                    {/* Search & Filter Toolbar */}
                    <div className="bg-white rounded-[8px] p-4 border border-[#E5E7EB]  space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
                        
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search by vessel name, category, or IMO..."
                                className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-[8px] text-xs focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>

                        {/* Category, Status & Sort Selectors */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-[#404750]">
                                <Filter className="w-3.5 h-3.5 text-[#00629D]" />
                                <span className="font-bold">Filters:</span>
                            </div>

                            {/* Category Select */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="border border-[#E5E7EB] rounded-[8px] text-xs py-2 px-3 focus:border-[#00629D] focus:ring-[#00629D] bg-white cursor-pointer"
                            >
                                <option value="ALL">All Categories</option>
                                {availableCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            {/* Status Select */}
                            <select
                                value={selectedStatus}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="border border-[#E5E7EB] rounded-[8px] text-xs py-2 px-3 pr-7 focus:border-[#00629D] focus:ring-[#00629D] bg-white cursor-pointer"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="in_service">In Service</option>
                                <option value="available">Available</option>
                                <option value="in_docking">In Docking</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="chartered">Chartered</option>
                            </select>

                            {/* Sort Selector */}
                            <div className="flex items-center gap-1 border-l border-[#E5E7EB] pl-3">
                                <ArrowUpDown className="w-3.5 h-3.5 text-[#00629D]" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="border border-[#E5E7EB] rounded-[8px] text-xs py-2 px-3 focus:border-[#00629D] focus:ring-[#00629D] bg-white cursor-pointer"
                                >
                                    <option value="created_desc">Newly Added First</option>
                                    <option value="name_asc">Vessel Name (A – Z)</option>
                                    <option value="name_desc">Vessel Name (Z – A)</option>
                                    <option value="dwt_desc">Highest Capacity (DWT)</option>
                                    <option value="dwt_asc">Lowest Capacity (DWT)</option>
                                    <option value="year_desc">Build Year (Newest)</option>
                                    <option value="year_asc">Build Year (Oldest)</option>
                                </select>
                            </div>

                            {/* Reset Button */}
                            {(searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || sortBy !== 'created_desc') && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="p-2 text-slate-500 hover:text-[#00629D] hover:bg-slate-100 rounded-[6px] transition-colors cursor-pointer"
                                    title="Reset Filters & Sorting"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            )}

                            <span className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8] pl-2 border-l border-[#E5E7EB]">
                                {filteredFleets.length} Vessels Found
                            </span>
                        </div>

                    </div>

                    {/* Vessel Grid */}
                    {paginatedFleets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {paginatedFleets.map((vessel) => {
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
                                        className="bg-white rounded-[8px] border border-[#E5E7EB] p-4  hover:border-[#00629D] hover:shadow-[0_4px_20px_rgba(0,98,157,0.25)] transition-[colors,shadow,opacity,transform] duration-300 flex flex-col justify-between group"
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
                                                <div className="absolute bottom-2 left-2 bg-[#141B2C]/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider border border-white/10">
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
                                            <h3 className="font-bold text-lg text-[#141B2C] group-hover:text-[#00629D] transition-colors leading-snug mb-2 truncate">
                                                {vesselName}
                                            </h3>

                                            {/* Spec Telemetry Row */}
                                            <div className="space-y-1.5 font-['JetBrains_Mono'] text-xs text-[#404750] pt-3  border-[#E5E7EB]">
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
                                                    <span className="font-bold text-[#00629D] truncate max-w-[160px]">{vessel.operational_area || 'Asia'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Footer */}
                                        <div className="pt-3  border-[#E5E7EB] mt-4 flex items-center justify-between gap-2">
                                            <Link 
                                                href={route('fleets.edit', vessel.id)}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#F5F5F5] hover:bg-[#141B2C] hover:text-white rounded-[6px] text-xs font-semibold transition-colors cursor-pointer"
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

                                            <button
                                                type="button"
                                                onClick={() => setDeletingVessel(vessel)}
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-[6px] transition-colors cursor-pointer"
                                                title="Delete Vessel"
                                            >
                                                <Trash2 className="w-4.5 h-4.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-12 text-center space-y-3">
                            <Ship className="w-12 h-12 text-slate-300 mx-auto" />
                            <h3 className="text-base font-bold text-[#141B2C]">No Vessels Found</h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                No fleet records match your active search terms or filter criteria.
                            </p>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 bg-[#00629D] text-white text-xs font-semibold px-4 py-2 rounded-[6px] hover:bg-[#3F96DD] transition-[colors,shadow,opacity,transform] cursor-pointer mt-2"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                            </button>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="bg-white rounded-[8px] p-4 border border-[#E5E7EB]  flex flex-col sm:flex-row items-center justify-between gap-4 font-['Hanken_Grotesk']">
                            <div className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8]">
                                Showing <span className="font-bold text-[#141B2C]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                <span className="font-bold text-[#141B2C]">
                                    {Math.min(currentPage * itemsPerPage, filteredFleets.length)}
                                </span>{' '}
                                of <span className="font-bold text-[#141B2C]">{filteredFleets.length}</span> vessels
                            </div>

                            <div className="flex items-center gap-1.5">
                                {/* Previous Page Button */}
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-[#E5E7EB] rounded-[6px] text-xs font-semibold hover:border-[#00629D] hover:text-[#00629D] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {/* Page Number Buttons */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-[6px] text-xs font-bold transition-[colors,shadow,opacity,transform] cursor-pointer ${
                                            currentPage === page
                                                ? 'bg-[#00629D] text-white '
                                                : 'border border-[#E5E7EB] text-[#141B2C] hover:border-[#00629D] hover:text-[#00629D]'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                {/* Next Page Button */}
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-[#E5E7EB] rounded-[6px] text-xs font-semibold hover:border-[#00629D] hover:text-[#00629D] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* DELETE VESSEL CONFIRMATION MODAL */}
            {deletingVessel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-['Hanken_Grotesk'] animate-in fade-in duration-200">
                    <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-2xl max-w-md w-full p-6 space-y-5">
                        <div className="flex items-center justify-between  border-[#E5E7EB] pb-3">
                            <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                                Confirm Vessel Deletion
                            </h3>
                            <button
                                type="button"
                                onClick={() => setDeletingVessel(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <p className="text-xs text-[#141B2C] leading-relaxed">
                            Are you sure you want to delete <span className="font-bold text-rose-600">{deletingVessel.ship_name || deletingVessel.name}</span> (IMO: {deletingVessel.imo_number || deletingVessel.imo || 'N/A'})? This action is permanent and cannot be undone.
                        </p>

                        <div className="pt-3  border-[#E5E7EB] flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingVessel(null)}
                                disabled={isDeleting}
                                className="bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-xs font-semibold px-4 py-2 rounded-[6px] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-5 py-2 rounded-[6px] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                            >
                                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
