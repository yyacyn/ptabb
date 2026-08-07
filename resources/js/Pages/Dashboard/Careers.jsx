import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Briefcase, Anchor, Plus, Search, Edit2, Clock, Trash2, AlertTriangle, ArrowUpDown } from 'lucide-react';

const EMPTY_CAREERS = [];

export default function Careers({ careers = EMPTY_CAREERS }) {
    const authUser = usePage().props.auth.user;
    const userRole = authUser?.role || 'super_admin';

    const defaultTab = userRole === 'crew_admin' ? 'crew' : (userRole === 'hr_admin' ? 'corporate' : 'all');
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCareer, setEditingCareer] = useState(null);
    const [deletingCareer, setDeletingCareer] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    const isPastDeadline = (deadline) => {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline + 'T23:59:59');
        return deadlineDate < new Date();
    };

    const filteredCareers = (careers || []).filter(c => {
        const cat = (c.category || '').toLowerCase();

        // Strict role boundary enforcement (HR Admin = Corporate/Office, Crew Admin = Seafaring/Crew)
        if (userRole === 'hr_admin' && cat !== 'corporate' && cat !== 'office') return false;
        if (userRole === 'crew_admin' && cat !== 'crew' && cat !== 'seafaring' && !cat.includes('deck') && !cat.includes('engine') && !cat.includes('crew')) return false;

        const isCrewCat = cat === 'crew' || cat === 'seafaring' || cat.includes('deck') || cat.includes('engine') || cat.includes('crew');
        const isCorpCat = cat === 'corporate' || cat === 'office';
        const matchesCategory = activeTab === 'all' || (activeTab === 'crew' && isCrewCat) || (activeTab === 'corporate' && isCorpCat);
        const matchesSearch = (c.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.department || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const sortedCareers = [...filteredCareers].sort((a, b) => {
        if (sortBy === 'oldest') {
            return (a.id || 0) - (b.id || 0);
        }
        if (sortBy === 'title_asc') {
            return (a.position || '').localeCompare(b.position || '');
        }
        if (sortBy === 'deadline_asc') {
            if (!a.application_deadline) return 1;
            if (!b.application_deadline) return -1;
            return new Date(a.application_deadline) - new Date(b.application_deadline);
        }
        if (sortBy === 'status_open') {
            const isClosedA = a.status === 'closed' || a.status === 'expired' || isPastDeadline(a.application_deadline);
            const isClosedB = b.status === 'closed' || b.status === 'expired' || isPastDeadline(b.application_deadline);
            if (isClosedA === isClosedB) return (b.id || 0) - (a.id || 0);
            return isClosedA ? 1 : -1;
        }
        return (b.id || 0) - (a.id || 0);
    });

    const totalPages = Math.max(1, Math.ceil(sortedCareers.length / itemsPerPage));
    const paginatedCareers = sortedCareers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const defaultCategory = userRole === 'crew_admin' ? 'crew' : 'corporate';

    const { data, setData, post, put, processing, reset, errors } = useForm({
        position: '',
        department: '',
        category: defaultCategory,
        location: '',
        employment_type: 'fulltime',
        description: '',
        requirements: '',
        responsibilities: '',
        status: 'open',
        application_deadline: '',
    });

    const handleDeadlineChange = (val) => {
        let nextStatus = data.status;
        if (val) {
            const deadlineDate = new Date(val + 'T23:59:59');
            const now = new Date();
            if (deadlineDate >= now) {
                nextStatus = 'open';
            } else {
                nextStatus = 'expired';
            }
        }
        setData(prev => ({
            ...prev,
            application_deadline: val,
            status: nextStatus,
        }));
    };

    const openModal = (career = null) => {
        setEditingCareer(career);
        if (career) {
            setData({
                position: career.position || '',
                department: career.department || '',
                category: career.category || defaultCategory,
                location: career.location || '',
                employment_type: career.employment_type || 'fulltime',
                description: career.description || '',
                requirements: career.requirements || '',
                responsibilities: career.responsibilities || '',
                status: career.status || 'open',
                application_deadline: career.application_deadline || '',
            });
        } else {
            reset({
                category: defaultCategory,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCareer(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCareer) {
            put(route('careers.update', editingCareer.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('careers.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = () => {
        if (!deletingCareer) return;
        router.delete(route('careers.destroy', deletingCareer.id), {
            onSuccess: () => setDeletingCareer(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" /> RECRUITMENT MANAGEMENT
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            {userRole === 'hr_admin'
                                ? 'Corporate Job Openings (Land)'
                                : userRole === 'crew_admin'
                                    ? 'Vessel Crew Openings (Sea)'
                                    : 'Careers & Job Vacancies'}
                        </h2>
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-[colors,shadow,opacity,transform] cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Post New Vacancy
                    </button>
                </div>
            }
        >
            <Head title="Careers Management - PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">

                    {/* Category Selector Tabs & Search */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[8px] border border-[#E5E7EB]">
                        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                            {userRole === 'super_admin' && (
                                <button
                                    onClick={() => handleTabChange('all')}
                                    className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-[colors,shadow,opacity,transform] cursor-pointer ${activeTab === 'all' ? 'bg-[#141B2C] text-white' : 'bg-[#F5F5F5] text-[#404750] hover:bg-slate-200'
                                        }`}
                                >
                                    All Vacancies ({(careers || []).length})
                                </button>
                            )}

                            {(userRole === 'super_admin' || userRole === 'hr_admin') && (
                                <button
                                    onClick={() => handleTabChange('corporate')}
                                    className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-[colors,shadow,opacity,transform] flex items-center gap-1.5 cursor-pointer ${activeTab === 'corporate' ? 'bg-[#00629D] text-white' : 'bg-[#F5F5F5] text-[#404750] hover:bg-slate-200'
                                        }`}
                                >
                                    <Briefcase className="w-3.5 h-3.5" /> Corporate Jobs (Land)
                                </button>
                            )}

                            {(userRole === 'super_admin' || userRole === 'crew_admin') && (
                                <button
                                    onClick={() => handleTabChange('crew')}
                                    className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-[colors,shadow,opacity,transform] flex items-center gap-1.5 cursor-pointer ${activeTab === 'crew' ? 'bg-[#00629D] text-white' : 'bg-[#F5F5F5] text-[#404750] hover:bg-slate-200'
                                        }`}
                                >
                                    <Anchor className="w-3.5 h-3.5" /> Vessel Crew Jobs (Sea)
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="w-3.5 h-3.5 text-[#00629D]" />
                                <span className="text-xs text-[#8AAFC8] font-['JetBrains_Mono']">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    className="border border-[#E5E7EB] rounded-[6px] text-xs py-1.5 px-2.5 pr-7 focus:border-[#00629D] focus:ring-[#00629D] bg-white font-semibold cursor-pointer"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="title_asc">Position A → Z</option>
                                    <option value="deadline_asc">Nearest Deadline</option>
                                    <option value="status_open">Open Vacancies First</option>
                                </select>
                            </div>

                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Search by position or dept..."
                                    className="w-full pl-9 pr-4 py-1.5 border border-[#E5E7EB] rounded-[8px] text-xs focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Empty State */}
                    {filteredCareers.length === 0 && (
                        <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-12 text-center">
                            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-[#141B2C]">No Vacancies Found</h3>
                            <p className="text-xs text-[#8AAFC8] font-['JetBrains_Mono'] mt-1">
                                No job postings match your current filter or search criteria.
                            </p>
                        </div>
                    )}

                    {/* Job Cards Grid */}
                    {filteredCareers.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {paginatedCareers.map((job) => {
                                const isCrew = (job.category || '').toLowerCase() === 'crew' || (job.category || '').toLowerCase().includes('deck');
                                const expired = job.status === 'expired' || job.status === 'closed' || isPastDeadline(job.application_deadline);
                                const displayStatus = expired ? (job.status === 'closed' ? 'closed' : 'expired') : (job.status || 'open');

                                return (
                                    <div
                                        key={job.id}
                                        className="bg-white rounded-[8px] border border-[#E5E7EB] hover:border-[#00629D] hover:shadow-md p-5 transition-[colors,shadow,opacity,transform] flex flex-col justify-between group"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border flex items-center gap-1 ${isCrew
                                                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                                                        : 'bg-[#eff9ff] text-[#00629D] border-[#b6e4ff]'
                                                    }`}>
                                                    {isCrew ? <Anchor className="w-3 h-3 text-amber-700" /> : <Briefcase className="w-3 h-3 text-[#00629D]" />}
                                                    {isCrew ? 'Vessel Crew (Sea)' : 'Corporate (Land)'}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase ${displayStatus === 'open'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : displayStatus === 'expired' || displayStatus === 'closed'
                                                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                            : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {displayStatus}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-lg text-[#141B2C] group-hover:text-[#00629D] transition-colors leading-snug mb-1 line-clamp-1">
                                                {job.position}
                                            </h3>
                                            <p className="text-xs text-[#8AAFC8] font-['JetBrains_Mono'] font-semibold mb-3 truncate">
                                                {job.department || 'Operations'} &bull; {job.location || 'Jakarta HQ'}
                                            </p>

                                            <p
                                                className="text-xs text-[#404750] leading-relaxed mb-4 overflow-hidden h-10"
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {job.description || '\u00A0'}
                                            </p>

                                            <div className="space-y-1.5 font-['JetBrains_Mono'] text-xs text-[#404750] pt-3  border-[#E5E7EB]">
                                                <div className="flex justify-between">
                                                    <span className="text-[#8AAFC8]">Type:</span>
                                                    <span className="font-bold uppercase">{job.employment_type || 'fulltime'}</span>
                                                </div>
                                                <div className="flex justify-between items-center h-5">
                                                    <span className="text-[#8AAFC8]">Deadline:</span>
                                                    {isPastDeadline(job.application_deadline) || job.status === 'closed' || job.status === 'expired' ? (
                                                        <span className="font-bold flex items-center gap-1 text-rose-600">
                                                            <Clock className="w-3 h-3" /> Closed
                                                        </span>
                                                    ) : job.application_deadline ? (
                                                        <span className="font-bold flex items-center gap-1 text-[#00629D]">
                                                            <Clock className="w-3 h-3" /> {job.application_deadline}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#8AAFC8] font-medium">&mdash;</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3  border-[#E5E7EB] mt-4 flex items-center justify-between">
                                            <button
                                                onClick={() => openModal(job)}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00629D] hover:underline cursor-pointer"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" /> Edit Vacancy
                                            </button>

                                            <button
                                                onClick={() => setDeletingCareer(job)}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB] flex items-center justify-between text-xs font-['JetBrains_Mono']">
                            <div className="text-[#404750]">
                                Showing{' '}
                                <span className="font-bold text-[#141B2C]">{(currentPage - 1) * itemsPerPage + 1}</span>
                                {' '}to{' '}
                                <span className="font-bold text-[#141B2C]">{Math.min(currentPage * itemsPerPage, filteredCareers.length)}</span>
                                {' '}of{' '}
                                <span className="font-bold text-[#141B2C]">{filteredCareers.length}</span> Vacancies
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-[4px] border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#141B2C] disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
                                >
                                    ← Prev
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1.5 rounded-[4px] font-semibold cursor-pointer ${currentPage === page
                                                ? 'bg-[#00629D] text-white border border-[#00629D]'
                                                : 'border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#141B2C]'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
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

            {/* Add / Edit Vacancy Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between  border-[#E5E7EB]  mb-5">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-[#00629D]" />
                            <h3 className="text-lg font-bold text-[#141B2C]">
                                {editingCareer ? `Edit Vacancy: ${editingCareer.position}` : 'Post New Job Vacancy'}
                            </h3>
                        </div>
                        <button onClick={closeModal} className="text-slate-400 hover:text-[#141B2C] text-xl cursor-pointer">&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Job Position Title *</label>
                                <input
                                    type="text"
                                    value={data.position}
                                    onChange={(e) => setData('position', e.target.value.slice(0, 255))}
                                    placeholder="e.g. Master Mariner / Senior Controller"
                                    maxLength={255}
                                    required
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                                {(data.position || '').length >= 255 && (
                                    <p className="text-xs text-amber-600 mt-1 font-medium">Maximum limit reached (255 chars).</p>
                                )}
                                {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Department</label>
                                <input
                                    type="text"
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value.slice(0, 100))}
                                    placeholder="e.g. Operations / Deck / Finance"
                                    maxLength={100}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                                {(data.department || '').length >= 100 && (
                                    <p className="text-xs text-amber-600 mt-1 font-medium">Maximum limit reached (100 chars).</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Category (Land vs Offshore)</label>
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    disabled={userRole === 'hr_admin' || userRole === 'crew_admin'}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D] disabled:bg-slate-100 disabled:cursor-not-allowed font-medium"
                                >
                                    {(userRole === 'super_admin' || userRole === 'hr_admin') && (
                                        <option value="corporate">Corporate (Land)</option>
                                    )}
                                    {(userRole === 'super_admin' || userRole === 'crew_admin') && (
                                        <option value="crew">Vessel Crew (Sea)</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Employment Type</label>
                                <select
                                    value={data.employment_type}
                                    onChange={(e) => setData('employment_type', e.target.value)}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                >
                                    <option value="fulltime">Full-time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                >
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Location</label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value.slice(0, 100))}
                                    placeholder="e.g. Jakarta HQ / Onboard MV Iriana"
                                    maxLength={100}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                                {(data.location || '').length >= 100 && (
                                    <p className="text-xs text-amber-600 mt-1 font-medium">Maximum limit reached (100 chars).</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">
                                    Application Deadline <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.application_deadline}
                                    required
                                    onChange={(e) => handleDeadlineChange(e.target.value)}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                                {errors.application_deadline && <p className="text-xs text-red-500 mt-1">{errors.application_deadline}</p>}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-[#141B2C]">Job Description</label>
                                <span className={`font-['JetBrains_Mono'] text-[11px] ${(data.description || '').length >= 1900 ? 'text-amber-600 font-bold' : 'text-[#8AAFC8]'}`}>
                                    {(data.description || '').length} / 2000 chars
                                </span>
                            </div>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value.slice(0, 2000))}
                                maxLength={2000}
                                rows={2}
                                placeholder="Key duties and strategic operational goals..."
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-[#141B2C]">Requirements &amp; Experience</label>
                                <span className={`font-['JetBrains_Mono'] text-[11px] ${(data.requirements || '').length >= 1900 ? 'text-amber-600 font-bold' : 'text-[#8AAFC8]'}`}>
                                    {(data.requirements || '').length} / 2000 chars
                                </span>
                            </div>
                            <textarea
                                value={data.requirements}
                                onChange={(e) => setData('requirements', e.target.value.slice(0, 2000))}
                                maxLength={2000}
                                rows={2}
                                placeholder="Required sea time, COC certificates, degree requirements..."
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>

                        <div className="  border-[#E5E7EB] flex items-center justify-end gap-3">
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
                                {editingCareer ? 'Update Vacancy' : 'Publish Vacancy'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={!!deletingCareer} onClose={() => setDeletingCareer(null)} maxWidth="md">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center gap-3 mb-4 text-rose-600">
                        <div className="p-2.5 bg-rose-50 rounded-full">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#141B2C]">Delete Career Vacancy</h3>
                            <p className="text-xs text-[#8AAFC8] font-['JetBrains_Mono'] font-medium">Confirmation Required</p>
                        </div>
                    </div>

                    <p className="text-sm text-[#404750] mb-6 leading-relaxed">
                        Are you sure you want to permanently remove the vacancy for{' '}
                        <strong className="text-[#141B2C]">{deletingCareer?.position}</strong>?
                        This action cannot be undone.
                    </p>

                    <div className="flex items-center justify-end gap-3   border-[#E5E7EB]">
                        <button
                            type="button"
                            onClick={() => setDeletingCareer(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#141B2C] text-xs font-semibold rounded-[6px] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-[6px] transition-[colors,shadow,opacity,transform] shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Vacancy
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
