import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { MapPin, Plus, Phone, Mail, Globe, Edit2, Trash2, AlertTriangle, Building, ChevronLeft, ChevronRight } from 'lucide-react';

const EMPTY_CONTACT_INFOS = [];

export default function ContactInfosManagement({ contactInfos = EMPTY_CONTACT_INFOS }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editingInfo, setEditingInfo] = useState(null);
    const [deletingInfo, setDeletingInfo] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        label: '',
        type: 'office',
        value: '',
        icon: 'location',
        is_primary: true,
        display_order: 1,
    });

    const openModal = (info = null) => {
        setEditingInfo(info);
        if (info) {
            setData({
                label: info.label || '',
                type: info.type || 'office',
                value: info.value || '',
                icon: info.icon || 'location',
                is_primary: !!info.is_primary,
                display_order: info.display_order || 1,
            });
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingInfo(null);
        reset();
    };

    const confirmDelete = (info) => {
        setDeletingInfo(info);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletingInfo(null);
        setDeleteModalOpen(false);
    };

    const handleDelete = () => {
        if (!deletingInfo) return;
        router.delete(route('contact-info.destroy', deletingInfo.id), {
            onSuccess: () => closeDeleteModal(),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingInfo) {
            router.put(route('contact-info.update', editingInfo.id), data, {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('contact-info.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'phone':
                return <Phone className="w-4 h-4 text-emerald-600" />;
            case 'email':
                return <Mail className="w-4 h-4 text-sky-600" />;
            case 'social':
                return <Globe className="w-4 h-4 text-purple-600" />;
            default:
                return <MapPin className="w-4 h-4 text-[#00629D]" />;
        }
    };

    const totalPages = Math.ceil((contactInfos || []).length / itemsPerPage) || 1;
    const paginatedContactInfos = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return (contactInfos || []).slice(start, start + itemsPerPage);
    }, [contactInfos, currentPage, itemsPerPage]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5" /> CORPORATE PROFILE
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            HQ Contact Info Management
                        </h2>
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-[colors,shadow,opacity,transform] cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add Contact Info
                    </button>
                </div>
            }
        >
            <Head title="Contact Info Management | PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">

                    {/* Table View */}
                    <div className="bg-white rounded-[10px] border border-[#E5E7EB]  overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-[#141B2C] text-white font-['JetBrains_Mono'] uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-5">Order</th>
                                    <th className="py-3.5 px-5">Label</th>
                                    <th className="py-3.5 px-5">Type</th>
                                    <th className="py-3.5 px-5">Value / Content</th>
                                    <th className="py-3.5 px-5">Primary</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                {paginatedContactInfos.map((info) => (
                                    <tr key={info.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-5 font-['JetBrains_Mono'] font-bold text-slate-500">
                                            #{info.display_order || 1}
                                        </td>
                                        <td className="py-4 px-5 font-bold text-[#141B2C] text-sm">
                                            {info.label}
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#00629D]">
                                                {getTypeIcon(info.type)}
                                                {info.type}
                                            </div>
                                        </td>
                                        <td className="py-4 px-5 font-['JetBrains_Mono'] text-slate-700 max-w-xs truncate" title={info.value}>
                                            {info.value}
                                        </td>
                                        <td className="py-4 px-5">
                                            {info.is_primary ? (
                                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase">Primary</span>
                                            ) : (
                                                <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase">Secondary</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(info)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#141B2C] hover:text-white rounded-[6px] text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(info)}
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
                                    {Math.min(currentPage * itemsPerPage, contactInfos.length)}
                                </span>{' '}
                                of <span className="font-bold text-[#141B2C]">{contactInfos.length}</span> items
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

            {/* Add / Edit Contact Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between  border-[#E5E7EB] pb-4 mb-5">
                        <div className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-[#00629D]" />
                            <h3 className="text-lg font-bold text-[#141B2C]">
                                {editingInfo ? `Edit: ${editingInfo.label}` : 'Add HQ Contact Detail'}
                            </h3>
                        </div>
                        <button onClick={closeModal} className="text-slate-400 hover:text-[#141B2C] text-xl">&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Label *</label>
                            <input
                                type="text"
                                value={data.label}
                                onChange={(e) => setData('label', e.target.value)}
                                placeholder="e.g. Head Office Address"
                                required
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                            {errors.label && <span className="text-red-500 text-[11px] mt-1 block">{errors.label}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Type</label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                >
                                    <option value="office">Office / Address</option>
                                    <option value="phone">Phone Number</option>
                                    <option value="email">Email Address</option>
                                    <option value="social">Social Link</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Display Order</label>
                                <input
                                    type="number"
                                    value={data.display_order}
                                    onChange={(e) => setData('display_order', parseInt(e.target.value) || 1)}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Contact Details / Value *</label>
                            <textarea
                                value={data.value}
                                onChange={(e) => setData('value', e.target.value)}
                                rows={3}
                                required
                                placeholder="e.g. Jl. Pelabuhan No. 123, Jakarta Utara"
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                            {errors.value && <span className="text-red-500 text-[11px] mt-1 block">{errors.value}</span>}
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
                                className="px-5 py-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold rounded-[6px] hover:shadow-md transition-[colors,shadow,opacity,transform] cursor-pointer"
                            >
                                {editingInfo ? 'Update Info' : 'Save Info'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Confirmation Modal for Delete */}
            <Modal show={deleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <h3 className="text-lg font-bold">Delete Contact Detail</h3>
                    </div>
                    <p className="text-xs text-[#404750] mb-6">
                        Are you sure you want to delete <strong className="text-[#141B2C]">"{deletingInfo?.label}"</strong>?
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-xs font-semibold rounded-[6px]"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-[6px] cursor-pointer"
                        >
                            Confirm Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
