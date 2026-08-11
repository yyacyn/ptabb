import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, Plus, Search, Image as ImageIcon, Edit2, Trash2, Filter, ArrowUpDown, AlertTriangle } from 'lucide-react';

const EMPTY_CLIENTS = [];

export default function Clients({ clients = EMPTY_CLIENTS }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [deletingClient, setDeletingClient] = useState(null);
    const [previewLogo, setPreviewLogo] = useState(null);
    const [logoError, setLogoError] = useState(null);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleCategoryChange = (cat) => {
        setCategoryFilter(cat);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    // Filter Logic
    const filteredClients = (clients || []).filter(c => {
        const matchesCategory = categoryFilter === 'all' || (c.category || '').toLowerCase() === categoryFilter.toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
            (c.name || '').toLowerCase().includes(search) ||
            (c.category || '').toLowerCase().includes(search) ||
            (c.country || '').toLowerCase().includes(search);
        
        return matchesCategory && matchesSearch;
    });

    // Sort Logic
    const sortedClients = [...filteredClients].sort((a, b) => {
        if (sortBy === 'name_asc') {
            return (a.name || '').localeCompare(b.name || '');
        }
        if (sortBy === 'name_desc') {
            return (b.name || '').localeCompare(a.name || '');
        }
        if (sortBy === 'oldest') {
            return (a.id || 0) - (b.id || 0);
        }
        // 'newest' default
        return (b.id || 0) - (a.id || 0);
    });

    // Pagination Logic
    const totalPages = Math.max(1, Math.ceil(sortedClients.length / itemsPerPage));
    const paginatedClients = sortedClients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const normalizeCategory = (cat) => {
        if (!cat) return 'Domestic';
        const str = String(cat).trim();
        if (str.toLowerCase() === 'international') return 'International';
        if (str.toLowerCase() === 'domestic') return 'Domestic';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const { data, setData, post, processing, reset, errors = {} } = useForm({
        _method: 'POST',
        name: '',
        category: 'Domestic',
        country: 'Indonesia',
        logo: null,
    });

    const getLogoPath = (item) => {
        if (!item) return '/images/clients/placeholder.png';
        const logoFile = item.logo || item.logo_path || item.pathfile || item.image || item.featured_image;
        if (!logoFile) return '/images/clients/placeholder.png';

        if (logoFile.startsWith('http://') || logoFile.startsWith('https://')) return logoFile;
        if (logoFile.startsWith('/images/') || logoFile.startsWith('/storage/')) return logoFile;
        if (logoFile.startsWith('assets/images/clients/')) return `/${logoFile.replace('assets/images/clients/', 'images/clients/')}`;
        if (logoFile.startsWith('../assets/images/clients/')) return `/${logoFile.replace('../assets/images/clients/', 'images/clients/')}`;
        if (logoFile.startsWith('images/') || logoFile.startsWith('storage/')) return `/${logoFile}`;

        const filename = logoFile.split('/').pop();
        return `/images/clients/${filename}`;
    };

    const openModal = (client = null) => {
        setEditingClient(client);
        setLogoError(null);
        if (client) {
            setPreviewLogo(getLogoPath(client));
            const formattedCat = normalizeCategory(client.category);
            setData({
                _method: 'PUT',
                name: client.name || '',
                category: formattedCat,
                country: client.country || (formattedCat === 'Domestic' ? 'Indonesia' : ''),
                logo: null,
            });
        } else {
            setPreviewLogo(null);
            reset();
            setData({
                _method: 'POST',
                name: '',
                category: 'Domestic',
                country: 'Indonesia',
                logo: null,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
        setPreviewLogo(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingClient) {
            post(route('clients.update', editingClient.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('clients.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = () => {
        if (!deletingClient) return;
        router.delete(route('clients.destroy', deletingClient.id), {
            onSuccess: () => setDeletingClient(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" /> CLIENT PORTFOLIO
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            Clients &amp; Strategic Partners
                        </h2>
                    </div>

                    <button 
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-[colors,shadow,opacity,transform] cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add New Partner
                    </button>
                </div>
            }
        >
            <Head title="Clients Management | PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">
                    
                    {/* Controls Bar: Search, Category Filter & Sorting */}
                    <div className="bg-white rounded-[8px] p-4 border border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
                            {/* Search Input */}
                            <div className="relative w-full sm:w-72">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Search partner, industry, country..."
                                    className="w-full pl-9 pr-4 py-1.5 border border-[#E5E7EB] rounded-[8px] text-xs focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>

                            {/* Category Filter Tabs */}
                            <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded-[6px] border border-[#E5E7EB] w-full sm:w-auto">
                                <button
                                    onClick={() => handleCategoryChange('all')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-[4px] transition-[colors,shadow,opacity,transform] cursor-pointer ${
                                        categoryFilter === 'all' ? 'bg-[#00629D] text-white' : 'text-[#404750] hover:text-[#141B2C]'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => handleCategoryChange('Domestic')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-[4px] transition-[colors,shadow,opacity,transform] cursor-pointer ${
                                        categoryFilter === 'Domestic' ? 'bg-[#00629D] text-white' : 'text-[#404750] hover:text-[#141B2C]'
                                    }`}
                                >
                                    Domestic
                                </button>
                                <button
                                    onClick={() => handleCategoryChange('International')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-[4px] transition-[colors,shadow,opacity,transform] cursor-pointer ${
                                        categoryFilter === 'International' ? 'bg-[#00629D] text-white' : 'text-[#404750] hover:text-[#141B2C]'
                                    }`}
                                >
                                    International
                                </button>
                            </div>
                        </div>

                        {/* Sort Controls & Counter */}
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="w-3.5 h-3.5 text-[#00629D]" />
                                <span className="text-xs text-[#8AAFC8] font-['JetBrains_Mono']">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    className="border border-[#E5E7EB] rounded-[6px] text-xs py-1.5 px-2.5 pr-7 focus:border-[#00629D] focus:ring-[#00629D] bg-white cursor-pointer"
                                >
                                    <option value="newest">Newest Added</option>
                                    <option value="name_asc">Name (A &rarr; Z)</option>
                                    <option value="name_desc">Name (Z &rarr; A)</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>

                            <span className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8] whitespace-nowrap">
                                Total: <strong className="text-[#141B2C]">{sortedClients.length}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Empty State */}
                    {sortedClients.length === 0 && (
                        <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-12 text-center">
                            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-[#141B2C]">No Partners Found</h3>
                            <p className="text-xs text-[#8AAFC8] font-['JetBrains_Mono'] mt-1">
                                Try adjusting your search term or category filters.
                            </p>
                        </div>
                    )}

                    {/* Client Logo Grid */}
                    {sortedClients.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {paginatedClients.map((item) => {
                                const logoSrc = getLogoPath(item);

                                return (
                                    <div key={item.id} className="bg-white rounded-[8px] border border-[#E5E7EB] p-5 hover:border-[#00629D] hover:shadow-md transition-[colors,shadow,opacity,transform] flex flex-col justify-between group">
                                        <div>
                                            <div className="flex items-center justify-between gap-1.5 mb-3">
                                                <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#00629D] uppercase tracking-wider bg-[#F5F5F5] px-2 py-0.5 rounded border border-[#E5E7EB]">
                                                    {normalizeCategory(item.category)}
                                                </span>
                                                {item.country ? (
                                                    <span className="font-['JetBrains_Mono'] text-[10px] font-medium text-[#404750] truncate max-w-[120px]" title={item.country}>
                                                        {item.country}
                                                    </span>
                                                ) : (
                                                    <span className="font-['JetBrains_Mono'] text-[10px] text-slate-400 italic">
                                                        No Country
                                                    </span>
                                                )}
                                            </div>

                                            {/* Client Logo Image Frame */}
                                            <div className="h-20 w-full bg-[#F5F5F5] rounded-[6px] border border-[#E5E7EB] p-3 flex items-center justify-center mb-4 group-hover:bg-white transition-colors overflow-hidden">
                                                <img
                                                    src={logoSrc}
                                                    alt={item.name}
                                                    title={item.name}
                                                    className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-[colors,shadow,opacity,transform] duration-300"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        if (e.currentTarget.nextSibling) {
                                                            e.currentTarget.nextSibling.style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                                <div className="hidden flex-col items-center justify-center text-slate-400 text-xs">
                                                    <ImageIcon className="w-5 h-5 mb-1" />
                                                    <span>No Image</span>
                                                </div>
                                            </div>

                                            {/* Client Info */}
                                            <h3 className="font-bold text-base text-[#141B2C] group-hover:text-[#00629D] transition-colors leading-snug mb-1 break-words whitespace-normal">
                                                {item.name}
                                            </h3>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="pt-3 flex items-center justify-between text-xs font-semibold  border-[#E5E7EB] mt-4">
                                            <button 
                                                onClick={() => openModal(item)}
                                                className="inline-flex items-center gap-1 text-[#00629D] hover:underline cursor-pointer"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button 
                                                onClick={() => setDeletingClient(item)}
                                                className="inline-flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB] flex items-center justify-between text-xs font-['JetBrains_Mono']">
                            <div className="text-[#404750]">
                                Showing{' '}
                                <span className="font-bold text-[#141B2C]">{(currentPage - 1) * itemsPerPage + 1}</span>
                                {' '}to{' '}
                                <span className="font-bold text-[#141B2C]">{Math.min(currentPage * itemsPerPage, sortedClients.length)}</span>
                                {' '}of{' '}
                                <span className="font-bold text-[#141B2C]">{sortedClients.length}</span> Client Partners
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-[4px] border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#141B2C] disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
                                >
                                    ← Prev
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1.5 rounded-[4px] font-semibold cursor-pointer ${
                                            currentPage === page
                                                ? 'bg-[#00629D] text-white border border-[#00629D]'
                                                : 'border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#141B2C]'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-[4px] border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#141B2C] disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Add / Edit Client Partner Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between  border-[#E5E7EB] pb-4 mb-5">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[#00629D]" />
                            <h3 className="text-lg font-bold text-[#141B2C]">
                                {editingClient ? `Edit Partner: ${editingClient.name}` : 'Add Client Partner'}
                            </h3>
                        </div>
                        <button onClick={closeModal} className="text-slate-400 hover:text-[#141B2C] text-xl cursor-pointer">&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value.slice(0, 255))}
                                placeholder="e.g. PT. Semen Padang"
                                maxLength={255}
                                required
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                            {(data.name || '').length >= 255 && (
                                <p className="text-xs text-amber-600 mt-1 font-medium">Maximum limit reached (255 chars).</p>
                            )}
                            {errors?.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Category</label>
                                <select
                                    value={data.category}
                                    onChange={(e) => {
                                        const newCat = e.target.value;
                                        if (newCat === 'Domestic') {
                                            setData(prev => ({ ...prev, category: newCat, country: 'Indonesia' }));
                                        } else {
                                            setData(prev => ({
                                                ...prev,
                                                category: newCat,
                                                country: prev.country === 'Indonesia' ? '' : prev.country
                                            }));
                                        }
                                    }}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                >
                                    <option value="Domestic">Domestic</option>
                                    <option value="International">International</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Country</label>
                                <input
                                    type="text"
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value.slice(0, 100))}
                                    placeholder="e.g. Indonesia / Singapore"
                                    maxLength={100}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                                {(data.country || '').length >= 100 && (
                                    <p className="text-xs text-amber-600 mt-1 font-medium">Maximum limit reached (100 chars).</p>
                                )}
                            </div>
                        </div>

                        {/* Partner Logo File Upload */}
                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                Partner Logo File Upload (Optional when editing)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setLogoError(null);
                                    if (!file) return;
                                    const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|svg)$/i.test(file.name);
                                    if (!isImg) {
                                        setLogoError('The logo must be a valid image file (jpeg, png, jpg, webp, svg).');
                                        setData('logo', null);
                                        e.target.value = null;
                                        return;
                                    }
                                    if (file.size > 5 * 1024 * 1024) {
                                        setLogoError('The logo file size must not exceed 5MB.');
                                        setData('logo', null);
                                        e.target.value = null;
                                        return;
                                    }
                                    setData('logo', file);
                                    setPreviewLogo(URL.createObjectURL(file));
                                }}
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 bg-[#F5F5F5] file:mr-3 file:py-1 file:px-2.5 file:rounded-[6px] file:border-0 file:text-xs file:font-semibold file:bg-[#00629D] file:text-white hover:file:bg-[#3F96DD] cursor-pointer"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">Leave blank to keep existing logo (PNG, JPG, SVG, WEBP max 5MB)</p>
                            {(logoError || errors?.logo) && <p className="text-xs text-rose-500 mt-1 font-medium">{logoError || errors.logo}</p>}

                            {previewLogo && (
                                <div className="mt-3 flex items-center gap-3 bg-[#F5F5F5] p-3 rounded-[6px] border border-[#E5E7EB]">
                                    <img
                                        src={previewLogo}
                                        alt="Logo Preview"
                                        className="h-10 max-w-[140px] object-contain"
                                    />
                                    <span className="text-[11px] font-['JetBrains_Mono'] text-[#404750]">
                                        Logo Preview
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4  border-[#E5E7EB] flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-xs font-semibold rounded-[6px]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold rounded-[6px] hover:shadow-md transition-all"
                            >
                                {editingClient ? 'Save Changes' : 'Add Partner'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Partner Confirmation Modal */}
            <Modal show={!!deletingClient} onClose={() => setDeletingClient(null)} maxWidth="md">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center gap-3 mb-4 text-rose-600">
                        <div className="p-2.5 bg-rose-50 rounded-full">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#141B2C]">Remove Client Partner</h3>
                            <p className="text-xs text-[#8AAFC8] font-['JetBrains_Mono'] font-medium">Confirmation Required</p>
                        </div>
                    </div>

                    <p className="text-sm text-[#404750] mb-6 leading-relaxed">
                        Are you sure you want to remove <strong className="text-[#141B2C]">{deletingClient?.name}</strong> from the client portfolio? 
                        This action cannot be undone.
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-4  border-[#E5E7EB]">
                        <button
                            type="button"
                            onClick={() => setDeletingClient(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-xs font-semibold rounded-[6px] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-[6px] transition-[colors,shadow,opacity,transform] shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Partner
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
