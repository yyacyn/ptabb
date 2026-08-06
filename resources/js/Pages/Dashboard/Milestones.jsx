import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Flag, Plus, Search, Edit2, Trash2, Calendar, Image as ImageIcon, ArrowUpDown, AlertTriangle } from 'lucide-react';

export default function Milestones({ milestones = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('year_desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);
    const [deletingMilestone, setDeletingMilestone] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    // Filter Logic
    const filteredMilestones = (milestones || []).filter(m => {
        const search = searchTerm.toLowerCase();
        return (
            (m.year || '').toString().toLowerCase().includes(search) ||
            (m.milestones || '').toLowerCase().includes(search) ||
            (m.description || '').toLowerCase().includes(search)
        );
    });

    // Sort Logic
    const sortedMilestones = [...filteredMilestones].sort((a, b) => {
        if (sortBy === 'year_desc') {
            return (b.year || '').localeCompare(a.year || '', undefined, { numeric: true });
        }
        if (sortBy === 'year_asc') {
            return (a.year || '').localeCompare(b.year || '', undefined, { numeric: true });
        }
        if (sortBy === 'title_asc') {
            return (a.milestones || '').localeCompare(b.milestones || '');
        }
        return (b.id || 0) - (a.id || 0);
    });

    // Pagination Logic
    const totalPages = Math.max(1, Math.ceil(sortedMilestones.length / itemsPerPage));
    const paginatedMilestones = sortedMilestones.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const { data, setData, post, processing, reset, errors = {} } = useForm({
        year: new Date().getFullYear().toString(),
        milestone: '',
        description: '',
        image: null,
    });

    const openModal = (item = null) => {
        setEditingMilestone(item);
        if (item) {
            const title = item.milestone || item.milestones || '';
            setPreviewImage(item.image || null);
            setData({
                year: item.year || '',
                milestone: title,
                description: item.description || '',
                image: null,
            });
        } else {
            setPreviewImage(null);
            reset({
                year: new Date().getFullYear().toString(),
                milestone: '',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMilestone(null);
        setPreviewImage(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingMilestone) {
            router.post(route('milestones.update', editingMilestone.id), {
                ...data,
                _method: 'put',
            }, {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('milestones.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = () => {
        if (!deletingMilestone) return;
        router.delete(route('milestones.destroy', deletingMilestone.id), {
            onSuccess: () => setDeletingMilestone(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Flag className="w-3.5 h-3.5" /> COMPANY HISTORY
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            Key Company Milestones
                        </h2>
                    </div>

                    <button 
                        type="button"
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-[colors,shadow,opacity,transform] cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add Milestone
                    </button>
                </div>
            }
        >
            <Head title="Company Milestones — PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">
                    
                    {/* Controls Bar: Search & Sort */}
                    <div className="bg-white rounded-[8px] p-4 border border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search year, title, or description..."
                                className="w-full pl-9 pr-4 py-1.5 border border-[#E5E7EB] rounded-[8px] text-xs focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="w-3.5 h-3.5 text-[#00629D]" />
                                <span className="text-xs text-[#8AAFC8] font-['JetBrains_Mono']">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    className="border border-[#E5E7EB] rounded-[6px] text-xs py-1.5 px-2.5 pr-9 focus:border-[#00629D] focus:ring-[#00629D] bg-white  cursor-pointer"
                                >
                                    <option value="year_desc">Year (Newest &rarr; Oldest)</option>
                                    <option value="year_asc">Year (Oldest &rarr; Newest)</option>
                                    <option value="title_asc">Title (A &rarr; Z)</option>
                                </select>
                            </div>

                            <span className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8] whitespace-nowrap">
                                Total: <strong className="text-[#141B2C]">{sortedMilestones.length}</strong> Milestones
                            </span>
                        </div>
                    </div>

                    {/* Empty State */}
                    {sortedMilestones.length === 0 && (
                        <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-12 text-center">
                            <Flag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-[#141B2C]">No Milestones Found</h3>
                            <p className="text-xs text-[#8AAFC8] font-['JetBrains_Mono'] mt-1">
                                Add key historical achievements or adjust your search filter.
                            </p>
                        </div>
                    )}

                    {/* Milestones Cards Grid */}
                    {sortedMilestones.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {paginatedMilestones.map((item) => (
                                <div key={item.id} className="bg-white rounded-[8px] border border-[#E5E7EB] p-5 hover:border-[#00629D] hover:shadow-md transition-[colors,shadow,opacity,transform] flex flex-col justify-between group">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#00629D] bg-sky-50 px-2.5 py-1 rounded border border-sky-100 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-[#00629D]" /> Year {item.year}
                                            </span>
                                        </div>

                                        {/* Image Frame */}
                                        {item.image ? (
                                            <div className="h-36 w-full bg-[#F5F5F5] rounded-[6px] border border-[#E5E7EB] mb-4 overflow-hidden">
                                                <img
                                                    src={item.image}
                                                    alt={item.milestones}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-24 w-full bg-[#F5F5F5] rounded-[6px] border border-[#E5E7EB] p-3 flex flex-col items-center justify-center text-slate-400 text-xs mb-4">
                                                <ImageIcon className="w-5 h-5 mb-1" />
                                                <span>No Image Attached</span>
                                            </div>
                                        )}

                                        {/* Title & Description */}
                                        <h3 className="font-bold text-base text-[#141B2C] group-hover:text-[#00629D] transition-colors leading-snug mb-2 line-clamp-1 break-words">
                                            {item.milestone || item.milestones}
                                        </h3>
                                        
                                        <p 
                                            className="text-xs text-[#404750] leading-relaxed mb-4 overflow-hidden h-10 break-words"
                                            style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {item.description || '\u00A0'}
                                        </p>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="pt-3  border-[#E5E7EB] mt-4 flex items-center justify-between text-xs font-semibold">
                                        <button 
                                            type="button"
                                            onClick={() => openModal(item)}
                                            className="inline-flex items-center gap-1 text-[#00629D] hover:underline cursor-pointer"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setDeletingMilestone(item)}
                                            className="inline-flex items-center gap-1 text-rose-600 hover:underline cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB] flex items-center justify-between text-xs font-['JetBrains_Mono']">
                            <div className="text-[#404750]">
                                Showing{' '}
                                <span className="font-bold text-[#141B2C]">{(currentPage - 1) * itemsPerPage + 1}</span>
                                {' '}to{' '}
                                <span className="font-bold text-[#141B2C]">{Math.min(currentPage * itemsPerPage, sortedMilestones.length)}</span>
                                {' '}of{' '}
                                <span className="font-bold text-[#141B2C]">{sortedMilestones.length}</span> Milestones
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-[4px] border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#141B2C] disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
                                >
                                    ← Prev
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        type="button"
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
                                    type="button"
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

            {/* Add / Edit Milestone Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between  border-[#E5E7EB] pb-4 mb-5">
                        <div className="flex items-center gap-2">
                            <Flag className="w-5 h-5 text-[#00629D]" />
                            <h3 className="text-lg font-bold text-[#141B2C]">
                                {editingMilestone ? `Edit Milestone: ${editingMilestone.year}` : 'Add Company Milestone'}
                            </h3>
                        </div>
                        <button type="button" onClick={closeModal} className="text-slate-400 hover:text-[#141B2C] text-xl cursor-pointer">&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                Year <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1900"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                placeholder="e.g. 1999"
                                required
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                Milestone Headline / Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.milestone}
                                onChange={(e) => setData('milestone', e.target.value.slice(0, 255))}
                                maxLength={255}
                                placeholder="e.g. Company Incorporation / ISO 9001 Certification"
                                required
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                            {(data.milestone || '').length >= 255 && (
                                <span className="text-amber-600 text-[11px] font-['JetBrains_Mono'] mt-1 block">Maximum limit reached (255 chars).</span>
                            )}
                            {errors?.milestone && <span className="text-rose-500 text-[11px] mt-1 block">{errors.milestone}</span>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold text-[#141B2C]">Description</label>
                                <span className={`text-[11px] font-['JetBrains_Mono'] ${
                                    (data.description || '').length >= 200 ? 'text-rose-600 font-bold' : 'text-[#8AAFC8]'
                                }`}>
                                    {(data.description || '').length}/200
                                </span>
                            </div>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value.slice(0, 200))}
                                maxLength={200}
                                rows={3}
                                placeholder="Key achievements and historical context (max 200 characters)..."
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>

                        {/* Milestone Image File Upload */}
                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                Milestone Image (Optional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setData('image', file);
                                        setPreviewImage(URL.createObjectURL(file));
                                    }
                                }}
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 bg-[#F5F5F5] file:mr-3 file:py-1 file:px-2.5 file:rounded-[6px] file:border-0 file:text-xs file:font-semibold file:bg-[#00629D] file:text-white hover:file:bg-[#3F96DD] cursor-pointer"
                            />

                            {previewImage && (
                                <div className="mt-3 flex items-center gap-3 bg-[#F5F5F5] p-3 rounded-[6px] border border-[#E5E7EB]">
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        className="h-12 max-w-[140px] object-cover rounded"
                                    />
                                    <span className="text-[11px] font-['JetBrains_Mono'] text-[#404750]">
                                        Image Preview
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
                                {editingMilestone ? 'Save Changes' : 'Add Milestone'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Milestone Confirmation Modal */}
            <Modal show={!!deletingMilestone} onClose={() => setDeletingMilestone(null)} maxWidth="md">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center gap-3 mb-4 text-rose-600">
                        <div className="p-2.5 bg-rose-50 rounded-full">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#141B2C]">Remove Milestone</h3>
                            <p className="text-xs text-[#8AAFC8] font-['JetBrains_Mono'] font-medium">Confirmation Required</p>
                        </div>
                    </div>

                    <p className="text-sm text-[#404750] mb-6 leading-relaxed">
                        Are you sure you want to remove milestone <strong className="text-[#141B2C]">{deletingMilestone?.year}: {deletingMilestone?.milestones}</strong>? 
                        This action cannot be undone.
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-4  border-[#E5E7EB]">
                        <button
                            type="button"
                            onClick={() => setDeletingMilestone(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-xs font-semibold rounded-[6px] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-[6px] transition-[colors,shadow,opacity,transform] shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Milestone
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
