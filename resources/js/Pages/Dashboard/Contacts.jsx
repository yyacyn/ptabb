import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { Mail, Search, Filter, ArrowUpDown, Trash2, Eye, CheckCircle2, MessageSquare, Clock, User, Building2, Phone, Shield, X, RefreshCw, FileText, Download } from 'lucide-react';
import axios from 'axios';

const EMPTY_CONTACTS = [];

export default function Contacts({ contacts = EMPTY_CONTACTS }) {
    const pageProps = usePage().props;
    const userRole = pageProps.auth?.user?.role || 'super_admin';

    const [contactList, setContactList] = useState(contacts || []);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        setContactList(contacts || []);
    }, [contacts]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Active Selected Message Modal State
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Delete Confirmation Modal State
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Mark as Replied Confirmation Modal State
    const [showConfirmReplied, setShowConfirmReplied] = useState(false);

    // Close Modals on ESC Key Press or Body Scroll Lock
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (showConfirmReplied) {
                    setShowConfirmReplied(false);
                } else if (messageToDelete) {
                    setMessageToDelete(null);
                } else if (selectedMessage) {
                    setSelectedMessage(null);
                }
            }
        };

        const isAnyModalOpen = selectedMessage || messageToDelete || showConfirmReplied;

        if (isAnyModalOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedMessage, messageToDelete, showConfirmReplied]);

    // Department Badge Color Map
    const getDepartmentBadge = (dept) => {
        switch ((dept || '').toLowerCase()) {
            case 'commercial':
                return { label: 'Commercial & Charter', bg: 'bg-blue-50 text-[#00629D] border-blue-200' };
            case 'operation':
            case 'operations':
                return { label: 'Operations', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
            case 'hrd':
                return { label: 'HRD / Careers', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'crew':
                return { label: 'Crewing / Seafaring', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
            default:
                return { label: 'General Inquiry', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
        }
    };

    // Status Badge Color Map
    const getStatusBadge = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'new':
            case 'pending':
                return { label: 'New / Unread', bg: 'bg-blue-600 text-white' };
            case 'read':
                return { label: 'Read', bg: 'bg-slate-200 text-[#404750]' };
            case 'replied':
                return { label: 'Replied', bg: 'bg-emerald-600 text-white' };
            default:
                return { label: status || 'New', bg: 'bg-slate-200 text-slate-700' };
        }
    };

    // Filter & Sort Messages
    const filteredMessages = useMemo(() => {
        let result = (contactList || []).filter(item => {
            const name = item.name || '';
            const email = item.email || '';
            const company = item.company || '';
            const subject = item.subject || '';
            const message = item.message || '';
            const dept = item.department || '';
            const status = item.status || '';

            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                message.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDept = selectedDepartment === 'ALL' || dept.toLowerCase() === selectedDepartment.toLowerCase();
            const matchesStatus = selectedStatus === 'ALL' || status.toLowerCase() === selectedStatus.toLowerCase();

            return matchesSearch && matchesDept && matchesStatus;
        });

        return result.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();

            if (sortBy === 'oldest') return dateA - dateB;
            if (sortBy === 'name_asc') return nameA.localeCompare(nameB);
            return dateB - dateA; // default newest
        });
    }, [contactList, searchTerm, selectedDepartment, selectedStatus, sortBy]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredMessages.length / itemsPerPage) || 1;
    const paginatedMessages = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredMessages.slice(start, start + itemsPerPage);
    }, [filteredMessages, currentPage, itemsPerPage]);

    // Open Message Reader & Mark as Read
    const handleOpenMessage = async (msg) => {
        setSelectedMessage(msg);

        // Auto mark as read if status is 'new'
        if (msg.status === 'new' || msg.status === 'pending') {
            try {
                const res = await axios.put(route('contacts.update', msg.id), { status: 'read' });
                if (res.data && res.data.data) {
                    setContactList(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
                    setSelectedMessage(prev => prev ? { ...prev, status: 'read' } : null);
                }
            } catch (err) {
                console.error('Failed to update message status:', err);
            }
        }
    };

    // Update Message Status (e.g. Replied)
    const handleStatusUpdate = async (newStatus) => {
        if (!selectedMessage) return;

        setIsUpdatingStatus(true);
        try {
            const res = await axios.put(route('contacts.update', selectedMessage.id), { status: newStatus });
            if (res.data && res.data.data) {
                setContactList(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: newStatus } : m));
                setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (err) {
            console.error('Failed to update message status:', err);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Delete Message Action
    const handleDeleteConfirm = async () => {
        if (!messageToDelete) return;

        setIsDeleting(true);
        try {
            await axios.delete(route('contacts.destroy', messageToDelete.id));
            setContactList(prev => prev.filter(m => m.id !== messageToDelete.id));
            if (selectedMessage && selectedMessage.id === messageToDelete.id) {
                setSelectedMessage(null);
            }
            setMessageToDelete(null);
        } catch (err) {
            console.error('Failed to delete message:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> INBOX & CONTACT MESSAGES
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight flex items-center gap-2">
                            Contact Form Submissions
                        </h2>
                    </div>

                    <div className="font-['JetBrains_Mono'] text-sm text-[#404750] bg-white border border-[#E5E7EB] rounded-[8px] px-3.5 py-2 flex items-center gap-2">
                        Total Messages: <span className="font-bold text-[#141B2C]">{contactList.length}</span>
                    </div>
                </div>
            }
        >
            <Head title="Contact Messages - PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">

                    {/* Toolbar Filters & Search */}
                    <div className="bg-white rounded-[8px] p-4 border border-[#E5E7EB] space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">

                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                placeholder="Search by name, email, company, or subject..."
                                className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-[8px] text-sm focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>

                        {/* Dropdown Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 text-sm text-[#404750]">
                                <Filter className="w-3.5 h-3.5 text-[#00629D]" />
                                <span className="font-bold">Filter:</span>
                            </div>

                            {/* Department Filter (Role-scoped options) */}
                            {userRole === 'super_admin' && (
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => { setSelectedDepartment(e.target.value); setCurrentPage(1); }}
                                    className="border border-[#E5E7EB] rounded-[8px] text-sm py-2 px-3 pr-7 focus:border-[#00629D] focus:ring-[#00629D] bg-white cursor-pointer"
                                >
                                    <option value="ALL">All Departments</option>
                                    <option value="hrd">HRD / Careers</option>
                                    <option value="crew">Crewing / Seafaring</option>
                                    <option value="commercial">Commercial & Charter</option>
                                    <option value="operation">Operations</option>
                                    <option value="general">General Inquiry</option>
                                </select>
                            )}
                            {userRole === 'pr_admin' && (
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => { setSelectedDepartment(e.target.value); setCurrentPage(1); }}
                                    className="border border-[#E5E7EB] rounded-[8px] text-sm py-2 px-3 pr-7 focus:border-[#00629D] focus:ring-[#00629D] bg-white cursor-pointer"
                                >
                                    <option value="ALL">All PR Departments</option>
                                    <option value="commercial">Commercial & Charter</option>
                                    <option value="operation">Operations</option>
                                    <option value="general">General Inquiry</option>
                                </select>
                            )}

                            {/* Status Filter */}
                            <select
                                value={selectedStatus}
                                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                                className="border border-[#E5E7EB] rounded-[8px] text-sm py-2 px-3 pr-7 focus:border-[#00629D] focus:ring-[#00629D] bg-white cursor-pointer"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="new">New (Unread)</option>
                                <option value="read">Read</option>
                                <option value="replied">Replied</option>
                            </select>

                            {/* Sort Selector */}
                            <div className="flex items-center gap-1 border-l border-[#E5E7EB] pl-3">
                                <ArrowUpDown className="w-3.5 h-3.5 text-[#00629D]" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border border-[#E5E7EB] rounded-[8px] text-sm py-2 px-3 pr-7 focus:border-[#00629D] focus:ring-[#00629D] bg-white cursor-pointer"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="name_asc">Sender Name (A–Z)</option>
                                </select>
                            </div>

                            {/* Refresh Button */}
                            <button
                                type="button"
                                disabled={isRefreshing}
                                onClick={() => {
                                    setIsRefreshing(true);
                                    router.reload({
                                        only: ['contacts'],
                                        preserveScroll: true,
                                        onFinish: () => setIsRefreshing(false),
                                    });
                                }}
                                className="border border-[#E5E7EB] hover:border-[#00629D] bg-white hover:bg-slate-50 text-[#141B2C] rounded-[8px] p-2 transition-[colors,shadow,opacity,transform] cursor-pointer flex items-center justify-center disabled:opacity-50"
                                title="Refresh Contacts List"
                            >
                                <RefreshCw className={`w-4 h-4 text-[#00629D] ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                    </div>

                    {/* Contact Messages Table */}
                    <div className="bg-white rounded-[10px] border border-[#E5E7EB]  overflow-hidden">
                        {paginatedMessages.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full table-fixed text-left text-sm border-collapse">
                                    <thead className="bg-[#141B2C] text-white font-['JetBrains_Mono'] uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4 w-[28%]">Sender & Company</th>
                                            <th className="p-4 w-[38%]">Subject</th>
                                            <th className="p-4 w-[16%]">Date Sent</th>
                                            <th className="p-4 w-[16%]">Status</th>
                                            <th className="p-4 w-[4%] text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E7EB] text-[#141B2C]">
                                        {paginatedMessages.map((msg) => {
                                            const statusBadge = getStatusBadge(msg.status);
                                            const isUnread = msg.status === 'new' || msg.status === 'pending';

                                            return (
                                                <tr
                                                    key={msg.id}
                                                    onClick={() => handleOpenMessage(msg)}
                                                    className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${isUnread ? 'font-semibold bg-blue-50/20' : ''
                                                        }`}
                                                >
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            {isUnread && (
                                                                <span className="w-2 h-2 rounded-full bg-[#00629D] shrink-0"></span>
                                                            )}
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-[#141B2C] truncate">
                                                                    {msg.name}
                                                                </div>
                                                                <div className="text-[11px] text-[#8AAFC8] font-['JetBrains_Mono'] truncate max-w-[200px]">
                                                                    {msg.email} {msg.company ? `• ${msg.company}` : ''}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td style={{ maxWidth: '200px', overflow: 'hidden' }} className="p-4">
                                                        <div className="w-full truncate whitespace-nowrap text-[#141B2C] font-medium" title={msg.subject || 'No Subject'}>
                                                            {msg.subject || 'No Subject'}
                                                        </div>
                                                        <div className="w-full truncate whitespace-nowrap text-[11px] text-[#404750] font-normal" title={msg.message}>
                                                            {msg.message}
                                                        </div>
                                                    </td>

                                                    <td className="p-4 font-['JetBrains_Mono'] text-[11px] text-[#404750] whitespace-nowrap">
                                                        {msg.created_at ? new Date(msg.created_at).toLocaleDateString('en-GB', {
                                                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        }) : '-'}
                                                    </td>

                                                    <td className="p-4">
                                                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase ${statusBadge.bg}`}>
                                                            {statusBadge.label}
                                                        </span>
                                                    </td>

                                                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenMessage(msg)}
                                                                className="p-1.5 text-[#00629D] hover:bg-blue-50 rounded-[6px] transition-colors"
                                                                title="Read Message"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => setMessageToDelete(msg)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-[6px] transition-colors"
                                                                title="Delete Message"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="p-12 text-center space-y-3">
                                <Mail className="w-12 h-12 text-slate-300 mx-auto" />
                                <h3 className="text-base font-bold text-[#141B2C]">No Contact Messages</h3>
                                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                                    No contact submissions match your active filter criteria.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <div className="bg-white rounded-[8px] p-4 border border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 font-['Hanken_Grotesk']">
                            <div className="font-['JetBrains_Mono'] text-sm text-[#8AAFC8]">
                                Showing <span className="font-bold text-[#141B2C]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                <span className="font-bold text-[#141B2C]">{Math.min(currentPage * itemsPerPage, filteredMessages.length)}</span> of{' '}
                                <span className="font-bold text-[#141B2C]">{filteredMessages.length}</span> messages
                            </div>

                            <div className="flex items-center gap-1.5">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-[6px] text-sm font-bold transition-[colors,shadow,opacity,transform] cursor-pointer ${currentPage === page
                                            ? 'bg-[#00629D] text-white'
                                            : 'border border-[#E5E7EB] text-[#141B2C] hover:border-[#00629D]'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* MESSAGE DETAIL READER MODAL */}
            {selectedMessage && (
                <div
                    onClick={() => setSelectedMessage(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-['Hanken_Grotesk'] animate-in fade-in duration-200 cursor-pointer"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-2xl w-full max-w-[1000px] p-6 space-y-4 max-h-[85vh] overflow-y-auto cursor-default"
                    >
                        <div className="flex items-start justify-between  gap-4">
                            <div className="min-w-0 flex-1">
                                <div className="font-['JetBrains_Mono'] text-sm text-[#00629D] font-bold uppercase tracking-wider mb-1.5">
                                    STATUS
                                </div>
                                <div>
                                    <span className={`inline-block px-3 py-1 rounded text-sm font-['JetBrains_Mono'] font-bold uppercase ${getStatusBadge(selectedMessage.status).bg}`}>
                                        {getStatusBadge(selectedMessage.status).label}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedMessage(null)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md cursor-pointer shrink-0"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* 30 / 70 Side-by-Side Flex Layout */}
                        <div className="flex gap-5 items-start w-full">

                            {/* LEFT SIDEBAR (30% Width) — Sender Info & Actions */}
                            <div style={{ width: '32%', flesmhrink: 0 }} className="space-y-4 bg-[#F5F5F5] rounded-[10px] p-4 border border-[#E5E7EB]">

                                {/* Subject */}
                                <div className="space-y-1">
                                    <span className="text-[11px] font-['JetBrains_Mono'] font-bold text-[#8AAFC8] uppercase block">
                                        SUBJECT
                                    </span>
                                    <h3 className="text-base font-bold text-[#141B2C] break-words leading-snug" title={selectedMessage.subject || 'No Subject Line'}>
                                        {selectedMessage.subject || 'No Subject Line'}
                                    </h3>
                                </div>

                                {/* Sender Details */}
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-[11px] text-[#8AAFC8] block font-['JetBrains_Mono'] uppercase font-bold">Sender Name</span>
                                        <span className="font-bold text-[#141B2C] flex items-center gap-1.5 mt-1 text-[14px]">
                                            <User className="w-4 h-4 text-[#00629D] shrink-0" />
                                            {selectedMessage.name}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-[11px] text-[#8AAFC8] block font-['JetBrains_Mono'] uppercase font-bold">Email</span>
                                        <a href={`mailto:${selectedMessage.email}`} className="text-[#00629D] hover:underline font-['JetBrains_Mono'] break-all block mt-1 text-[13px]">
                                            {selectedMessage.email}
                                        </a>
                                    </div>

                                    {selectedMessage.company && (
                                        <div>
                                            <span className="text-[11px] text-[#8AAFC8] block font-['JetBrains_Mono'] uppercase font-bold">Company</span>
                                            <span className="font-semibold text-[#141B2C] flex items-center gap-1.5 mt-1 text-[13px]">
                                                <Building2 className="w-4 h-4 text-[#00629D] shrink-0" />
                                                {selectedMessage.company}
                                            </span>
                                        </div>
                                    )}

                                    {selectedMessage.phone && (
                                        <div>
                                            <span className="text-[11px] text-[#8AAFC8] block font-['JetBrains_Mono'] uppercase font-bold">Phone</span>
                                            <a href={`tel:${selectedMessage.phone}`} className="text-[#00629D] hover:underline font-['JetBrains_Mono'] block mt-1 text-[13px]">
                                                {selectedMessage.phone}
                                            </a>
                                        </div>
                                    )}

                                    <div>
                                        <span className="text-[11px] text-[#8AAFC8] block font-['JetBrains_Mono'] uppercase font-bold">Date Received</span>
                                        <span className="font-['JetBrains_Mono'] text-sm text-[#404750] block mt-1">
                                            {new Date(selectedMessage.created_at).toLocaleString()}
                                        </span>
                                    </div>

                                    {selectedMessage.resume_path && (
                                        <div>
                                            <span className="text-[11px] text-[#8AAFC8] block font-['JetBrains_Mono'] uppercase font-bold">Attached Resume / CV</span>
                                            <a
                                                href={route('contacts.resume.preview', selectedMessage.id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1.5 inline-flex items-center gap-2 bg-[#F0F4F8] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#00629D] font-semibold text-[13px] px-3 py-1.5 rounded-[6px] transition-colors"
                                            >
                                                <FileText className="w-4 h-4 text-[#00629D]" />
                                                Preview Resume
                                            </a>
                                        </div>
                                    )}

                                    {selectedMessage.ip_address && (
                                        <div>
                                            <span className="text-[11px] text-[#8AAFC8] block font-['JetBrains_Mono'] uppercase font-bold">IP Address</span>
                                            <span className="font-['JetBrains_Mono'] text-sm text-[#404750] block mt-1">
                                                {selectedMessage.ip_address}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="space-y-2">
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=RE: ${encodeURIComponent(selectedMessage.subject || 'Inquiry')}`}
                                        className="w-full bg-[#00629D] hover:bg-[#3F96DD] text-white text-sm font-semibold px-3 py-2 rounded-[6px] transition-[colors,shadow,opacity,transform] flex items-center justify-center gap-1.5 cursor-pointer "
                                    >
                                        <MessageSquare className="w-4 h-4" /> Reply via Email
                                    </a>

                                    {selectedMessage.status !== 'replied' && (
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmReplied(true)}
                                            disabled={isUpdatingStatus}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-3 py-2 rounded-[6px] transition-[colors,shadow,opacity,transform] flex items-center justify-center gap-1.5 cursor-pointer "
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Mark Replied
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setMessageToDelete(selectedMessage)}
                                        className="w-full border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold px-3 py-2 rounded-[6px] transition-[colors,shadow,opacity,transform] flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete Message
                                    </button>
                                </div>

                            </div>

                            {/* RIGHT MAIN PANEL (70% Width) — Message Body Only */}
                            <div style={{ width: '68%', flexGrow: 1, minWidth: 0 }} className="space-y-2.5">
                                <label className="text-sm font-bold text-[#141B2C] uppercase tracking-wider font-['JetBrains_Mono'] flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4 text-[#00629D]" />
                                    Message Body
                                </label>

                                <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-5 text-[14px] leading-relaxed text-[#141B2C] whitespace-pre-wrap font-normal min-h-[260px] max-h-[420px] overflow-y-auto">
                                    {(() => {
                                        const text = selectedMessage.message || '';
                                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                                        const parts = text.split(urlRegex);
                                        return parts.map((part, index) => {
                                            if (part.match(urlRegex)) {
                                                return (
                                                    <a
                                                        key={index}
                                                        href={part}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#00629D] font-bold underline hover:text-[#3F96DD] break-all inline-flex items-center gap-1"
                                                    >
                                                        {part}
                                                    </a>
                                                );
                                            }
                                            return part;
                                        });
                                    })()}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {messageToDelete && (
                <div
                    onClick={() => setMessageToDelete(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-['Hanken_Grotesk'] animate-in fade-in duration-200 cursor-pointer"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-2xl max-w-sm w-full p-6 space-y-4 text-center cursor-default"
                    >
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>

                        <h3 className="text-lg font-bold text-[#141B2C]">Delete Message?</h3>
                        <p className="text-sm text-[#404750] leading-relaxed">
                            Are you sure you want to delete this message from <span className="font-bold">{messageToDelete.name}</span>? This action cannot be undone.
                        </p>

                        <div className="pt-2 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setMessageToDelete(null)}
                                className="bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-sm font-semibold px-4 py-2 rounded-[6px] transition-[colors,shadow,opacity,transform] cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded-[6px] transition-[colors,shadow,opacity,transform] cursor-pointer "
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MARK AS REPLIED CONFIRMATION MODAL */}
            {showConfirmReplied && selectedMessage && (
                <div
                    onClick={() => setShowConfirmReplied(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-['Hanken_Grotesk'] animate-in fade-in duration-200 cursor-pointer"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-2xl max-w-sm w-full p-6 space-y-4 text-center cursor-default"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>

                        <h3 className="text-lg font-bold text-[#141B2C]">Mark as Replied?</h3>
                        <p className="text-sm text-[#404750] leading-relaxed">
                            Are you sure you want to mark this message from <span className="font-bold">{selectedMessage.name}</span> as replied?
                        </p>

                        <div className="pt-2 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmReplied(false)}
                                className="bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-sm font-semibold px-4 py-2 rounded-[6px] transition-[colors,shadow,opacity,transform] cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    setShowConfirmReplied(false);
                                    await handleStatusUpdate('replied');
                                }}
                                disabled={isUpdatingStatus}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-[6px] transition-[colors,shadow,opacity,transform] cursor-pointer"
                            >
                                {isUpdatingStatus ? 'Updating...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
