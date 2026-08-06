import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { MapPin, Plus, Edit2, Trash2, AlertTriangle, ChevronLeft, ChevronRight, Globe, ExternalLink } from 'lucide-react';

export default function Branches({ branches = [] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [deletingBranch, setDeletingBranch] = useState(null);
    const [imageError, setImageError] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'Branch Office',
        company_name: '',
        short_desc: '',
        address: '',
        phone: '',
        email: '',
        map_url: '',
        image_url: '',
        image_file: null,
        sort_order: 0,
        is_active: true,
    });

    const openModal = (branch = null) => {
        setEditingBranch(branch);
        if (branch) {
            setData({
                name: branch.name || '',
                type: branch.type || 'Branch Office',
                company_name: branch.company_name || '',
                short_desc: branch.short_desc || '',
                address: branch.address || '',
                phone: branch.phone || '',
                email: branch.email || '',
                map_url: branch.map_url || '',
                image_url: branch.image_url || '',
                image_file: null,
                sort_order: branch.sort_order || 0,
                is_active: branch.is_active ?? true,
            });
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBranch(null);
        reset();
    };

    const confirmDelete = (branch) => {
        setDeletingBranch(branch);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletingBranch(null);
        setDeleteModalOpen(false);
    };

    const handleDelete = () => {
        if (!deletingBranch) return;
        router.delete(route('branches.destroy', deletingBranch.id), {
            onSuccess: () => closeDeleteModal(),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingBranch) {
            post(route('branches.update', editingBranch.id), {
                headers: {
                    'X-HTTP-Method-Override': 'PUT',
                },
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('branches.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const getTypeBadge = (type) => {
        switch ((type || '').toLowerCase()) {
            case 'shipyard':
                return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase">Shipyard</span>;
            case 'representative office':
                return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase">Representative Office</span>;
            default:
                return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase">Branch Office</span>;
        }
    };

    const totalPages = Math.ceil((branches || []).length / itemsPerPage) || 1;
    const paginatedBranches = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return (branches || []).slice(start, start + itemsPerPage);
    }, [branches, currentPage, itemsPerPage]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> STRATEGIC FOOTPRINT & LOCATIONS
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            Branch Offices Management
                        </h2>
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-[colors,shadow,opacity,transform] cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add Branch Office
                    </button>
                </div>
            }
        >
            <Head title="Branch Offices — PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">

                    {/* Branches Table */}
                    <div className="bg-white rounded-[10px] border border-[#E5E7EB] overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-[#141B2C] text-white font-['JetBrains_Mono'] uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-5">Order</th>
                                    <th className="py-3.5 px-5">Branch Name</th>
                                    <th className="py-3.5 px-5">Facility Type</th>
                                    <th className="py-3.5 px-5">Operating Company</th>
                                    <th className="py-3.5 px-5">Map Link</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                {paginatedBranches.map((b) => (
                                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-3">
                                            <div className="font-bold text-center text-[#141B2C] text-sm">{b.sort_order}</div>
                                        </td>
                                        <td className="py-4 px-5 max-w-[260px]">
                                            <div className="font-bold text-[#141B2C] text-sm truncate" title={b.name}>{b.name}</div>
                                            <div className="text-xs text-[#8AAFC8] font-['JetBrains_Mono'] mt-0.5 truncate" title={b.short_desc || ''}>{b.short_desc || '-'}</div>
                                        </td>
                                        <td className="py-4 px-5">
                                            {getTypeBadge(b.type)}
                                        </td>
                                        <td className="py-4 px-5 font-[#404750] font-medium max-w-[200px] truncate" title={b.company_name}>
                                            {b.company_name}
                                        </td>
                                        <td className="py-4 px-5 font-['JetBrains_Mono'] text-slate-600">
                                            {b.map_url ? (
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.company_name || b.name)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center justify-center p-1.5 bg-[#F5F5F5] hover:bg-[#00629D] text-[#00629D] hover:text-white rounded-[6px] transition-colors cursor-pointer"
                                                    title={`Search ${b.company_name} on Google Maps`}
                                                >
                                                    <Globe className="w-4 h-4" />
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 italic text-[11px]">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(b)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#141B2C] hover:text-white rounded-[6px] text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(b)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <div className="bg-white rounded-[8px] p-4 border border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 font-['Hanken_Grotesk']">
                            <div className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8]">
                                Showing <span className="font-bold text-[#141B2C]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                <span className="font-bold text-[#141B2C]">
                                    {Math.min(currentPage * itemsPerPage, branches.length)}
                                </span>{' '}
                                of <span className="font-bold text-[#141B2C]">{branches.length}</span> branch offices
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-[#E5E7EB] rounded-[6px] text-xs font-semibold hover:border-[#00629D] hover:text-[#00629D] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-[6px] text-xs font-bold transition-[colors,shadow,opacity,transform] cursor-pointer ${
                                            currentPage === page
                                                ? 'bg-[#00629D] text-white'
                                                : 'border border-[#E5E7EB] text-[#141B2C] hover:border-[#00629D] hover:text-[#00629D]'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

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

            {/* Add / Edit Branch Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between pb-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[#00629D]" />
                            <h3 className="text-lg font-bold text-[#141B2C]">
                                {editingBranch ? `Edit Branch: ${editingBranch.name}` : 'Add Branch Office'}
                            </h3>
                        </div>
                        <button onClick={closeModal} className="text-slate-400 hover:text-[#141B2C] text-xl">&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs font-['Hanken_Grotesk']">
                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                Branch / Facility Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value.slice(0, 255))}
                                maxLength={255}
                                placeholder="e.g. Batam, Riau Islands"
                                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-[6px] text-xs focus:outline-hidden focus:border-[#00629D]"
                            />
                            {(data.name || '').length >= 255 && (
                                <span className="text-amber-600 text-[11px] font-['JetBrains_Mono'] mt-1 block">Maximum limit reached (255 chars).</span>
                            )}
                            {errors.name && <span className="text-red-500 text-[11px] font-['JetBrains_Mono'] mt-1 block">{errors.name}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                    Facility Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-[6px] text-xs focus:outline-hidden focus:border-[#00629D] bg-white font-medium"
                                >
                                    <option value="Branch Office">Branch Office</option>
                                    <option value="Representative Office">Representative Office</option>
                                    <option value="Shipyard">Shipyard</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-[6px] text-xs focus:outline-hidden focus:border-[#00629D]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                Operating Company <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={data.company_name}
                                onChange={(e) => setData('company_name', e.target.value.slice(0, 255))}
                                maxLength={255}
                                placeholder="e.g. PT. Sumber Marine Shipyard"
                                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-[6px] text-xs focus:outline-hidden focus:border-[#00629D]"
                            />
                            {(data.company_name || '').length >= 255 && (
                                <span className="text-amber-600 text-[11px] font-['JetBrains_Mono'] mt-1 block">Maximum limit reached (255 chars).</span>
                            )}
                            {errors.company_name && <span className="text-red-500 text-[11px] font-['JetBrains_Mono'] mt-1 block">{errors.company_name}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Short Description</label>
                            <input
                                type="text"
                                value={data.short_desc}
                                onChange={(e) => setData('short_desc', e.target.value.slice(0, 255))}
                                maxLength={255}
                                placeholder="e.g. Vessel Building & Repair Facility"
                                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-[6px] text-xs focus:outline-hidden focus:border-[#00629D]"
                            />
                            {(data.short_desc || '').length >= 255 && (
                                <span className="text-amber-600 text-[11px] font-['JetBrains_Mono'] mt-1 block">Maximum limit reached (255 chars).</span>
                            )}
                            {errors.short_desc && <span className="text-red-500 text-[11px] font-['JetBrains_Mono'] mt-1 block">{errors.short_desc}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                Google Maps Embed URL
                            </label>
                            <input
                                type="text"
                                value={data.map_url}
                                onChange={(e) => {
                                    let raw = e.target.value;
                                    const match = raw.match(/src=["']([^"']+)["']/i);
                                    if (match) {
                                        raw = match[1];
                                    }
                                    setData('map_url', raw.slice(0, 2000));
                                }}
                                placeholder="e.g. https://www.google.com/maps/embed?pb=..."
                                maxLength={2000}
                                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-[6px] text-xs font-['JetBrains_Mono'] focus:outline-hidden focus:border-[#00629D]"
                            />
                            {errors.map_url && <span className="text-red-500 text-[11px] font-['JetBrains_Mono'] mt-1 block">{errors.map_url}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                Branch Photo
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        setImageError(null);
                                        if (!file) return;
                                        const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
                                        if (!isImg) {
                                            setImageError('The branch photo image must be a valid image file (jpeg, png, webp).');
                                            setData('image_file', null);
                                            e.target.value = null;
                                            return;
                                        }
                                        if (file.size > 5 * 1024 * 1024) {
                                            setImageError('The branch photo image size may not be greater than 5MB.');
                                            setData('image_file', null);
                                            e.target.value = null;
                                            return;
                                        }
                                        setData('image_file', file);
                                    }}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-[6px] file:border-0 file:text-xs file:font-semibold file:bg-[#00629D]/10 file:text-[#00629D] hover:file:bg-[#00629D]/20 cursor-pointer"
                                />
                                {(imageError || errors.image_file) && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{imageError || errors.image_file}</p>
                                )}
                            </div>
                            {errors.image_file && <span className="text-red-500 text-[11px] font-['JetBrains_Mono'] mt-1 block">{errors.image_file}</span>}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-[#E5E7EB]">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 border border-[#E5E7EB] rounded-[6px] text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold rounded-[6px] hover:shadow-md disabled:opacity-50 cursor-pointer"
                            >
                                {editingBranch ? 'Update Branch' : 'Create Branch'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={deleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C] text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[#141B2C]">Confirm Branch Deletion</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Are you sure you want to delete <strong className="text-[#141B2C]">{deletingBranch?.name}</strong>? This action cannot be undone.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            className="px-4 py-2 border border-[#E5E7EB] rounded-[6px] text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-[6px] shadow-md cursor-pointer"
                        >
                            Delete Branch
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
