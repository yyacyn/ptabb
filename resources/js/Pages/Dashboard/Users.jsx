import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Users, Plus, Shield, Edit2, Trash2, AlertTriangle, Eye, EyeOff, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

export default function UsersManagement({ users = [] }) {
    const currentUser = usePage().props.auth.user;
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
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
        if (currentUser && (intId(currentUser.id) === intId(user.id))) {
            return;
        }
        setDeletingUser(user);
        setDeleteModalOpen(true);
    };

    const intId = (val) => parseInt(val) || 0;

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

    const totalPages = Math.ceil((users || []).length / itemsPerPage) || 1;
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return (users || []).slice(start, start + itemsPerPage);
    }, [users, currentPage, itemsPerPage]);

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
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-[colors,shadow,opacity,transform] cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Create System Admin
                    </button>
                </div>
            }
        >
            <Head title="User Management | PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">

                    {/* BR-01 RBAC Rule Compliance Banner */}
                    <div className="bg-sky-50 border border-sky-200 rounded-[8px] p-4 text-xs text-sky-900 flex items-start gap-3">
                        <Shield className="w-4 h-4 text-[#00629D] shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold">Business Rule Compliance (BR-01):</strong> Role Scope gating is strictly enforced across the dashboard.
                            <span className="block text-[11px] text-sky-700 mt-0.5">
                                • <strong>Super Admin:</strong> Fleet, HQ Contact Info, Users &nbsp;|&nbsp;
                                • <strong>HR Admin:</strong> Careers (corporate) & Notifications &nbsp;|&nbsp;
                                • <strong>Crew Admin:</strong> Careers (vessel crew) &nbsp;|&nbsp;
                                • <strong>PR Admin:</strong> News, Clients
                            </span>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-[10px] border border-[#E5E7EB]  overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-[#141B2C] text-white font-['JetBrains_Mono'] uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-5">User Profile</th>
                                    <th className="py-3.5 px-5">Username</th>
                                    <th className="py-3.5 px-5">Email Address</th>
                                    <th className="py-3.5 px-5">Role (BR-01)</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                {paginatedUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="font-bold text-[#141B2C] text-sm">{u.name}</div>
                                        </td>
                                        <td className="py-4 px-5 font-['JetBrains_Mono'] text-slate-600">
                                            @{u.username}
                                        </td>
                                        <td className="py-4 px-5 font-['JetBrains_Mono'] text-slate-600">
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
                                                {currentUser && parseInt(currentUser.id) === parseInt(u.id) ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-[6px] text-xs font-semibold cursor-not-allowed" title="Self-deletion blocked for active Super Admin account (BR-01)">
                                                        <Lock className="w-3.5 h-3.5" /> Self
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => confirmDelete(u)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                )}
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
                                    {Math.min(currentPage * itemsPerPage, users.length)}
                                </span>{' '}
                                of <span className="font-bold text-[#141B2C]">{users.length}</span> users
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

            {/* Add / Edit User Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between  border-[#E5E7EB] pb-4 mb-5">
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
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value.slice(0, 255))}
                                placeholder="e.g. Jane Doe"
                                maxLength={255}
                                required
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                            {(data.name || '').length >= 255 && (
                                <span className="text-amber-600 text-[11px] font-['JetBrains_Mono'] mt-1 block">Maximum limit reached (255 chars).</span>
                            )}
                            {errors.name && <span className="text-red-500 text-[11px] mt-1 block">{errors.name}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value.slice(0, 100))}
                                    placeholder="e.g. jane_admin"
                                    maxLength={100}
                                    required
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                                {(data.username || '').length >= 100 && (
                                    <span className="text-amber-600 text-[11px] font-['JetBrains_Mono'] mt-1 block">Maximum limit reached (100 chars).</span>
                                )}
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
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value.slice(0, 255))}
                                placeholder="e.g. admin@ptabb.com"
                                maxLength={255}
                                required
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                            {(data.email || '').length >= 255 && (
                                <span className="text-amber-600 text-[11px] font-['JetBrains_Mono'] mt-1 block">Maximum limit reached (255 chars).</span>
                            )}
                            {errors.email && <span className="text-red-500 text-[11px] mt-1 block">{errors.email}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                {editingUser ? 'Password (leave blank to keep unchanged)' : <>Password <span className="text-red-500">*</span></>}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value.slice(0, 255))}
                                    placeholder="••••••••"
                                    maxLength={255}
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
                            {errors?.password && <span className="text-rose-500 text-[11px] font-medium mt-1 block">{errors.password}</span>}
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
