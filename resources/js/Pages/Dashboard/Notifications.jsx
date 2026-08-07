import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Bell, Plus, AlertTriangle, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Notifications({ notifications = [] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [deletingNotification, setDeletingNotification] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        type: 'home',
        content: '',
        status: 'active',
        image: null,
    });

    const openModal = (notification = null) => {
        setEditingNotification(notification);
        if (notification) {
            setData({
                title: notification.title || '',
                type: notification.type || 'home',
                content: notification.content || '',
                status: notification.status || 'active',
                image: notification.image || null,
            });
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingNotification(null);
        reset();
    };

    const confirmDelete = (notification) => {
        setDeletingNotification(notification);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletingNotification(null);
        setDeleteModalOpen(false);
    };

    const handleDelete = () => {
        if (!deletingNotification) return;

        router.delete(route('notifications.destroy', deletingNotification.id), {
            onSuccess: () => {
                closeDeleteModal();
            },
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingNotification) {
            router.post(route('notifications.update', editingNotification.id), {
                _method: 'PUT',
                ...data,
            }, {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('notifications.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const totalPages = Math.ceil((notifications || []).length / itemsPerPage) || 1;
    const paginatedNotifications = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return (notifications || []).slice(start, start + itemsPerPage);
    }, [notifications, currentPage, itemsPerPage]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Bell className="w-3.5 h-3.5" /> SITEWIDE NOTIFICATIONS
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            Pop-ups & Warnings Management
                        </h2>
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-[colors,shadow,opacity,transform] cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Create Pop-up Banner
                    </button>
                </div>
            }
        >
            <Head title="Notifications Management - PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">

                    {/* BR-06 Compliance Info Alert */}
                    <div className="bg-amber-50 border border-amber-200 rounded-[8px] p-4 text-xs text-amber-800 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold">Business Rule Compliance (BR-06):</strong> Max 1 active popup banner per type (<code className="bg-amber-100 px-1 py-0.5 rounded">home</code> or <code className="bg-amber-100 px-1 py-0.5 rounded">career</code>) is allowed at any given time. Activating a new banner will set other banners of the same type to inactive.
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-4">
                        {paginatedNotifications.map((item) => (
                            <div key={item.id} className="bg-white rounded-[8px] border border-[#E5E7EB] p-5 flex items-center justify-between gap-4 hover:border-[#00629D] transition-all">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#00629D] uppercase tracking-wider bg-[#F5F5F5] px-2 py-0.5 rounded border border-[#E5E7EB]">
                                            Target Page: {item.type}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase ${item.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-base text-[#141B2C]">{item.title}</h3>
                                    <p className="text-xs text-[#404750]">{item.content}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openModal(item)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#141B2C] hover:text-white rounded-[6px] text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(item)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}

                        {(!notifications || notifications.length === 0) && (
                            <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-12 text-center text-xs text-[#404750]">
                                No notification banners found. Click "Create Pop-up Banner" to add one.
                            </div>
                        )}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <div className="bg-white rounded-[8px] p-4 border border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 font-['Hanken_Grotesk']">
                            <div className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8]">
                                Showing <span className="font-bold text-[#141B2C]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                <span className="font-bold text-[#141B2C]">
                                    {Math.min(currentPage * itemsPerPage, notifications.length)}
                                </span>{' '}
                                of <span className="font-bold text-[#141B2C]">{notifications.length}</span> banners
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

            {/* Add / Edit Notification Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="lg">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between  border-[#E5E7EB] pb-4 mb-5">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-[#00629D]" />
                            <h3 className="text-lg font-bold text-[#141B2C]">
                                {editingNotification ? `Edit Banner: ${editingNotification.title}` : 'Create Pop-up Banner'}
                            </h3>
                        </div>
                        <button onClick={closeModal} className="text-slate-400 hover:text-[#141B2C] text-xl">&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                Banner Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value.slice(0, 255))}
                                maxLength={255}
                                placeholder="e.g. Annual Medical Check-Up Reminder"
                                required
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                            {(data.title || '').length >= 255 && (
                                <span className="text-amber-600 text-[11px] font-['JetBrains_Mono'] mt-1 block">Maximum limit reached (255 chars).</span>
                            )}
                            {errors.title && <span className="text-red-500 text-[11px] mt-1 block">{errors.title}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Target Page (BR-06)</label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                >
                                    <option value="home">Home Page (home)</option>
                                    <option value="career">Careers Page (career)</option>
                                </select>
                                {errors.type && <span className="text-red-500 text-[11px] mt-1 block">{errors.type}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                {errors.status && <span className="text-red-500 text-[11px] mt-1 block">{errors.status}</span>}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-[#141B2C]">
                                    Banner Announcement Content <span className="text-red-500">*</span>
                                </label>
                                <span className={`font-['JetBrains_Mono'] text-[11px] ${(data.content || '').length >= 950 ? 'text-amber-600 font-bold' : 'text-[#8AAFC8]'}`}>
                                    {(data.content || '').length} / 1000 chars
                                </span>
                            </div>
                            <textarea
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value.slice(0, 1000))}
                                maxLength={1000}
                                rows={3}
                                required
                                placeholder="Write the pop-up announcement message..."
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                            {errors.content && <span className="text-red-500 text-[11px] mt-1 block">{errors.content}</span>}
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
                                {editingNotification ? 'Update Banner' : 'Save Banner'}
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
                        <h3 className="text-lg font-bold">Delete Notification Banner</h3>
                    </div>
                    <p className="text-xs text-[#404750] mb-6">
                        Are you sure you want to delete <strong className="text-[#141B2C]">"{deletingNotification?.title}"</strong>? This action cannot be undone.
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
