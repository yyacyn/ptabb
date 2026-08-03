import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import {
    ChevronLeft, Briefcase, MapPin, Clock, Calendar,
    ArrowRight, CheckCircle, ListChecks
} from 'lucide-react';

export default function CareerShow({ career }) {
    if (!career) return null;

    const categoryColor = (cat) => {
        const l = (cat || '').toLowerCase();
        if (l === 'corporate' || l === 'office') return 'bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white';
        if (l === 'seafaring' || l === 'crew')   return 'bg-gradient-to-r from-[#D93A2B] to-[#FF5542] text-white';
        return 'bg-[#404750] text-white';
    };

    const applyBtnClass = (cat) => {
        const l = (cat || '').toLowerCase();
        return (l === 'seafaring' || l === 'crew')
            ? 'from-[#D93A2B] to-[#FF5542] hover:shadow-[0_4px_14px_rgba(217,58,43,0.35)]'
            : 'from-[#00629D] to-[#3F96DD] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)]';
    };

    const formatType = (t) =>
        (t || 'Full Time').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

    const isDeadlineSoon = (d) => {
        if (!d) return false;
        return new Date(d) - new Date() < 1000 * 60 * 60 * 24 * 14; // within 14 days
    };

    // Split multi-line text fields into bullet list items
    const toLines = (text) =>
        (text || '').split(/\r?\n/).map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

    return (
        <GuestLayout>
            <Head title={`${career.position} - Careers at PT PABB`} />

            <div className="space-y-[7px] font-['Hanken_Grotesk'] text-[#141B2C]">

                {/* ── BLOCK 1: Header Bar ── */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-[8px] border border-[#E5E7EB] p-5 sm:p-7 flex flex-wrap items-center gap-4"
                >
                    <Link
                        href={route('public.careers')}
                        className="group bg-gradient-to-r from-[#D93A2B] to-[#FF5542] text-white p-3 rounded-[8px] transition-all hover:shadow-[0_4px_14px_rgba(217,58,43,0.35)] flex items-center justify-center active:scale-[0.97] cursor-pointer shrink-0"
                        title="Back to Careers"
                    >
                        <ChevronLeft className="w-5 h-5 stroke-[3] group-hover:-translate-x-0.5 transition-transform duration-150" />
                    </Link>

                    <div className="flex lg:flex-row-reverse flex-col min-w-0 lg:gap-5 items-center">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[8px] lg:text-[14px] font-['JetBrains_Mono'] font-bold uppercase px-2 py-0.5 rounded-[3px] ${categoryColor(career.category)}`}>
                                {(career.category || 'General').toUpperCase()}
                            </span>
                            <span className="text-[8px] lg:text-[14px] font-['JetBrains_Mono'] font-bold uppercase px-2 py-0.5 rounded-[3px] text-[#404750] border border-[#E5E7EB]">
                                {formatType(career.employment_type)}
                            </span>
                        </div>
                        <h1 className="font-['Hanken_Grotesk'] font-bold text-[20px] lg:text-[28px] text-[#141B2C] tracking-tight leading-tight">
                            {career.position}
                        </h1>
                    </div>
                </motion.div>

                {/* ── BLOCK 2: Main Content + Sidebar ── */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-[7px] items-start"
                >
                    {/* Left: Job Detail */}
                    <div className="lg:col-span-8 bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-8 space-y-8">

                        {/* Position Overview */}
                        {career.description && (
                            <section>
                                <h2 className="font-['Hanken_Grotesk'] font-bold text-[18px] lg:text-[24px] text-[#141B2C] mb-2 lg:mb-2">
                                    Position Overview
                                </h2>
                                <p className="text-[14px] lg:text-[17px] text-[#404750] leading-relaxed">
                                    {career.description}
                                </p>
                            </section>
                        )}

                        {/* Key Responsibilities */}
                        {career.responsibilities && (
                            <section>
                                <h2 className="font-['Hanken_Grotesk'] font-bold text-[18px] lg:text-[24px] text-[#141B2C] mb-2 lg:mb-2">
                                    Key Responsibilities
                                </h2>
                                <ul className="space-y-2">
                                    {toLines(career.responsibilities).map((line, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-[14px] lg:text-[17px] text-[#404750] leading-relaxed">
                                            <span className="lg:mt-[1px] shrink-0 text-[#00629D]">•</span>
                                            {line}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Qualifications & Requirements */}
                        {career.requirements && (
                            <section>
                                <h2 className="font-['Hanken_Grotesk'] font-bold text-[18px] lg:text-[24px] text-[#141B2C] mb-2 lg:mb-2">
                                    Qualifications &amp; Requirements
                                </h2>
                                <ul className="space-y-2">
                                    {toLines(career.requirements).map((line, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-[14px] lg:text-[17px] text-[#404750] leading-relaxed">
                                            <CheckCircle className="w-4 h-4 text-[#00629D] shrink-0 lg:mt-[1px] stroke-[2]" />
                                            {line}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    {/* Right: Job Summary Sidebar */}
                    <div className="lg:col-span-4 bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-8 space-y-5">
                        <h2 className="font-['Hanken_Grotesk'] font-bold text-[18px] lg:text-[24px] text-[#141B2C]">
                            Job Summary
                        </h2>

                        <div className="divide-y divide-[#F0F0F0]">
                            {[
                                {
                                    icon: Calendar,
                                    label: 'Date Posted',
                                    value: formatDate(career.created_at),
                                    highlight: false,
                                },
                                {
                                    icon: Clock,
                                    label: 'Application Deadline',
                                    value: career.application_deadline ? formatDate(career.application_deadline) : 'Open Until Filled',
                                    highlight: career.application_deadline && isDeadlineSoon(career.application_deadline),
                                },
                                {
                                    icon: Briefcase,
                                    label: 'Department',
                                    value: career.department || '—',
                                    highlight: false,
                                },
                                {
                                    icon: MapPin,
                                    label: 'Location',
                                    value: career.location || '—',
                                    highlight: false,
                                },
                            ].map((row, i) => {
                                const RowIcon = row.icon;
                                return (
                                    <div key={i} className="flex items-center justify-between py-3 gap-4">
                                        <span className="flex items-center gap-2 text-[14px] lg:text-[17px] text-[#404750] shrink-0">
                                            <RowIcon className="w-4.5 h-4.5 text-[#00629D] stroke-[2] shrink-0" />
                                            {row.label}
                                        </span>
                                        <span className={`text-[14px] lg:text-[17px] font-semibold text-right ${row.highlight ? 'text-[#D93A2B]' : 'text-[#141B2C]'}`}>
                                            {row.value}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Apply Button */}
                        <Link
                            href={route('contacts.index')}
                            className={`group w-full bg-gradient-to-r ${applyBtnClass(career.category)} text-white font-['Hanken_Grotesk'] font-semibold text-[15px] py-3 px-6 rounded-[6px] inline-flex items-center justify-center gap-2 transition-all active:scale-[0.97] cursor-pointer`}
                        >
                            Apply Now
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
                        </Link>
                    </div>
                </motion.div>

                {/* ── BLOCK 3: CTA ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-[#00629D] to-[#3F96DD] rounded-[8px] p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden"
                >
                    <div className="max-w-3xl mx-auto flex flex-col items-center">
                        <h2 className="font-['Hanken_Grotesk'] font-bold text-[28px] sm:text-[40px] tracking-tight mb-4 text-white">
                            Ready to Join PT. ABB?
                        </h2>
                        <p className="font-['Hanken_Grotesk'] font-medium text-[17px] sm:text-[18px] text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
                            Submit your application through our contact form and our HR team will get back to you within 3–5 business days.
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                            <Link
                                href={route('contacts.index')}
                                className="bg-gradient-to-r from-[#D93A2B] to-[#FF5542] text-white rounded-[8px] px-[36px] py-[14px] font-['Hanken_Grotesk'] font-semibold text-[16px] hover:shadow-[0_4px_14px_rgba(217,58,43,0.35)] active:scale-[0.97] inline-flex items-center gap-2.5 mt-2 transition-all"
                            >
                                Apply Now
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.section>
            </div>
        </GuestLayout>
    );
}
