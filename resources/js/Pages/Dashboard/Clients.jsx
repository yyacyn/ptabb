import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, Plus, Search, Image as ImageIcon, Edit2 } from 'lucide-react';

export default function Clients({ clients = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    const filteredClients = (clients || []).filter(c => 
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        category: 'Domestic',
        type: 'Cement Manufacturer',
        country: 'Indonesia',
        logo: '',
    });

    const getLogoPath = (item) => {
        if (!item) return '/images/clients/placeholder.png';
        if (item.logo) {
            return item.logo.startsWith('/') ? item.logo : `/images/clients/${item.logo}`;
        }
        if (item.logo_path) {
            return item.logo_path.startsWith('/') ? item.logo_path : `/images/clients/${item.logo_path}`;
        }
        return '/images/clients/placeholder.png';
    };

    const openModal = (client = null) => {
        setEditingClient(client);
        if (client) {
            setData({
                name: client.name || '',
                category: client.category || 'Domestic',
                type: client.type || '',
                country: client.country || 'Indonesia',
                logo: client.logo || '',
            });
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
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
                            <Building2 className="w-3.5 h-3.5" /> CLIENT PORTFOLIO
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            Clients & Strategic Partners
                        </h2>
                    </div>

                    <button 
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add Partner Logo
                    </button>
                </div>
            }
        >
            <Head title="Clients Management — PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">
                    
                    {/* Search Bar */}
                    <div className="bg-white rounded-[8px] p-4 border border-[#E5E7EB] shadow-sm flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search client partner..."
                                className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-[8px] text-xs focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>
                        <span className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8]">
                            Showing {filteredClients.length} Client Logos
                        </span>
                    </div>

                    {/* Client Logos Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredClients.map((item) => {
                            const logoSrc = getLogoPath(item);

                            return (
                                <div 
                                    key={item.id} 
                                    className="bg-white rounded-[8px] border border-[#E5E7EB] p-5 shadow-sm hover:border-[#00629D] hover:shadow-md transition-all flex flex-col justify-between group"
                                >
                                    <div>
                                        {/* Category Badge & Country */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#00629D] uppercase tracking-wider bg-[#F5F5F5] px-2 py-0.5 rounded border border-[#E5E7EB]">
                                                {item.category || 'Partner'}
                                            </span>
                                            <span className="font-['JetBrains_Mono'] text-[11px] text-[#8AAFC8]">
                                                {item.country || 'Indonesia'}
                                            </span>
                                        </div>

                                        {/* Client Logo Image Frame */}
                                        <div className="h-20 w-full bg-[#F5F5F5] rounded-[6px] border border-[#E5E7EB] p-3 flex items-center justify-center mb-4 group-hover:bg-white transition-colors overflow-hidden">
                                            <img
                                                src={logoSrc}
                                                alt={item.name}
                                                title={item.name}
                                                className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all duration-300"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    if (e.currentTarget.nextSibling) {
                                                        e.currentTarget.nextSibling.style.display = 'flex';
                                                    }
                                                }}
                                            />
                                            <div className="hidden flex-col items-center justify-center text-slate-400 text-xs">
                                                <ImageIcon className="w-5 h-5 mb-1" />
                                                <span>No Image</span>
                                            </div>
                                        </div>

                                        {/* Client Info */}
                                        <h3 className="font-bold text-base text-[#141B2C] group-hover:text-[#00629D] transition-colors leading-snug mb-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-xs text-[#404750]">
                                            {item.type || 'Industrial Partner'}
                                        </p>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="pt-3 border-t border-[#E5E7EB] mt-4 flex items-center justify-between text-xs font-semibold">
                                        <button 
                                            onClick={() => openModal(item)}
                                            className="inline-flex items-center gap-1 text-[#00629D] hover:underline"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button className="text-red-600 hover:underline">Remove</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>

            {/* Add / Edit Client Partner Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-5">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[#00629D]" />
                            <h3 className="text-lg font-bold text-[#141B2C]">
                                {editingClient ? `Edit Partner: ${editingClient.name}` : 'Add Client Partner'}
                            </h3>
                        </div>
                        <button onClick={closeModal} className="text-slate-400 hover:text-[#141B2C] text-xl">&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Company Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. PT. Semen Padang"
                                required
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Category</label>
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                >
                                    <option value="Domestic">Domestic</option>
                                    <option value="International">International</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Country</label>
                                <input
                                    type="text"
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value)}
                                    placeholder="e.g. Indonesia / Singapore"
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Industry / Business Type</label>
                            <input
                                type="text"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                placeholder="e.g. Cement Manufacturer / Shipping & Logistics"
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Logo Filename / URL</label>
                            <input
                                type="text"
                                value={data.logo}
                                onChange={(e) => setData('logo', e.target.value)}
                                placeholder="e.g. padang.png or 1777649829_PT__Semen_Padan.png"
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
                                {editingClient ? 'Update Partner' : 'Save Partner'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
