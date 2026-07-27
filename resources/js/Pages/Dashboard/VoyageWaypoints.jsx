import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Compass, Plus, Edit2 } from 'lucide-react';

export default function VoyageWaypoints({ voyage_waypoints = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWaypoint, setEditingWaypoint] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        vessel: '',
        origin: '',
        destination: '',
        lat: '',
        lng: '',
        speed: '8.0 knots',
        status: 'En Route',
    });

    const openModal = (waypoint = null) => {
        setEditingWaypoint(waypoint);
        if (waypoint) {
            setData({
                vessel: waypoint.vessel || '',
                origin: waypoint.origin || '',
                destination: waypoint.destination || '',
                lat: waypoint.lat || '',
                lng: waypoint.lng || '',
                speed: waypoint.speed || '8.0 knots',
                status: waypoint.status || 'En Route',
            });
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingWaypoint(null);
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
                            <Compass className="w-3.5 h-3.5" /> AIS TELEMETRY
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            Voyage Waypoints & Real-Time AIS
                        </h2>
                    </div>

                    <button 
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add Waypoint Position
                    </button>
                </div>
            }
        >
            <Head title="Voyage Waypoints — PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">
                    
                    <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-sm overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#141B2C] text-white font-['JetBrains_Mono'] uppercase">
                                <tr>
                                    <th className="p-4">Vessel Name</th>
                                    <th className="p-4">Current Route</th>
                                    <th className="p-4">GPS Coordinates</th>
                                    <th className="p-4">Speed</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                {(voyage_waypoints || []).map((item) => (
                                    <tr key={item.id} className="hover:bg-[#F5F5F5] transition-colors">
                                        <td className="p-4 font-bold text-[#141B2C] text-sm">
                                            {item.vessel || 'Vessel'}
                                        </td>
                                        <td className="p-4 text-[#404750] font-semibold">
                                            {item.origin} ➔ {item.destination}
                                        </td>
                                        <td className="p-4 font-['JetBrains_Mono'] text-[#00629D]">
                                            {item.lat || '0.00'}, {item.lng || '0.00'}
                                        </td>
                                        <td className="p-4 font-['JetBrains_Mono'] text-[#404750]">
                                            {item.speed || '8.0 knots'}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase bg-emerald-100 text-emerald-800">
                                                {item.status || 'En Route'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => openModal(item)}
                                                className="inline-flex items-center gap-1 text-[#00629D] hover:bg-[#00629D]/10 px-2.5 py-1 rounded-[4px] font-semibold transition-colors cursor-pointer"
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

            {/* Add / Edit Waypoint Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="lg">
                <div className="p-6 font-['Hanken_Grotesk'] text-[#141B2C]">
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-5">
                        <div className="flex items-center gap-2">
                            <Compass className="w-5 h-5 text-[#00629D]" />
                            <h3 className="text-lg font-bold text-[#141B2C]">
                                {editingWaypoint ? `Edit AIS Waypoint: ${editingWaypoint.vessel}` : 'Add AIS Position Waypoint'}
                            </h3>
                        </div>
                        <button onClick={closeModal} className="text-slate-400 hover:text-[#141B2C] text-xl">&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Vessel Name *</label>
                            <input
                                type="text"
                                value={data.vessel}
                                onChange={(e) => setData('vessel', e.target.value)}
                                placeholder="e.g. MV. IRIANA"
                                required
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Origin Port</label>
                                <input
                                    type="text"
                                    value={data.origin}
                                    onChange={(e) => setData('origin', e.target.value)}
                                    placeholder="e.g. Batam (ID BTM)"
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Destination Port</label>
                                <input
                                    type="text"
                                    value={data.destination}
                                    onChange={(e) => setData('destination', e.target.value)}
                                    placeholder="e.g. Morowali (ID MOR)"
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Latitude</label>
                                <input
                                    type="text"
                                    value={data.lat}
                                    onChange={(e) => setData('lat', e.target.value)}
                                    placeholder="e.g. 0.9701"
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D] font-['JetBrains_Mono']"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Longitude</label>
                                <input
                                    type="text"
                                    value={data.lng}
                                    onChange={(e) => setData('lng', e.target.value)}
                                    placeholder="e.g. 104.0294"
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D] font-['JetBrains_Mono']"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#141B2C] mb-1">Speed</label>
                                <input
                                    type="text"
                                    value={data.speed}
                                    onChange={(e) => setData('speed', e.target.value)}
                                    placeholder="e.g. 8.4 knots"
                                    className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#141B2C] mb-1">Status</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full border border-[#E5E7EB] rounded-[6px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                            >
                                <option value="En Route">En Route</option>
                                <option value="Underway">Underway</option>
                                <option value="Anchored">Anchored</option>
                                <option value="In Port">In Port</option>
                            </select>
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
                                {editingWaypoint ? 'Update Waypoint' : 'Save Waypoint'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
