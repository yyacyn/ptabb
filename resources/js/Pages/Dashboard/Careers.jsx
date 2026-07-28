import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Briefcase, Anchor, Plus, Search, Edit2, Calendar, Clock, X } from 'lucide-react';

export default function Careers({ careers = [] }) {
    const authUser = usePage().props.auth.user;
    const userRole = authUser?.role || 'super_admin';

    const defaultTab = userRole === 'crew_admin' ? 'crew' : (userRole === 'hr_admin' ? 'corporate' : 'all');
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCareer, setEditingCareer] = useState(null);

    const filteredCareers = (careers || []).filter(c => {
        const cat = (c.category || '').toLowerCase();
        
        // Strict role boundary enforcement
        if (userRole === 'hr_admin' && cat !== 'corporate') return false;
        if (userRole === 'crew_admin' && cat !== 'crew' && !cat.includes('deck') && !cat.includes('crew')) return false;

        const matchesCategory = activeTab === 'all' || cat === activeTab || (activeTab === 'crew' && (cat.includes('deck') || cat.includes('crew')));
        const matchesSearch = (c.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (c.department || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const defaultCategory = userRole === 'crew_admin' ? 'crew' : 'corporate';

    const { data, setData, post, put, processing, errors, reset } = useForm({
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
            put(route('careers.store'), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('careers.store'), {
                onSuccess: () => closeModal(),
            });
        }
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
                                ? 'Corporate Job Openings (Darat)' 
                                : userRole === 'crew_admin' 
                                    ? 'Vessel Crew Openings (Laut)' 
                                    : 'Careers & Job Vacancies'}
                        </h2>
                    </div>

                    <button 
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Post New Vacancy
                    </button>
                </div>
            }
        >
            <Head title="Careers Management — PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">
                    
                    {/* Category Selector Tabs */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[8px] border border-[#E5E7EB] ">
                        <div className="flex gap-2 w-full sm:w-auto">
                            {userRole === 'super_admin' && (
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-all ${
                                        activeTab === 'all' ? 'bg-[#141B2C] text-white ' : 'bg-[#F5F5F5] text-[#404750] hover:bg-slate-200'
                                    }`}
                                >
                                    All Vacancies ({(careers || []).length})
                                </button>
                            )}

                            {(userRole === 'super_admin' || userRole === 'hr_admin') && (
                                <button
                                    onClick={() => setActiveTab('corporate')}
                                    className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                        activeTab === 'corporate' ? 'bg-[#00629D] text-white ' : 'bg-[#F5F5F5] text-[#404750] hover:bg-slate-200'
                                    }`}
                                >
                                    <Briefcase className="w-3.5 h-3.5" /> Corporate Jobs (Darat)
                                </button>
                            )}

                            {(userRole === 'super_admin' || userRole === 'crew_admin') && (
                                <button
                                    onClick={() => setActiveTab('crew')}
                                    className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                        activeTab === 'crew' ? 'bg-[#00629D] text-white ' : 'bg-[#F5F5F5] text-[#404750] hover:bg-slate-200'
                                    }`}
                                >
                                    <Anchor className="w-3.5 h-3.5" /> Vessel Crew Jobs (Laut)
                                </button>
                            )}
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by position or dept..."
                                className="w-full pl-9 pr-4 py-1.5 border border-[#E5E7EB] rounded-[8px] text-xs focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>
                    </div>

                    {/* Job Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCareers.map((job) => {
                            const isCrew = (job.category || '').toLowerCase() === 'crew' || (job.category || '').toLowerCase().includes('deck');

                            return (
                                <div 
                                    key={job.id} 
                                    className="bg-white rounded-[8px] border border-[#E5E7EB] p-5  hover:border-[#00629D] hover:shadow-md transition-all flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border flex items-center gap-1 ${
                                                isCrew 
                                                    ? 'bg-amber-50 text-amber-900 border-amber-200' 
                                                    : 'bg-[#F5F5F5] text-[#00629D] border-[#E5E7EB]'
                                            }`}>
                                                {isCrew ? <Anchor className="w-3 h-3 text-amber-700" /> : <Briefcase className="w-3 h-3 text-[#00629D]" />}
                                                {isCrew ? 'Vessel Crew (Laut)' : 'Corporate (Darat)'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase ${
                                                job.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                            }`}>
                                                {job.status || 'open'}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-lg text-[#141B2C] group-hover:text-[#00629D] transition-colors leading-snug mb-1">
                                            {job.position}
                                        </h3>
                                        <p className="text-xs text-[#8AAFC8] font-['JetBrains_Mono'] font-semibold mb-3">
                                            {job.department || 'Operations'} &bull; {job.location || 'Jakarta HQ'}
                                        </p>

                                        {job.description && (
                                            <p className="text-xs text-[#404750] line-clamp-2 leading-relaxed mb-4">
                                                {job.description}
                                            </p>
                                        )}

                                        <div className="space-y-1.5 font-['JetBrains_Mono'] text-xs text-[#404750] pt-3 border-t border-[#E5E7EB]">
                                            <div className="flex justify-between">
                                                <span className="text-[#8AAFC8]">Type:</span>
                                                <span className="font-bold uppercase">{job.employment_type || 'fulltime'}</span>
                                            </div>
                                            {job.application_deadline && (
                                                <div className="flex justify-between">
                                                    <span className="text-[#8AAFC8]">Deadline:</span>
                                                    <span className="font-bold text-[#00629D] flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {job.application_deadline}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-[#E5E7EB] mt-4 flex items-center justify-between">
                                        <button 
                                            onClick={() => openModal(job)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00629D] hover:underline cursor-pointer"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit Vacancy
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>

            {/* Add / Edit Vacancy Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-5">
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
                                    onChange={(e) => setData('position', e.target.value)}
                                    placeholder="e.g. Master Mariner / Senior Controller"
                                    required
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Department</label>
                                <input
                                    type="text"
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                    placeholder="e.g. Operations / Deck / Finance"
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Category (Darat vs Laut)</label>
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    disabled={userRole === 'hr_admin' || userRole === 'crew_admin'}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D] disabled:bg-slate-100 disabled:cursor-not-allowed font-medium"
                                >
                                    {(userRole === 'super_admin' || userRole === 'hr_admin') && (
                                        <option value="corporate">Corporate (Darat)</option>
                                    )}
                                    {(userRole === 'super_admin' || userRole === 'crew_admin') && (
                                        <option value="crew">Vessel Crew (Laut)</option>
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
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Location</label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="e.g. Jakarta HQ / Onboard MV Iriana"
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Application Deadline</label>
                                <input
                                    type="date"
                                    value={data.application_deadline}
                                    onChange={(e) => setData('application_deadline', e.target.value)}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Job Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={2}
                                placeholder="Key duties and strategic operational goals..."
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Requirements & Experience</label>
                            <textarea
                                value={data.requirements}
                                onChange={(e) => setData('requirements', e.target.value)}
                                rows={2}
                                placeholder="Required sea time, COC certificates, degree requirements..."
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
                                {editingCareer ? 'Update Vacancy' : 'Publish Vacancy'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
