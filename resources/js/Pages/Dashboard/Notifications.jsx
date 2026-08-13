import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    Bell, Plus, AlertTriangle, Edit2, Trash2, ChevronLeft, ChevronRight,
    Calendar, Image as ImageIcon, RefreshCw, Sparkles, Filter, CheckCircle2,
    Clock, ShieldAlert, FileText, Upload, ArrowUpDown, Wand2
} from 'lucide-react';

export default function Notifications({ notifications = [] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [activeTab, setActiveTab] = useState('all'); // all, home, career, celebration
    const [sortBy, setSortBy] = useState('closest_today'); // closest_today, start_date_asc, start_date_desc, newest, oldest, title_asc
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [deletingNotification, setDeletingNotification] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        type: 'home',
        content: '',
        status: 'active',
        start_date: '',
        end_date: '',
        image: null,
    });

    const openModal = (notification = null) => {
        setEditingNotification(notification);
        setAiError(null);
        if (notification) {
            setData({
                title: notification.title || '',
                type: notification.type || 'home',
                content: notification.content || '',
                status: notification.status || 'active',
                start_date: notification.start_date || '',
                end_date: notification.end_date || '',
                image: notification.image || null,
            });
            setImagePreview(notification.image || null);
        } else {
            reset();
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingNotification(null);
        setImagePreview(null);
        setAiError(null);
        reset();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
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

    const handleSyncHolidays = () => {
        setIsSyncing(true);
        router.post(route('notifications.sync-holidays'), {}, {
            onFinish: () => setIsSyncing(false),
        });
    };

    const getCsrfToken = () => {
        const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (metaToken) return metaToken;

        const cookieMatch = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        if (cookieMatch) return decodeURIComponent(cookieMatch[1]);

        return '';
    };

    const handleGenerateAiContent = async () => {
        if (!data.title || !data.title.trim()) {
            setAiError('Please enter a Banner Title / Celebration Day Name first.');
            return;
        }

        setAiError(null);
        setIsGeneratingAi(true);

        try {
            const token = getCsrfToken();
            const response = await fetch(route('notifications.generate-ai-content'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-XSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    title: data.title,
                    type: data.type,
                    start_date: data.start_date,
                    end_date: data.end_date,
                }),
            });

            if (response.status === 419) {
                setAiError('Session expired. Please refresh the page and try again.');
                return;
            }

            const resData = await response.json();
            if (resData.success && resData.content) {
                setData('content', resData.content.slice(0, 255));
            } else {
                setAiError(resData.message || 'Unable to generate AI content.');
            }
        } catch (err) {
            setAiError('Failed to connect to AI generator service.');
        } finally {
            setIsGeneratingAi(false);
        }
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

    const applyHolidayPreset = (preset) => {
        const currentYear = new Date().getFullYear();
        let startDate = '';
        let endDate = '';

        switch (preset) {
            case 'kemerdekaan':
                startDate = `${currentYear}-08-17`;
                endDate = `${currentYear}-08-17`;
                setData((prev) => ({
                    ...prev,
                    title: `Selamat Hari Kemerdekaan Republik Indonesia Ke-${currentYear - 1945}`,
                    type: 'celebration',
                    status: 'scheduled',
                    start_date: startDate,
                    end_date: endDate,
                    content: 'Dirgahayu Republik Indonesia! Nusantara Baru, Indonesia Maju. Mari bersama menjaga kejayaan maritim dan nusantara.',
                }));
                break;
            case 'tahunbaru':
                startDate = `${currentYear + 1}-01-01`;
                endDate = `${currentYear + 1}-01-01`;
                setData((prev) => ({
                    ...prev,
                    title: `Selamat Tahun Baru ${currentYear + 1}`,
                    type: 'celebration',
                    status: 'scheduled',
                    start_date: startDate,
                    end_date: endDate,
                    content: `PT. Pelayaran Andalas Bahtera Baruna mengucapkan Selamat Tahun Baru ${currentYear + 1}. Semoga tahun baru membawa keberkahan dan kesuksesan bersama.`,
                }));
                break;
            case 'pancasila':
                startDate = `${currentYear}-06-01`;
                endDate = `${currentYear}-06-01`;
                setData((prev) => ({
                    ...prev,
                    title: 'Selamat Hari Lahir Pancasila',
                    type: 'celebration',
                    status: 'scheduled',
                    start_date: startDate,
                    end_date: endDate,
                    content: 'Pancasila Jiwa Pemersatu Bangsa Menuju Indonesia Emas 2045.',
                }));
                break;
            case 'pahlawan':
                startDate = `${currentYear}-11-10`;
                endDate = `${currentYear}-11-10`;
                setData((prev) => ({
                    ...prev,
                    title: 'Selamat Hari Pahlawan',
                    type: 'celebration',
                    status: 'scheduled',
                    start_date: startDate,
                    end_date: endDate,
                    content: 'Pahlawanku Teladanku. Mengenang jasa para pahlawan yang telah berjuang demi kejayaan bangsa.',
                }));
                break;
            case 'natal':
                startDate = `${currentYear}-12-24`;
                endDate = `${currentYear}-12-25`;
                setData((prev) => ({
                    ...prev,
                    title: 'Selamat Hari Raya Natal & Tahun Baru',
                    type: 'celebration',
                    status: 'scheduled',
                    start_date: startDate,
                    end_date: endDate,
                    content: 'Semoga kasih, kedamaian, dan kebahagiaan Natal senantiasa menyertai kita semua.',
                }));
                break;
            default:
                break;
        }
    };

    // Helper score to compute distance from today for "Closest to Today" sorting
    const getClosestScore = (item) => {
        const dateStr = item.start_date || item.end_date;
        if (!dateStr) return 9999999999999;

        const todayMs = new Date().setHours(0, 0, 0, 0);
        const targetMs = new Date(dateStr).setHours(0, 0, 0, 0);
        const diff = targetMs - todayMs;

        // Upcoming or today (diff >= 0) sorted by closest days first.
        // Past dates (diff < 0) ranked after upcoming dates sorted by most recent past first.
        return diff >= 0 ? diff : Math.abs(diff) + 1000000000000;
    };

    // Filter and Sort notifications
    const filteredNotifications = useMemo(() => {
        if (!notifications || !Array.isArray(notifications)) return [];
        let list = activeTab === 'all' ? [...notifications] : notifications.filter(item => item.type === activeTab);

        return list.sort((a, b) => {
            if (sortBy === 'closest_today') {
                return getClosestScore(a) - getClosestScore(b);
            }
            if (sortBy === 'start_date_asc') {
                const dateA = a.start_date || '9999-12-31';
                const dateB = b.start_date || '9999-12-31';
                return dateA.localeCompare(dateB);
            }
            if (sortBy === 'start_date_desc') {
                const dateA = a.start_date || '0000-01-01';
                const dateB = b.start_date || '0000-01-01';
                return dateB.localeCompare(dateA);
            }
            if (sortBy === 'newest') {
                return (b.id || 0) - (a.id || 0);
            }
            if (sortBy === 'oldest') {
                return (a.id || 0) - (b.id || 0);
            }
            if (sortBy === 'title_asc') {
                return (a.title || '').localeCompare(b.title || '');
            }
            return 0;
        });
    }, [notifications, activeTab, sortBy]);

    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage) || 1;
    const paginatedNotifications = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredNotifications.slice(start, start + itemsPerPage);
    }, [filteredNotifications, currentPage, itemsPerPage]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Bell className="w-3.5 h-3.5" /> SITEWIDE NOTIFICATIONS & POP-UPS
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            Pop-ups & Indonesia National Holidays Manager
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSyncHolidays}
                            disabled={isSyncing}
                            className="inline-flex items-center gap-2 bg-white border border-[#E5E7EB] text-[#141B2C] hover:border-[#00629D] hover:text-[#00629D] text-xs font-semibold px-3.5 py-2.5 rounded-[8px] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            title="Synchronize Indonesian national API"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 text-[#00629D] ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing API...' : 'Update National Holidays'}
                        </button>

                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-[colors,shadow,opacity,transform] cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Create Pop-up Banner
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Notifications Management | PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">

                    {/* BR-06 Compliance Info Alert */}
                    <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <div className="font-bold text-amber-950 flex items-center gap-2">
                                <span>Business Rule Compliance (BR-06): Multi-Type Activation Enabled</span>
                                <span className="bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono']">
                                    1 Active Banner per Type
                                </span>
                            </div>
                            <p className="text-[#404750] leading-relaxed">
                                You can activate <strong>1 Indonesia National Holidays</strong> AND <strong>1 Career/Home Pop-up</strong> simultaneously. Activating a new banner will set other banners of the <em>same type</em> to inactive. Celebration popups activate automatically on their scheduled dates.
                            </p>
                        </div>
                    </div>

                    {/* Filter Tabs & Sort Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-[10px] border border-[#E5E7EB] shadow-xs">
                        <div className="flex items-center gap-1 overflow-x-auto py-1">
                            <button
                                type="button"
                                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                                className={`px-3.5 py-2 rounded-[6px] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                    activeTab === 'all'
                                        ? 'bg-[#141B2C] text-white shadow-xs'
                                        : 'text-[#404750] hover:bg-slate-100 hover:text-[#141B2C]'
                                }`}
                            >
                                <Filter className="w-3.5 h-3.5" /> All Pop-ups ({notifications.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => { setActiveTab('celebration'); setCurrentPage(1); }}
                                className={`px-3.5 py-2 rounded-[6px] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                    activeTab === 'celebration'
                                        ? 'bg-[#00629D] text-white shadow-xs'
                                        : 'text-[#404750] hover:bg-slate-100 hover:text-[#141B2C]'
                                }`}
                            >
                                Indonesia National Holidays ({(notifications || []).filter(n => n.type === 'celebration').length})
                            </button>

                            <button
                                type="button"
                                onClick={() => { setActiveTab('home'); setCurrentPage(1); }}
                                className={`px-3.5 py-2 rounded-[6px] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                    activeTab === 'home'
                                        ? 'bg-[#00629D] text-white shadow-xs'
                                        : 'text-[#404750] hover:bg-slate-100 hover:text-[#141B2C]'
                                }`}
                            >
                                Home Page Banners ({(notifications || []).filter(n => n.type === 'home').length})
                            </button>

                            <button
                                type="button"
                                onClick={() => { setActiveTab('career'); setCurrentPage(1); }}
                                className={`px-3.5 py-2 rounded-[6px] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                    activeTab === 'career'
                                        ? 'bg-[#00629D] text-white shadow-xs'
                                        : 'text-[#404750] hover:bg-slate-100 hover:text-[#141B2C]'
                                }`}
                            >
                                Career Banners ({(notifications || []).filter(n => n.type === 'career').length})
                            </button>
                        </div>

                        {/* Sort Selector Dropdown */}
                        <div className="flex items-center gap-3 px-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-[#404750]">
                                <ArrowUpDown className="w-3.5 h-3.5 text-[#00629D] shrink-0" />
                                <span className="font-bold">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                                    className="truncate border border-[#E5E7EB] rounded-[6px] text-xs py-1.5 px-2.5 bg-white focus:border-[#00629D] focus:ring-[#00629D] font-medium cursor-pointer w-[200px]"
                                >
                                    <option value="closest_today" className="truncate">Closest to Today</option>
                                    <option value="start_date_asc" className="truncate">Date Scheduled (Earliest First)</option>
                                    <option value="start_date_desc" className="truncate">Date Scheduled (Latest First)</option>
                                    <option value="newest" className="truncate">Newest Created</option>
                                    <option value="oldest" className="truncate">Oldest Created</option>
                                    <option value="title_asc" className="truncate">Title (A - Z)</option>
                                </select>
                            </div>

                            <div className="font-['JetBrains_Mono'] text-[11px] text-[#8AAFC8]">
                                {filteredNotifications.length} items
                            </div>
                        </div>
                    </div>

                    {/* Notifications Grid Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedNotifications.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-[10px] border border-[#E5E7EB] hover:border-[#00629D] p-5 transition-all shadow-xs flex flex-col justify-between"
                            >
                                <div>
                                    {/* Card Header Badges */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-[#F5F5F5] text-[#00629D] border-[#E5E7EB]">
                                                {item.type === 'celebration' ? 'Celebration' : `Target: ${item.type}`}
                                            </span>

                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-['JetBrains_Mono'] font-bold uppercase flex items-center gap-1 ${
                                                item.status === 'active'
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                    : item.status === 'scheduled'
                                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                            }`}>
                                                {item.status === 'active' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                                {item.status === 'scheduled' && <Clock className="w-3 h-3 text-blue-600" />}
                                                {item.status}
                                            </span>

                                            {Boolean(item.image) && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-['JetBrains_Mono'] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                                                    <ImageIcon className="w-3 h-3 text-[#00629D]" /> Image Attached
                                                </span>
                                            )}
                                        </div>

                                        {item.start_date && (
                                            <div className="flex items-center gap-1 text-[11px] font-['JetBrains_Mono'] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                <Calendar className="w-3 h-3 text-[#00629D]" />
                                                <span>{item.start_date} {item.end_date && item.end_date !== item.start_date ? `→ ${item.end_date}` : ''}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Title & Announcement Content */}
                                    <div className="space-y-2 mb-4">
                                        <h3 className="font-bold text-base text-[#141B2C] leading-snug">{item.title}</h3>

                                        {item.type !== 'celebration' && item.content && (
                                            <p className="text-xs text-[#404750] line-clamp-3 leading-relaxed">
                                                {item.content}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-3 border-[#E5E7EB] flex items-center justify-end gap-2 mt-auto">
                                    <div className="flex items-center gap-2 shrink-0">
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
                            </div>
                        ))}

                        {(!filteredNotifications || filteredNotifications.length === 0) && (
                            <div className="col-span-full bg-white rounded-[10px] border border-[#E5E7EB] p-12 text-center text-xs text-[#404750] space-y-3">
                                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                                <div>No pop-up banners found for this filter tab. Click "Create Pop-up Banner" or "Update National Holidays" to add popups.</div>
                            </div>
                        )}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <div className="bg-white rounded-[10px] p-4 border border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 font-['Hanken_Grotesk'] shadow-xs">
                            <div className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8]">
                                Showing <span className="font-bold text-[#141B2C]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                <span className="font-bold text-[#141B2C]">
                                    {Math.min(currentPage * itemsPerPage, filteredNotifications.length)}
                                </span>{' '}
                                of <span className="font-bold text-[#141B2C]">{filteredNotifications.length}</span> pop-ups
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
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C] space-y-4 max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-[#E5E7EB] pb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#00629D]" />
                            <h3 className="text-lg font-bold text-[#141B2C]">
                                {editingNotification ? `Edit Pop-up: ${editingNotification.title}` : 'Create Pop-up Banner'}
                            </h3>
                        </div>
                        <button onClick={closeModal} className="text-slate-400 hover:text-[#141B2C] text-xl font-bold">&times;</button>
                    </div>

                    {/* Indonesian Holiday Presets Helper (Only for Celebration popups) */}
                    {data.type === 'celebration' && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-[8px] p-3 text-xs text-indigo-900 space-y-2">
                            <div className="font-bold flex items-center gap-1.5 text-indigo-950">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <span>Quick Helper: Indonesian Celebration Day Presets</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => applyHolidayPreset('kemerdekaan')}
                                    className="px-2.5 py-1 bg-white hover:bg-red-50 hover:text-red-700 text-slate-700 rounded border border-indigo-200 font-medium text-[11px] transition-colors cursor-pointer"
                                >
                                    17 Agt - Hari Kemerdekaan RI
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyHolidayPreset('tahunbaru')}
                                    className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded border border-indigo-200 font-medium text-[11px] transition-colors cursor-pointer"
                                >
                                    1 Jan - Tahun Baru Masehi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyHolidayPreset('pancasila')}
                                    className="px-2.5 py-1 bg-white hover:bg-[#00629D]/10 hover:text-[#00629D] text-slate-700 rounded border border-indigo-200 font-medium text-[11px] transition-colors cursor-pointer"
                                >
                                    1 Jun - Hari Lahir Pancasila
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyHolidayPreset('pahlawan')}
                                    className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:text-amber-700 text-slate-700 rounded border border-indigo-200 font-medium text-[11px] transition-colors cursor-pointer"
                                >
                                    10 Nov - Hari Pahlawan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyHolidayPreset('natal')}
                                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded border border-indigo-200 font-medium text-[11px] transition-colors cursor-pointer"
                                >
                                    25 Des - Hari Raya Natal
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                Banner Title / Celebration Day Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value.slice(0, 255))}
                                maxLength={255}
                                placeholder="e.g. Selamat Hari Kemerdekaan Republik Indonesia Ke-81"
                                required
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                            {errors.title && <span className="text-red-500 text-[11px] mt-1 block">{errors.title}</span>}
                        </div>

                        {/* Type & Status Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Pop-up Type / Target</label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full truncate border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                >
                                    <option value="celebration" className="truncate">Celebration Day</option>
                                    <option value="home" className="truncate">Home Page Banner</option>
                                    <option value="career" className="truncate">Careers Page Banner</option>
                                </select>
                                {errors.type && <span className="text-red-500 text-[11px] mt-1 block">{errors.type}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full truncate border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                >
                                    <option value="active" className="truncate">Active</option>
                                    <option value="scheduled" className="truncate">Scheduled</option>
                                    <option value="inactive" className="truncate">Inactive</option>
                                </select>
                                {errors.status && <span className="text-red-500 text-[11px] mt-1 block">{errors.status}</span>}
                            </div>
                        </div>

                        {/* Start Date & End Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-[8px] border border-slate-200">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-[#00629D]" /> Start Date (Auto-activation)
                                </label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 bg-white focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                                {errors.start_date && <span className="text-red-500 text-[11px] mt-1 block">{errors.start_date}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-[#00629D]" /> End Date (Auto-deactivation)
                                </label>
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 bg-white focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                                {errors.end_date && <span className="text-red-500 text-[11px] mt-1 block">{errors.end_date}</span>}
                            </div>
                        </div>

                        {/* Poster Image Upload (Only for Celebration popups) */}
                        {data.type === 'celebration' && (
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1 flex items-center justify-between">
                                    <span>Graphic Poster Image <span className="text-red-500">* (Primary Visual for Celebration)</span></span>
                                </label>

                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                        onChange={handleImageChange}
                                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-[6px] file:border-0 file:text-xs file:font-semibold file:bg-[#00629D]/10 file:text-[#00629D] hover:file:bg-[#00629D]/20 cursor-pointer"
                                    />
                                </div>

                                {imagePreview && (
                                    <div className="mt-3 relative rounded-[8px] overflow-hidden border border-slate-200 max-h-48 bg-slate-900 flex items-center justify-center">
                                        <img src={imagePreview} alt="Preview" className="max-h-48 object-contain" />
                                        <button
                                            type="button"
                                            onClick={() => { setData('image', null); setImagePreview(null); }}
                                            className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded cursor-pointer"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                )}

                                {errors.image && <span className="text-red-500 text-[11px] mt-1 block">{errors.image}</span>}
                            </div>
                        )}

                        {/* Content text with AI Generator Button (Only for non-celebration popups: home & career) */}
                        {data.type !== 'celebration' && (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold text-[#141B2C]">
                                        Announcement Content / Message <span className="text-red-500">*</span>
                                    </label>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleGenerateAiContent}
                                            disabled={isGeneratingAi}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-semibold rounded-[6px] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                            title="Generate AI announcement message based on title and category"
                                        >
                                            <Wand2 className={`w-3.5 h-3.5  ${isGeneratingAi ? 'animate-spin' : ''}`} />
                                            {isGeneratingAi ? 'Generating AI...' : 'Generate with AI'}
                                        </button>

                                        <span className="font-['JetBrains_Mono'] text-[11px] text-[#8AAFC8]">
                                            {(data.content || '').length} / 255 chars
                                        </span>
                                    </div>
                                </div>

                                {aiError && (
                                    <div className="mb-2 text-[11px] font-medium text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                        {aiError}
                                    </div>
                                )}

                                <textarea
                                    value={data.content || ''}
                                    onChange={(e) => setData('content', e.target.value.slice(0, 255))}
                                    maxLength={255}
                                    rows={3}
                                    required
                                    placeholder="Write announcement message body or click 'Generate with AI'..."
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                                {errors.content && <span className="text-red-500 text-[11px] mt-1 block">{errors.content}</span>}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4 border-[#E5E7EB] flex items-center justify-end gap-3">
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
                                {editingNotification ? 'Update Pop-up' : 'Save Pop-up'}
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
                        <h3 className="text-lg font-bold">Delete Notification Pop-up</h3>
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
