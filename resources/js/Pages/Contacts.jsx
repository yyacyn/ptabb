import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import { MapPin, Phone, Mail, Send, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';

export default function Contacts({ contactInfos = [] }) {
    const [showToast, setShowToast] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        department: 'general',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('contacts.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                setShowToast(true);
                setTimeout(() => setShowToast(false), 5000);
            },
        });
    };

    // Helper functions to get values from backend ContactInfo records
    const getInfoValue = (type, fallback) => {
        const item = contactInfos.find(i => i.type === type);
        return item ? item.value : fallback;
    };

    const address = getInfoValue('office', 'Jl. Roa Malaka Utara No. 17-18, Kel. Roa Malaka, Kec. Tambora, Jakarta Barat, Indonesia');
    const phone = getInfoValue('phone', '+62 21 691 8822');
    const fax = getInfoValue('fax', '+62 21 691 8823');
    const email = getInfoValue('email', 'info@ptabb.com');

    return (
        <GuestLayout>
            <Head title="Contact Us - PT PABB" />

            <div className="space-y-[7px]">
                {/* 1. HERO BANNER SECTION WITH BOTTOM-TO-TOP DARK BLUE GRADIENT */}
                <motion.section
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative rounded-[8px] overflow-hidden border border-[#E5E7EB] h-[400px] lg:h-[480px] flex items-end justify-center bg-[#141B2C]"
                >
                    {/* Background Hero Image */}
                    <div className="absolute inset-0 z-0 bg-[#141B2C]">
                        <img
                            src="/images/contacts/hero.png"
                            alt="PT. ABB Shipping & Freight Management"
                            className="absolute inset-0 w-full h-full object-cover object-center"
                            onError={(e) => {
                                e.currentTarget.src = '/images/office.png';
                            }}
                        />

                        {/* Gradient Overlay: Dark Blue (#141B2C) from Bottom to Top */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141B2C] via-[#141B2C]/75 to-transparent pointer-events-none" />
                    </div>

                    {/* Hero Text Content (Centered Middle-Bottom) */}
                    <div className="relative z-10 text-center px-6 pb-12 lg:pb-10 max-w-4xl mx-auto flex flex-col items-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="font-['Hanken_Grotesk'] font-bold text-[32px] lg:text-[50px] text-white tracking-tight leading-[1.12] text-center mb-4"
                        >
                            We’re Here to Power Your Shipping Needs
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="font-['Hanken_Grotesk'] font-medium text-[16px] lg:text-[18px] text-white/90 max-w-2xl text-center leading-relaxed"
                        >
                            Contact our Jakarta head office or regional representatives to discuss custom ocean freight solutions and fleet arrangements.
                        </motion.p>
                    </div>
                </motion.section>

                {/* 2. SPLIT CONTAINER: HQ ADDRESS & CONTACT INFO (LEFT 50%) + CONTACT FORM (RIGHT 50%) */}
                <div className="flex flex-col lg:flex-row gap-[4px] items-stretch min-h-[580px]">

                    {/* Left Column: Head Office Info Card (50%) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="flex-1 bg-white rounded-[8px] p-6 lg:p-8 flex flex-col justify-between border border-[#E5E7EB]"
                    >
                        <div className="flex flex-col gap-6">
                            {/* Google Maps Location iFrame */}
                            <div className="rounded-[8px] overflow-hidden border border-[#E5E7EB] shadow-xs relative h-[260px] lg:h-[380px]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1983.4935029843605!2d106.80850995717984!3d-6.13244758861908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6a1d740f44cf3d%3A0xc67dd753a9ecda9d!2sPT.ANDALAS%20BAHTERA%20BARUNA!5e0!3m2!1sen!2sid!4v1785738337665!5m2!1sen!2sid"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    title="PT. ABB Head Office Location"
                                />
                            </div>

                            {/* Head Office Info */}
                            <div>
                                <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] lg:text-[40px] text-[#141B2C] tracking-tight mb-5">
                                    Head Office
                                </h2>

                                <div className="space-y-4 font-['Hanken_Grotesk'] text-[15px] lg:text-[16px] text-[#404750]">
                                    {/* Address */}
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-9 h-9 rounded-[6px] bg-gradient-to-r from-[#00629D] to-[#3F96DD] flex items-center justify-center text-white shrink-0 mt-0.5">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="leading-snug font-medium text-[#141B2C] pt-1">
                                            {address}
                                        </div>
                                    </div>

                                    {/* Phone & Fax */}
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-9 h-9 rounded-[6px] bg-gradient-to-r from-[#00629D] to-[#3F96DD] flex items-center justify-center text-white shrink-0 mt-0.5">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div className="leading-tight font-medium text-[#141B2C] space-y-1 pt-1 font-['Hanken_Grotesk']">
                                            <div>{phone} <span className="text-[#404750] text-[14px]">(Phone)</span></div>
                                            <div>{fax} <span className="text-[#404750] text-[14px]">(Fax)</span></div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-9 h-9 rounded-[6px] bg-gradient-to-r from-[#00629D] to-[#3F96DD] flex items-center justify-center text-white shrink-0">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <a
                                            href={`mailto:${email}`}
                                            className="font-medium text-[#141B2C] hover:text-[#00629D] underline transition-colors font-['Hanken_Grotesk']"
                                        >
                                            {email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Send Us a Message Form (50%) */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="flex-1 bg-white rounded-[8px] p-6 lg:p-10 flex flex-col justify-between border border-[#E5E7EB]"
                    >
                        <div>
                            <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] lg:text-[40px] text-[#141B2C] leading-[1.12] tracking-tight mb-2">
                                Send Us a Message
                            </h2>
                            <p className="font-['Hanken_Grotesk'] font-medium text-[15px] lg:text-[16px] text-[#404750] leading-relaxed mb-6">
                                Have a specific inquiry? Please fill out the form below and our team will get back to you promptly.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4 font-['Hanken_Grotesk']">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-[14px] font-bold text-[#141B2C] mb-1">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Jane Doe"
                                        className="w-full px-4 py-3 text-[15px] bg-[#F5F5F5] border border-[#E5E7EB] rounded-[6px] text-[#141B2C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#00629D] focus:bg-white transition-colors"
                                        required
                                    />
                                    {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                                </div>

                                {/* Email Address Field */}
                                <div>
                                    <label className="block text-[14px] font-bold text-[#141B2C] mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="jane@company.com"
                                        className="w-full px-4 py-3 text-[15px] bg-[#F5F5F5] border border-[#E5E7EB] rounded-[6px] text-[#141B2C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#00629D] focus:bg-[#FFF] transition-colors"
                                        required
                                    />
                                    {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                                </div>

                                {/* Company Field (Optional) */}
                                <div>
                                    <label className="block text-[14px] font-bold text-[#141B2C] mb-1">
                                        Company Name <span className="text-[#A0AEC0] font-normal text-[13px]">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.company}
                                        onChange={(e) => setData('company', e.target.value)}
                                        placeholder="Acme Logistics Corp."
                                        className="w-full px-4 py-3 text-[15px] bg-[#F5F5F5] border border-[#E5E7EB] rounded-[6px] text-[#141B2C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#00629D] focus:bg-[#FFF] transition-colors"
                                    />
                                    {errors.company && <div className="text-red-500 text-xs mt-1">{errors.company}</div>}
                                </div>

                                {/* Subject Field */}
                                <div>
                                    <label className="block text-[14px] font-bold text-[#141B2C] mb-1">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        placeholder="Chartering Inquiry"
                                        className="w-full px-4 py-3 text-[15px] bg-[#F5F5F5] border border-[#E5E7EB] rounded-[6px] text-[#141B2C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#00629D] focus:bg-white transition-colors"
                                        required
                                    />
                                    {errors.subject && <div className="text-red-500 text-xs mt-1">{errors.subject}</div>}
                                </div>

                                {/* Message Field */}
                                <div>
                                    <label className="block text-[14px] font-bold text-[#141B2C] mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder="How can we assist you?"
                                        className="w-full px-4 py-3 text-[15px] bg-[#F5F5F5] border border-[#E5E7EB] rounded-[6px] text-[#141B2C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#00629D] focus:bg-white transition-colors resize-none"
                                        required
                                    />
                                    {errors.message && <div className="text-red-500 text-xs mt-1">{errors.message}</div>}
                                </div>

                                {/* Submit Button (Bottom Right) */}
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-gradient-to-r from-[#00629D] to-[#3F96DD] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] active:scale-[0.97] disabled:opacity-50 text-white font-['Hanken_Grotesk'] font-medium text-[15px] px-4 py-2.5 rounded-[4px] inline-flex items-center gap-2 transition-all cursor-pointer"
                                    >
                                        Send Message
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Floating Toast Notification Feedback */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="fixed bottom-6 right-6 z-50 bg-[#141B2C] text-white p-4 rounded-[8px] shadow-2xl border border-emerald-500/30 flex items-center gap-3 max-w-md font-['Hanken_Grotesk']"
                    >
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[15px] text-white leading-tight">Message Sent!</h4>
                            <p className="text-[13px] text-slate-300 mt-0.5 leading-snug">
                                Thank you for reaching out. Your message has been received and our team will get back to you soon.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowToast(false)}
                            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors shrink-0 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </GuestLayout>
    );
}
