import { useForm, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle2 } from 'lucide-react';

export default function JobApplyModal({ career = null, onClose = () => { }, onSuccess = () => { } }) {
    const [resumeError, setResumeError] = useState(null);

    const { data, setData, post, processing, errors, reset, setError, clearErrors, transform } = useForm({
        name: '',
        company: 'Job Candidate',
        email: '',
        phone: '',
        subject: '',
        message: '',
        department: 'hrd',
        resume: null
    });

    const getDepartment = (c) => {
        const cat = (c?.category || '').toLowerCase();
        if (cat === 'seafaring' || cat === 'crew' || cat.includes('deck') || cat.includes('engine') || cat.includes('crew')) {
            return 'crew';
        }
        return 'hrd';
    };

    useEffect(() => {
        if (career) {
            setResumeError(null);
            clearErrors();
            setData({
                name: '',
                company: 'Job Candidate',
                email: '',
                phone: '',
                subject: career.isGeneric ? 'General Job Application / Spontaneous Candidate' : `Job Application: ${career.position || ''}`,
                message: '',
                department: (career.isGeneric || !career.id) ? 'general' : getDepartment(career),
                resume: null
            });
        }
    }, [career]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (career) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [career]);

    // Format phone number to Indonesian format (+62 8XX XXXX XXXX)
    const formatPhone = (val) => {
        const hasPlus = val.startsWith('+');
        let digits = val.replace(/\D/g, '');

        // Cap at 13 digits
        digits = digits.slice(0, 13);

        // Leading 0 → convert to Indonesian +62
        if (digits.startsWith('0')) digits = '62' + digits.slice(1);

        // Indonesian +62: format as +62 8XX XXXX XXXX
        if (digits.startsWith('62')) {
            const rest = digits.slice(2);
            let parts = ['+62'];
            if (rest.length > 0) parts.push(rest.slice(0, 3));
            if (rest.length > 3) parts.push(rest.slice(3, 7));
            if (rest.length > 7) parts.push(rest.slice(7, 11));
            return parts.join(' ');
        }

        // Other international with + prefix: +XX XXX XXXX XXXX
        if (hasPlus && digits.length > 0) {
            let parts = ['+' + digits.slice(0, 2)];
            if (digits.length > 2) parts.push(digits.slice(2, 5));
            if (digits.length > 5) parts.push(digits.slice(5, 9));
            if (digits.length > 9) parts.push(digits.slice(9, 13));
            return parts.join(' ');
        }

        // Plain digits (no + prefix): group as XXX XXXX XXXX
        let parts = [];
        if (digits.length > 0) parts.push(digits.slice(0, 3));
        if (digits.length > 3) parts.push(digits.slice(3, 7));
        if (digits.length > 7) parts.push(digits.slice(7, 11));
        if (digits.length > 11) parts.push(digits.slice(11, 13));
        return parts.join(' ');
    };

    const handlePhoneChange = (e) => {
        setData('phone', formatPhone(e.target.value));
    };

    const handleResumeChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isDoc = file.type === 'application/pdf'
            || file.type === 'application/msword'
            || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            || /\.(pdf|doc|docx)$/i.test(file.name);

        if (!isDoc) {
            setResumeError('The resume file must be a document of type: pdf, doc, docx.');
            setData('resume', null);
            e.target.value = null;
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setResumeError('The resume file size may not be greater than 10MB.');
            setData('resume', null);
            e.target.value = null;
            return;
        }

        setResumeError(null);
        setData('resume', file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setResumeError(null);
        clearErrors();

        if (!data.name || !data.name.trim()) {
            setError('name', 'The full name field is required.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !data.email.trim()) {
            setError('email', 'The email address field is required.');
            return;
        } else if (!emailRegex.test(data.email.trim())) {
            setError('email', 'Please enter a valid email address (e.g. name@example.com).');
            return;
        }

        const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;
        if (validatePhone(data.phone)) {
            return;
        }

        if (!data.resume) {
            setResumeError('Please select a valid Resume / CV file (.pdf, .doc, .docx max 10MB).');
            return;
        }

        const relativeUrl = career?.id ? route('public.careers.show', career.id) : route('public.careers');
        const jobUrl = relativeUrl.startsWith('http') ? relativeUrl : (window.location.origin + relativeUrl);
        const userMsg = data.message && data.message.trim() ? data.message : 'No additional candidate notes provided.';
        const fullMessage = career?.id
            ? `Job Position Link: ${jobUrl}\n\nCover Letter:\n${userMsg}`
            : `Spontaneous Candidate Pool Submission\nCareers Portal Link: ${jobUrl}\nTarget Stream: ${data.department.toUpperCase()}\n\nCover Letter / Qualifications Overview:\n${userMsg}`;

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('company', data.company || 'Job Candidate');
        formData.append('subject', data.subject);
        formData.append('department', data.department);
        formData.append('message', fullMessage);
        if (data.resume) formData.append('resume', data.resume);

        router.post(route('contacts.store'), formData, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                setResumeError(null);
                onClose();
                onSuccess();
            },
            onError: (errs) => {
                Object.entries(errs).forEach(([key, msg]) => setError(key, msg));
            },
        });
    };

    return (
        <AnimatePresence>
            {career && (
                <motion.div
                    key="job-apply-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs font-['Hanken_Grotesk']"
                >
                    <motion.div
                        key="job-apply-modal-card"
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-left"
                    >
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white p-5 sm:p-6 flex items-start justify-between shrink-0">
                        <div>
                            <h3 className="text-[20px] sm:text-[22px] font-bold text-white leading-tight mt-0.5">
                                {career.isGeneric ? 'Submit Your CV to Talent Pool' : `Apply for ${career.position}`}
                            </h3>
                            <p className="text-[13px] text-slate-300 mt-1">
                                {career.isGeneric ? 'PT. ABB Spontaneous Candidate Database' : `${career.department || 'Operations'} • ${career.location || 'Indonesia'}`}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 rounded-md text-white hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Modal Form Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-[#141B2C]">

                        <div>
                            <label className="block text-[13px] font-bold text-[#141B2C] mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={255}
                                placeholder="e.g. Budi Santoso"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-[14px] bg-[#F5F5F5] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#00629D] focus:bg-white transition-colors"
                            />
                            {(data.name || '').length >= 255 && (
                                <p className="text-xs text-amber-600 mt-1 font-medium">Maximum limit reached (255 chars).</p>
                            )}
                            {errors.name && <p className="text-xs text-rose-500 font-medium mt-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[13px] font-bold text-[#141B2C] mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    maxLength={255}
                                    placeholder="budi@example.com"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-[14px] bg-[#F5F5F5] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#00629D] focus:bg-white transition-colors"
                                />
                                {(data.email || '').length >= 255 && (
                                    <p className="text-xs text-amber-600 mt-1 font-medium">Maximum limit reached (255 chars).</p>
                                )}
                                {errors.email && <p className="text-xs text-rose-500 font-medium mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-[13px] font-bold text-[#141B2C] mb-1">
                                    Phone / WhatsApp <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    maxLength={20}
                                    placeholder="+62 812 3456 7890"
                                    value={data.phone}
                                    onChange={handlePhoneChange}
                                    className="w-full px-3.5 py-2.5 text-[14px] bg-[#F5F5F5] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#00629D] focus:bg-white transition-colors"
                                />
                                {(data.phone || '').length >= 20 && (
                                    <p className="text-xs text-amber-600 mt-1 font-medium">Maximum limit reached (20 chars).</p>
                                )}
                                {errors.phone && <p className="text-xs text-rose-500 font-medium mt-1">{errors.phone}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-[#141B2C] mb-1">
                                Upload Resume / CV (.pdf, max 10MB) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative border-2 border-dashed border-[#E5E7EB] hover:border-[#00629D] rounded-[8px] p-4 bg-[#F5F5F5] hover:bg-slate-100/80 transition-colors text-center cursor-pointer">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    required
                                    onChange={handleResumeChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="w-6 h-6 text-[#00629D] mx-auto mb-1" />
                                <span className="text-[13px] font-semibold text-[#141B2C]">
                                    {data.resume ? data.resume.name : 'Click or drag your Resume / CV file here'}
                                </span>
                                <p className="text-[11px] text-slate-500 mt-0.5">PDF or Word format accepted (Max 10MB)</p>
                            </div>
                            {(resumeError || errors.resume) && (
                                <p className="text-xs text-rose-500 font-medium mt-1">{resumeError || errors.resume}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-[13px] font-bold text-[#141B2C]">
                                    Cover Letter <span className="text-[#A0AEC0] font-normal">(Optional)</span>
                                </label>
                            </div>
                            <textarea
                                rows={4}
                                maxLength={2000}
                                placeholder="Briefly state your seafaring qualifications, certifications, or marine experience..."
                                value={data.message}
                                onChange={e => setData('message', e.target.value)}
                                className="w-full px-3.5 py-2.5 text-[14px] bg-[#F5F5F5] border border-[#E5E7EB] rounded-[6px] focus:outline-none focus:border-[#00629D] focus:bg-white transition-colors font-['Hanken_Grotesk'] leading-relaxed"
                            />
                            {(data.message || '').length >= 2000 && (
                                <p className="text-xs text-amber-600 mt-1 font-medium">Maximum limit reached (2000 chars).</p>
                            )}
                            {errors.message && <p className="text-xs text-rose-500 font-medium mt-1">{errors.message}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-[#E5E7EB]">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-[14px] font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white font-semibold px-6 py-2.5 rounded-[6px] text-[14px] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-60"
                            >
                                {processing ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>
    );
}
