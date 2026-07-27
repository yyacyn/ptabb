import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Briefcase, Anchor, Plus, Search, Edit2, Calendar, Clock, X } from 'lucide-react';

export default function Careers({ careers = [] }) {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCareer, setEditingCareer] = useState(null);

    const filteredCareers = (careers || []).filter(c => {
        const cat = (c.category || '').toLowerCase();
        const matchesCategory = activeTab === 'all' || cat === activeTab || (activeTab === 'crew' && cat.includes('deck')) || (activeTab === 'crew' && cat.includes('crew'));
        const matchesSearch = (c.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (c.department || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const { data, setData, post, put, processing, errors, reset } = useForm({
        position: '',
        department: '',
        category: 'corporate',
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
                category: career.category || 'corporate',
                location: career.location || '',
                employment_type: career.employment_type || 'fulltime',
                description: career.description || '',
                requirements: career.requirements || '',
                responsibilities: career.responsibilities || '',
                status: career.status || 'open',
                application_deadline: career.application_deadline || '',
            });
        } else {
            reset();
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
                            Careers & Job Vacancies
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
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[8px] border border-[#E5E7EB] shadow-sm">
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-all ${
                                    activeTab === 'all' ? 'bg-[#141B2C] text-white shadow-sm' : 'bg-[#F5F5F5] text-[#404750] hover:bg-slate-200'
                                }`}
                            >
                                All Vacancies ({(careers || []).length})
                            </button>
                            <button
                                onClick={() => setActiveTab('corporate')}
                                className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                    activeTab === 'corporate' ? 'bg-[#00629D] text-white shadow-sm' : 'bg-[#F5F5F5] text-[#404750] hover:bg-slate-200'
                                }`}
                            >
                                <Briefcase className="w-3.5 h-3.5" /> Corporate Jobs (Darat)
                            </button>
                            <button
                                onClick={() => setActiveTab('crew')}
                                className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                    activeTab === 'crew' ? 'bg-[#00629D] text-white shadow-sm' : 'bg-[#F5F5F5] text-[#404750] hover:bg-slate-200'
                                }`}
                            >
                                <Anchor className="w-3.5 h-3.5" /> Vessel Crew Jobs (Laut)
                            </button>
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

                    {/* Jobs Table */}
                    <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-sm overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#141B2C] text-white font-['JetBrains_Mono'] uppercase">
                                <tr>
                                    <th className="p-4">Position</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Department</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Application Deadline</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                {filteredCareers.map((job) => (
                                    <tr key={job.id} className="hover:bg-[#F5F5F5] transition-colors">
                                        <td className="p-4 font-bold text-[#141B2C] text-sm">
                                            {job.position}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-[4px] font-['JetBrains_Mono'] text-[10px] font-bold uppercase ${
                                                (job.category || '').toLowerCase().includes('crew') || (job.category || '').toLowerCase().includes('deck') 
                                                    ? 'bg-pink-100 text-pink-800' 
                                                    : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {(job.category || '').toLowerCase().includes('crew') || (job.category || '').toLowerCase().includes('deck') ? 'Laut' : 'Darat'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[#404750]">{job.department || 'General'}</td>
                                        <td className="p-4 text-[#404750]">{job.location || 'Jakarta HQ'}</td>
                                        <td className="p-4 text-[#404750] uppercase font-['JetBrains_Mono']">{job.employment_type || 'fulltime'}</td>
                                        <td className="p-4 font-['JetBrains_Mono'] text-[#00629D] font-medium">
                                            {job.application_deadline || 'N/A'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase ${
                                                job.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {job.status || 'open'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => openModal(job)}
                                                className="inline-flex items-center gap-1 text-[#00629D] hover:bg-[#00629D]/10 px-2.5 py-1 rounded-[4px] font-semibold transition-colors"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

            {/* Edit / Create Vacancy Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-5">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-[#00629D]" />
                            <h3 className="text-lg font-bold text-[#141B2C]">
                                {editingCareer ? `Edit Job Vacancy: ${editingCareer.position}` : 'Post New Job Vacancy'}
                            </h3>
                        </div>
                        <button onClick={closeModal} className="text-slate-400 hover:text-[#141B2C] text-xl">&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Position Title *</label>
                                <input
                                    type="text"
                                    value={data.position}
                                    onChange={(e) => setData('position', e.target.value)}
                                    placeholder="e.g. Chief Officer / 1st Mate"
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
                                    placeholder="e.g. Deck / Operations / Finance"
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
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                >
                                    <option value="corporate">Corporate (Darat)</option>
                                    <option value="crew">Vessel Crew (Laut)</option>
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
                                    placeholder="e.g. Jakarta HQ / Batam / Regional Fleet"
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
                                placeholder="Summary of the vacancy..."
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Requirements</label>
                            <textarea
                                value={data.requirements}
                                onChange={(e) => setData('requirements', e.target.value)}
                                rows={2}
                                placeholder="Certifications, degrees, years of experience required..."
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Responsibilities</label>
                            <textarea
                                value={data.responsibilities}
                                onChange={(e) => setData('responsibilities', e.target.value)}
                                rows={2}
                                placeholder="Key duties and responsibilities..."
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
                                {editingCareer ? 'Update Vacancy' : 'Save Vacancy'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
