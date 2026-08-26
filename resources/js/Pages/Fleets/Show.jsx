import { Head, Link, usePoll } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import CtaBanner from '@/Components/CtaBanner';
import LeafletViewer from '@/Components/LeafletViewer';
import { ChevronLeft, Anchor, Weight, Gauge, File, ArrowRight, Ship, Navigation, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function FleetShow({ fleet, voyage_waypoint }) {
    // Poll telemetry every 3000ms for real-time live vessel route tracking
    usePoll(3000, {
        only: ['voyage_waypoint'],
    });

    const vessel = fleet || {};

    const vesselName = (vessel.ship_name || vessel.name || 'Not Available').toUpperCase();
    const pdfUrl = vessel.ship_particular_pdf_url || vessel.particulars_pdf_url || null;

    // Build fallback waypoint data for this vessel if not passed
    const currentWaypoint = voyage_waypoint || {
        id: vessel.id || 1,
        vessel: vesselName,
        lat: -6.1,
        lng: 106.8,
        speed: '11.4 knots',
        cog: 45,
        status: vessel.status || 'Active - In Service',
        route_points: [
            { id: 1, name: 'Origin Port', lat: -6.1, lng: 106.8, type: 'Origin', sequence: 1 },
            { id: 2, name: 'Way Point 1', lat: -5.8, lng: 107.5, type: 'Way Point', sequence: 2 },
            { id: 3, name: 'Destination Port', lat: -5.2, lng: 108.2, type: 'Destination', sequence: 3 },
        ]
    };

    const formatVal = (val, unit = '') => {
        if (val === null || val === undefined || val === '' || val === '0' || val === 0) return 'Not Available';
        const strVal = String(val).trim();
        if (!strVal || strVal.toLowerCase() === 'null') return 'Not Available';
        if (unit && !strVal.toLowerCase().includes(unit.toLowerCase())) {
            return `${strVal} ${unit}`;
        }
        return strVal;
    };

    const formatStatus = (val) => {
        if (!val || val === '0' || val === 0 || val === 'Not Available') return 'Not Available';
        let strVal = String(val).trim().replace(/_/g, ' ');
        if (strVal.toLowerCase() === 'in service' || strVal.toLowerCase() === 'in_service' || strVal.toLowerCase() === 'active') {
            return 'In Service';
        }
        return strVal.replace(/\b\w/g, l => l.toUpperCase());
    };

    // Card 2 Specs - Matched strictly to Fleet model columns
    const specs = [
        { label: 'Flag', value: formatVal(vessel.flag) },
        { label: 'Classification Society', value: formatVal(vessel.classification_society) },
        { label: 'DWT (Deadweight)', value: formatVal(vessel.dwt || vessel.deadweight, 'tons') },
        { label: 'Capacity', value: formatVal(vessel.capacity, 'm3') },
        { label: 'Vessel Type', value: (vessel.vessel_type || vessel.category?.name || 'Not Available').toUpperCase() },
        { label: 'Gross Tonnage', value: formatVal(vessel.gross_tonnage, 'GT') },
        { label: 'Net Tonnage', value: formatVal(vessel.net_tonnage, 'GT') },
        { label: 'Operational Area', value: formatVal(vessel.operational_area) },
        { label: 'Build Year', value: formatVal(vessel.build_year) }
    ];

    // Card 4 Full Specs Grid Categories - Strictly mapped ONLY to existing columns in Fleet.php
    const specCategories = [
        {
            title: 'GENERAL PARTICULARS',
            icon: Anchor,
            items: [
                { label: 'IMO Number', value: formatVal(vessel.imo_number) },
                { label: 'Vessel Type', value: (vessel.vessel_type || vessel.category?.name || 'Not Available').toUpperCase() },
                { label: 'Flag', value: formatVal(vessel.flag) },
                { label: 'Port of Registry', value: formatVal(vessel.port_of_registry) },
                { label: 'Classification Society', value: formatVal(vessel.classification_society) },
                { label: 'Call Sign', value: formatVal(vessel.call_sign) },
                { label: 'MMSI', value: formatVal(vessel.mmsi) },
                { label: 'Hull Number', value: formatVal(vessel.hull_no) },
                { label: 'Build Year', value: formatVal(vessel.build_year) },
                { label: 'Operational Area', value: formatVal(vessel.operational_area) },
                { label: 'Status', value: formatStatus(vessel.status) },
            ]
        },
        {
            title: 'DIMENSIONS & TONNAGE',
            icon: Weight,
            items: [
                { label: 'LOA (Length Overall)', value: formatVal(vessel.loa, 'm') },
                { label: 'LBP (Length Between Perp.)', value: formatVal(vessel.lbp, 'm') },
                { label: 'Breadth (MLD)', value: formatVal(vessel.breadth, 'm') },
                { label: 'Depth (MLD)', value: formatVal(vessel.depth, 'm') },
                { label: 'Summer Draft', value: formatVal(vessel.summer_draft, 'm') },
                { label: 'Gross Tonnage (GT)', value: formatVal(vessel.gross_tonnage, 'GT') },
                { label: 'Net Tonnage (NT)', value: formatVal(vessel.net_tonnage, 'GT') },
                { label: 'Light Ship', value: formatVal(vessel.light_ship, 't') },
            ]
        },
        {
            title: 'CAPACITY & PERFORMANCE',
            icon: Gauge,
            items: [
                { label: 'Deadweight (DWT)', value: formatVal(vessel.dwt || vessel.deadweight, 'tons') },
                { label: 'Cargo / Hold Capacity', value: formatVal(vessel.capacity, 'M3') },
                { label: 'Service Speed', value: formatVal(vessel.speed, 'knots') },
            ]
        }
    ];

    return (
        <GuestLayout>
            <Head title={`${vesselName} | Vessel Specifications & Live Telemetry | PT. ABB`} />

            <div className="bg-[#F5F5F5] min-h-screen">
                <div className="max-w-full mx-auto space-y-[7px] font-['Hanken_Grotesk'] text-[#141B2C]">

                    {/* BLOCK 1: TOP HEADER BLOCK (Name & Eyebrow) */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-[8px] border border-[#E5E7EB] p-5 sm:p-7 flex items-center gap-4"
                    >
                        {/* Red Back Chevron Button */}
                        <Link
                            href={route('public.fleets')}
                            className="group bg-gradient-to-r from-[#D93A2B] to-[#FF5542] text-white p-3 rounded-[8px] transition-[colors,shadow,opacity,transform] duration-200 hover:shadow-[0_4px_14px_rgba(217,58,43,0.35)] flex items-center justify-center active:scale-[0.97] cursor-pointer shrink-0"
                            title="Back to Fleet Inventory"
                        >
                            <ChevronLeft className="w-5 h-5 stroke-[3] group-hover:-translate-x-0.5 transition-transform duration-150" />
                        </Link>

                        {/* Title Block */}
                        <div>
                            <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#404750] tracking-wider">
                                VESSEL
                            </div>
                            <h1 className="font-['Hanken_Grotesk'] font-bold text-[28px] sm:text-[36px] lg:text-[42px] text-[#141B2C] tracking-tight leading-none mt-0.5">
                                {vesselName}
                            </h1>
                        </div>
                    </motion.div>

                    {/* MIDDLE ROW: BLOCKS 2 & 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-[7px] items-stretch"
                    >
                        {/* BLOCK 2: LEFT DESCRIPTION & SPECS BLOCK */}
                        <div className="lg:col-span-4 bg-white rounded-[8px] border border-[#E5E7EB] p-5 sm:p-6 flex flex-col justify-between">
                            <div>
                                {/* Section Header */}
                                <div className="font-['JetBrains_Mono'] font-bold text-[13px] uppercase text-[#404750] tracking-wider mb-3">
                                    ABOUT {vesselName}
                                </div>

                                {/* Description Paragraph */}
                                <p className="text-[15px] text-[#404750] leading-relaxed mb-5">
                                    {vessel.description || 'Not Available'}
                                </p>

                                {/* Specs List */}
                                <div className="border-[#E5E7EB]">
                                    {specs.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-2 text-[15px]">
                                            <span className="text-[#404750] font-medium">{item.label}</span>
                                            <span className="font-bold text-[#141B2C] text-right font-['JetBrains_Mono']">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Book This Vessel Button */}
                            <div className="pt-4 mt-4">
                                <Link
                                    href={route('public.contacts')}
                                    className="group bg-gradient-to-r from-[#00629D] to-[#3F96DD] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] active:scale-[0.97] text-white text-[14px] font-['Hanken_Grotesk'] font-semibold px-5 py-2.5 rounded-[4px] inline-flex items-center justify-center gap-2 transition-[colors,shadow,opacity,transform] duration-200 cursor-pointer w-full"
                                >
                                    Book This Vessel
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-active:translate-x-0 transition-transform duration-150" />
                                </Link>
                            </div>
                        </div>

                        {/* BLOCK 3: RIGHT HERO VESSEL IMAGE BLOCK */}
                        <div className="lg:col-span-8 bg-[#141B2C] rounded-[8px] border border-[#E5E7EB] overflow-hidden relative min-h-[360px] sm:min-h-[440px] lg:min-h-[560px] w-full group">
                            <img
                                src={vessel.featured_image_url || vessel.image || '/images/card_bulk_vessel.png'}
                                alt={vesselName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                    e.currentTarget.src = '/images/card_bulk_vessel.png';
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* CURRENT VOYAGE STATUS SECTION (REAL-TIME ROUTE MAP) */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="bg-[#141B2C] rounded-[8px] p-6 sm:p-8 lg:p-10 space-y-6 text-white"
                    >
                        <div className="text-center">
                            <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#8AAFC8] tracking-wider mb-1">
                                CURRENT VOYAGE STATUS
                            </div>
                            <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] text-white tracking-tight leading-none">
                                Real-Time Route
                            </h2>
                        </div>

                        {/* Map Container */}
                        <div className="w-full rounded-[8px] overflow-hidden relative border border-white/10 shadow-lg bg-[#0F172A]">
                            {/* Live Badge */}
                            <div className="absolute top-4 right-4 z-20 bg-[#16a34a] text-white px-3 py-1 rounded-full text-[12px] font-['JetBrains_Mono'] font-bold flex items-center gap-1.5 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                LIVE
                            </div>

                            <LeafletViewer waypoint={currentWaypoint} height="h-[450px] sm:h-[550px]" />
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* CTA BANNER SECTION */}
            <CtaBanner
                title="Ready to Chart Your Next High-Tonnage Voyage?"
                description="Whether you need bulk cement transportation, specialized vessel charters, or long-term marine logistics, our ISO-certified fleet is ready to deliver."
                buttonLabel="Request Charter Proposal"
                buttonRoute="public.contacts"
            />
        </GuestLayout>
    );
}
