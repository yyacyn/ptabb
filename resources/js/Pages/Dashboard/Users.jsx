import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Users, Plus, Shield, Edit2, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function UsersManagement({ users = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'hr_admin',
    });

    const openModal = (user = null) => {
        setEditingUser(user);
        if (user) {
            setData({
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                password: '',
                role: user.role || 'hr_admin',
            });
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        reset();
    };

    const confirmDelete = (user) => {
        setDeletingUser(user);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeletingUser(null);
        setDeleteModalOpen(false);
    };

    const handleDelete = () => {
        if (!deletingUser) return;
        router.delete(route('users.destroy', deletingUser.id), {
            onSuccess: () => closeDeleteModal(),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingUser) {
            router.put(route('users.update', editingUser.id), data, {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'super_admin':
                return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase">Super Admin</span>;
            case 'hr_admin':
                return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase">HR Admin</span>;
            case 'crew_admin':
                return <span className="bg-pink-100 text-pink-800 border border-pink-200 px-2.5 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase">Crew Admin</span>;
            case 'pr_admin':
                return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase">PR Admin</span>;
            default:
                return <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase">{role}</span>;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" /> SYSTEM SECURITY & ACCESS
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            User Management (RBAC)
                        </h2>
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add System Admin
                    </button>
                </div>
            }
        >
            <Head title="System User Management — PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">

                    {/* Info Alert */}
                    <div className="bg-sky-50 border border-sky-200 rounded-[8px] p-4 text-xs text-sky-900 flex items-start gap-3">
                        <Shield className="w-4 h-4 text-[#00629D] shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold">Role-Based Access Control (BR-01):</strong> Super Admin can create accounts and assign administrative scopes (HR Admin, Crew Admin, PR Admin). Password hashing enforces strict Bcrypt standard.
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-[8px] border border-[#E5E7EB] overflow-hidden shadow-xs">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#141B2C]">
                                <tr className="bg-[#141B2C] border-b border-[#E5E7EB] text-[11px] font-['JetBrains_Mono'] font-bold text-[#ffffff] uppercase tracking-wider">
                                    <th className="py-3.5 px-5">User</th>
                                    <th className="py-3.5 px-5">Username</th>
                                    <th className="py-3.5 px-5">Email</th>
                                    <th className="py-3.5 px-5">Role</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB] text-xs">
                                {(users || []).map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-5 font-bold text-[#141B2C]">
                                            {u.name}
                                        </td>
                                        <td className="py-4 px-5 font-['JetBrains_Mono'] text-slate-600">
                                            @{u.username}
                                        </td>
                                        <td className="py-4 px-5 text-[#404750]">
                                            {u.email}
                                        </td>
                                        <td className="py-4 px-5">
                                            {getRoleBadge(u.role)}
                                        </td>
                                        <td className="py-4 px-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(u)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#141B2C] hover:text-white rounded-[6px] text-xs font-semibold transition-colors cursor-pointer"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(u)}
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

            {/* Add / Edit User Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-5">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#00629D]" />
                            <h3 className="text-lg font-bold text-[#141B2C]">
                                {editingUser ? `Edit Account: ${editingUser.name}` : 'Create System Admin'}
                            </h3>
                        </div>
                        <button onClick={closeModal} className="text-slate-400 hover:text-[#141B2C] text-xl">&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Full Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Jane Doe"
                                required
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                            {errors.name && <span className="text-red-500 text-[11px] mt-1 block">{errors.name}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Username *</label>
                                <input
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="e.g. jane_admin"
                                    required
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                                {errors.username && <span className="text-red-500 text-[11px] mt-1 block">{errors.username}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Role (BR-01)</label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D] truncate"
                                >
                                    <option value="super_admin">Super Admin (All Modules)</option>
                                    <option value="hr_admin">HR Admin (Corporate Jobs & Banners)</option>
                                    <option value="crew_admin">Crew Admin (Vessel Jobs)</option>
                                    <option value="pr_admin">PR Admin (News & Clients)</option>
                                </select>
                                {errors.role && <span className="text-red-500 text-[11px] mt-1 block">{errors.role}</span>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Email Address *</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="e.g. admin@ptabb.com"
                                required
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                            {errors.email && <span className="text-red-500 text-[11px] mt-1 block">{errors.email}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                {editingUser ? 'Password (leave blank to keep unchanged)' : 'Password *'}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required={!editingUser}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 pr-10 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00629D] focus:outline-none transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <span className="text-red-500 text-[11px] mt-1 block">{errors.password}</span>}
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
                                {editingUser ? 'Update Account' : 'Create Account'}
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
                        <h3 className="text-lg font-bold">Delete Admin Account</h3>
                    </div>
                    <p className="text-xs text-[#404750] mb-6">
                        Are you sure you want to delete account <strong className="text-[#141B2C]">"{deletingUser?.name}"</strong>? They will immediately lose access to the dashboard.
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
