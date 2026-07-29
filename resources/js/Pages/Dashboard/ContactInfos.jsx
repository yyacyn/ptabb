import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { MapPin, Plus, Phone, Mail, Globe, Edit2, Trash2, AlertTriangle, Building } from 'lucide-react';

export default function ContactInfosManagement({ contactInfos = [] }) {
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
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add Contact Detail
                    </button>
                </div>
            }
        >
            <Head title="HQ Contact Info Management — PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">

                    {/* <div className="bg-sky-50 border border-sky-200 rounded-[8px] p-4 text-xs text-sky-900 flex items-start gap-3">
                        <Building className="w-4 h-4 text-[#00629D] shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold">Super Admin Access Only:</strong> Information configured here powers the public website's header, footer, and contact page details (head office address, phone numbers, commercial emails).
                        </div>
                    </div> */}

                    <div className="bg-white rounded-[8px] border border-[#E5E7EB] overflow-hidden shadow-xs">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#141B2C] border-b border-[#E5E7EB] text-[11px] font-['JetBrains_Mono'] font-bold text-[#ffffff] uppercase tracking-wider">
                                    <th className="py-3.5 px-5">Label</th>
                                    <th className="py-3.5 px-5">Type</th>
                                    <th className="py-3.5 px-5">Contact Details / Address</th>
                                    <th className="py-3.5 px-5">Order</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB] text-xs">
                                {(contactInfos || []).map((info) => (
                                    <tr key={info.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-5 font-bold text-[#141B2C] flex items-center gap-2">
                                            {getTypeIcon(info.type)}
                                            {info.label}
                                        </td>
                                        <td className="py-4 px-5 font-['JetBrains_Mono'] uppercase text-[10px] text-slate-600 font-semibold">
                                            {info.type}
                                        </td>
                                        <td className="py-4 px-5 text-[#404750]">
                                            {info.value}
                                        </td>
                                        <td className="py-4 px-5 font-['JetBrains_Mono']">
                                            #{info.display_order || 1}
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

                </div>
            </div>

            {/* Add / Edit Contact Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-5">
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

                        <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
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
                                className="px-5 py-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold rounded-[6px] hover:shadow-md transition-all cursor-pointer"
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
