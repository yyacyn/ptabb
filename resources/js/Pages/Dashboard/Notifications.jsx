import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Bell, Plus, AlertTriangle, Edit2 } from 'lucide-react';

export default function Notifications({ notifications = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        type: 'home',
        content: '',
        status: 'active',
    });

    const openModal = (notification = null) => {
        setEditingNotification(notification);
        if (notification) {
            setData({
                title: notification.title || '',
                type: notification.type || 'home',
                content: notification.content || '',
                status: notification.status || 'active',
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

    const handleSubmit = (e) => {
        e.preventDefault();
        closeModal();
    };

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
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Create Pop-up Banner
                    </button>
                </div>
            }
        >
            <Head title="Notifications Management — PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">
                    
                    {/* BR-06 Compliance Info Alert */}
                    <div className="bg-amber-50 border border-amber-200 rounded-[8px] p-4 text-xs text-amber-800 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold">Business Rule Compliance (BR-06):</strong> Max 1 active popup banner per type (<code className="bg-amber-100 px-1 py-0.5 rounded">home</code> or <code className="bg-amber-100 px-1 py-0.5 rounded">career</code>) is allowed at any given time.
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-4">
                        {(notifications || []).map((item) => (
                            <div key={item.id} className="bg-white rounded-[8px] border border-[#E5E7EB] p-5  flex items-center justify-between gap-4 hover:border-[#00629D] transition-all">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#00629D] uppercase tracking-wider bg-[#F5F5F5] px-2 py-0.5 rounded border border-[#E5E7EB]">
                                            Target Page: {item.type}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase ${
                                            item.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-base text-[#141B2C]">{item.title}</h3>
                                    <p className="text-xs text-[#404750]">{item.content}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => openModal(item)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#141B2C] hover:text-white rounded-[6px] text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" /> Edit Banner
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Add / Edit Notification Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="lg">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-5">
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
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Banner Title *</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. Annual Medical Check-Up Reminder"
                                required
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
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
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Banner Announcement Content</label>
                            <textarea
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                rows={3}
                                placeholder="Write the pop-up announcement message..."
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
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
                                className="px-5 py-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold rounded-[6px] hover:shadow-md transition-all"
                            >
                                {editingNotification ? 'Update Banner' : 'Save Banner'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
