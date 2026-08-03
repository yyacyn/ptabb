import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { ChevronLeft, Calendar, User, Eye, Tag, ArrowRight, Share2, Link2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function NewsShow({ article, relatedNews = [] }) {
    const [copied, setCopied] = useState(false);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Recent';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const resolveArticleImage = (item) => {
        if (!item) return '/images/news/top.jpg';
        let img = item.featured_image_url || item.featured_image || item.image;
        if (!img || img === 'null' || img === 'undefined' || typeof img !== 'string' || img.trim() === '') {
            return '/images/news/top.jpg';
        }
        img = img.trim();
        if (img.startsWith('http://') || img.startsWith('https://')) return img;
        if (img.startsWith('/images/') || img.startsWith('/storage/')) return img;
        if (img.startsWith('assets/images/news/')) return `/${img.replace('assets/images/news/', 'images/news/')}`;
        if (img.startsWith('../assets/images/news/')) return `/${img.replace('../assets/images/news/', 'images/news/')}`;
        if (img.startsWith('images/') || img.startsWith('storage/')) return `/${img}`;
        const filename = img.split('/').pop();
        if (filename.startsWith('ship_')) return `/images/fleet/${filename}`;
        return `/images/news/${filename}`;
    };

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${article.title} - ${currentUrl}`)}`;
    const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;

    return (
        <GuestLayout>
            <Head title={`${article?.title || 'Article Detail'} — PT Pelayaran Pelangi Tunggal Ikan (ABB)`} />

            <div className="w-full max-w-[1440px] mx-auto font-['Hanken_Grotesk'] text-[#141B2C]">
                
                {/* 2-Column Split: Main Article (8 cols) + Side Related Articles (4 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start ">
                    
                    {/* LEFT / MAIN ARTICLE COLUMN (8 cols) */}
                    <motion.article
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="lg:col-span-8 bg-white rounded-[12px] p-6 sm:p-10 shadow-xs space-y-6 border border-[#E5E7EB]"
                    >
                        {/* Top Bar inside Container: Back Button + Category Tag & Meta Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/news"
                                    className="inline-flex items-center gap-1 text-base font-bold text-[#00629D] hover:text-[#004e7e] transition-colors group cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                    Back to News
                                </Link>
                                <span className="text-slate-300">•</span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#00629D] text-white rounded-[4px] font-['JetBrains_Mono'] text-[11px] font-bold uppercase tracking-wider">
                                    <Tag className="w-3 h-3 stroke-[2]" />
                                    {article.category?.name || article.category_name || 'Company News'}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs font-['JetBrains_Mono'] text-[#404750]">
                                <span className="flex items-center gap-1.5 font-semibold">
                                    <Calendar className="w-3.5 h-3.5 text-[#00629D]" />
                                    {formatDate(article.published_at || article.created_at)}
                                </span>
                                {article.author && (
                                    <span className="flex items-center gap-1.5 font-semibold">
                                        <User className="w-3.5 h-3.5 text-[#00629D]" />
                                        {article.author}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5 font-semibold">
                                    <Eye className="w-3.5 h-3.5 text-[#00629D]" />
                                    {article.view_count || 1} views
                                </span>
                            </div>
                        </div>

                        {/* Article Title */}
                        <h1 className="font-['Hanken_Grotesk'] font-bold text-[28px] sm:text-[36px] lg:text-[40px] text-[#141B2C] leading-[1.18] tracking-tight">
                            {article.title}
                        </h1>

                        {/* Lead Excerpt Summary */}
                        {article.excerpt && (
                            <p className="font-medium text-[16px] text-[#404750] leading-relaxed pl-4 py-2 bg-slate-50/90 rounded-[6px]">
                                {article.excerpt}
                            </p>
                        )}

                        {/* Featured Image Cover */}
                        <div className="relative rounded-[10px] overflow-hidden bg-slate-100 max-h-[520px]">
                            <img
                                src={resolveArticleImage(article)}
                                alt={article.title}
                                className="w-full h-full object-cover max-h-[520px]"
                                onError={(e) => {
                                    e.currentTarget.src = '/images/news/top.jpg';
                                }}
                            />
                        </div>

                        {/* Rich Text Body Content */}
                        <div className="pt-2 text-[#141B2C] font-['Hanken_Grotesk'] leading-relaxed text-[16px] sm:text-[17px] space-y-4">
                            {article.content ? (
                                <div
                                    className="prose prose-slate max-w-none text-[#141B2C] font-['Hanken_Grotesk'] leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                />
                            ) : (
                                <p className="text-[#404750] italic">
                                    No additional content body provided for this press release.
                                </p>
                            )}
                        </div>

                        {/* Social Share Bar inside Container (No top border line) */}
                        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 ">
                            <div className="flex items-center gap-2 ">
                                <span className="text-xs font-bold text-[#404750] flex items-center gap-1 mr-1">
                                    <Share2 className="w-3.5 h-3.5 text-[#00629D]" /> Share:
                                </span>

                                {/* WhatsApp Button */}
                                <a
                                    href={shareWhatsApp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer"
                                >
                                    <i className="fa-brands fa-whatsapp text-sm"></i>
                                    WhatsApp
                                </a>

                                {/* Facebook Button */}
                                <a
                                    href={shareFacebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer"
                                >
                                    <i className="fa-brands fa-facebook-f text-sm"></i>
                                    Facebook
                                </a>

                                {/* LinkedIn Button */}
                                <a
                                    href={shareLinkedIn}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2] hover:bg-[#0855a3] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer"
                                >
                                    <i className="fa-brands fa-linkedin-in text-sm"></i>
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </motion.article>

                    {/* RIGHT SIDEBAR COLUMN (4 cols) - RELATED NEWS */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-[60px] ">
                        {relatedNews && relatedNews.length > 0 && (
                            <motion.aside
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className="bg-white rounded-[12px] border border-[#E5E7EB] p-6 shadow-xs space-y-5"
                            >
                                <div className="flex items-center justify-between pb-1">
                                    <h3 className="font-['Hanken_Grotesk'] font-bold text-[18px] text-[#141B2C]">
                                        Related Articles
                                    </h3>
                                    <Link href="/news" className="text-base font-bold text-[#00629D] hover:underline flex items-center gap-1">
                                        View All <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {relatedNews.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/news/${item.slug || item.id}`}
                                            className="group flex items-center gap-3.5 p-2 rounded-[8px] hover:bg-slate-50 transition-all cursor-pointer"
                                        >
                                            <div className="relative w-20 h-16 rounded-[6px] overflow-hidden bg-slate-100 shrink-0">
                                                <img
                                                    src={resolveArticleImage(item)}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/images/news/top.jpg';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[11px] font-['JetBrains_Mono'] text-[#404750] block mb-0.5">
                                                    {formatDate(item.published_at || item.created_at)}
                                                </span>
                                                <h4 className="font-bold text-[14px] text-[#141B2C] group-hover:text-[#00629D] transition-colors line-clamp-2 leading-snug">
                                                    {item.title}
                                                </h4>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.aside>
                        )}
                    </div>

                </div>
            </div>
        </GuestLayout>
    );
}
