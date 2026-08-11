import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import {
    Newspaper,
    Calendar,
    User,
    Eye,
    ArrowRight,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    X,
    Sparkles,
    Tag
} from 'lucide-react';

const EMPTY_NEWS = [];
const EMPTY_CATEGORIES = [];

export default function NewsPage({ news = EMPTY_NEWS, categories = EMPTY_CATEGORIES }) {
    // Only use backend data provided by controller (no static hardcoded fallbacks)
    const displayNews = news || [];

    // Filter featured/headline news articles for Hero slideshow (up to 8 items)
    const featuredNewsList = (displayNews.filter(item => item.is_featured).length > 1
        ? displayNews.filter(item => item.is_featured)
        : displayNews).slice(0, 8);

    // Hero headline slideshow rotation state (7 seconds interval)
    const [currentHeroIdx, setCurrentHeroIdx] = useState(0);

    useEffect(() => {
        if (!featuredNewsList || featuredNewsList.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentHeroIdx((prevIdx) => (prevIdx + 1) % featuredNewsList.length);
        }, 7000);

        return () => clearInterval(timer);
    }, [featuredNewsList.length]);

    const activeHeadline = featuredNewsList[currentHeroIdx % featuredNewsList.length] || displayNews[0] || null;

    // Search and Filter State matching Fleets.jsx
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortOrder, setSortOrder] = useState('latest');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [openSubDropdown, setOpenSubDropdown] = useState(null);
    const filterMenuRef = useRef(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Close filter dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setIsFilterMenuOpen(false);
                setOpenSubDropdown(null);
            }
        };

        if (isFilterMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterMenuOpen]);

    // Reset pagination when search query, categories, or sort order changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategories, sortOrder]);

    // News Categories List from DB (NewsCategory model) or fallback extracted category names
    const categoryList = categories && categories.length > 0
        ? categories.map(c => c.name)
        : Array.from(new Set(displayNews.map(n => n.category?.name || n.category_name).filter(Boolean))).sort();

    const activeFiltersCount = selectedCategories.length + (sortOrder !== 'latest' ? 1 : 0);

    // Filtered & Sorted News Articles
    const filteredNews = displayNews
        .filter((article) => {
            const title = (article.title || '').toLowerCase();
            const excerpt = (article.excerpt || '').toLowerCase();
            const content = (article.content || '').toLowerCase();
            const categoryName = (article.category?.name || article.category_name || '').toLowerCase();
            const author = (article.author || '').toLowerCase();
            const query = searchQuery.toLowerCase().trim();

            const matchesQuery = !query ||
                title.includes(query) ||
                excerpt.includes(query) ||
                content.includes(query) ||
                categoryName.includes(query) ||
                author.includes(query);

            const articleCatName = article.category?.name || article.category_name;
            const matchesCategory = selectedCategories.length === 0 ||
                (articleCatName && selectedCategories.includes(articleCatName));

            return matchesQuery && matchesCategory;
        })
        .sort((a, b) => {
            if (sortOrder === 'oldest') {
                return new Date(a.publish_date || a.created_at) - new Date(b.publish_date || b.created_at);
            }
            if (sortOrder === 'views') {
                return (b.view_count || 0) - (a.view_count || 0);
            }
            // Default: latest first
            return new Date(b.publish_date || b.created_at) - new Date(a.publish_date || a.created_at);
        });

    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Recent Update';
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

    return (
        <GuestLayout>
            <Head title="Press Releases & Maritime News | PT. ABB" />

            <div className="space-y-2">

                {/* 1. HERO BANNER SECTION (FULL-WIDTH FEATURED IMAGE HERO WITH CARD-STYLE READ LINK ON BOTTOM-LEFT) */}
                <motion.section
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative rounded-[8px] overflow-hidden border border-[#E5E7EB] min-h-[450px] lg:min-h-[650px] bg-[#141B2C] group shadow-xs flex items-end"
                >
                    {activeHeadline ? (
                        <>
                            {/* Background Image Slideshow with 7s Rotation */}
                            <AnimatePresence initial={false}>
                                <motion.div
                                    key={activeHeadline.id || currentHeroIdx}
                                    initial={{ opacity: 0, scale: 1.03 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <img
                                        src={resolveArticleImage(activeHeadline)}
                                        alt={activeHeadline.title || "Featured Headline News"}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            e.currentTarget.src = '/images/news/top.jpg';
                                        }}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Dark Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                            {/* Hero Overlay Content */}
                            <div className="relative z-10 w-full p-6 sm:p-8 lg:p-10 text-white flex flex-col gap-3">
                                {/* Metadata & Category Tag */}
                                <motion.div
                                    key={`cat-${activeHeadline.id || currentHeroIdx}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-wrap items-center gap-3 text-xs font-['JetBrains_Mono'] text-white/90 uppercase font-bold tracking-wide"
                                >
                                    <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-[4px] border border-white/20">
                                        <Tag className="w-3.5 h-3.5 text-white stroke-[2]" />
                                        {activeHeadline.category?.name || activeHeadline.category_name || "Headline Story"}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-white/75">
                                        <Calendar className="w-3.5 h-3.5 text-[#3F96DD]" />
                                        {formatDate(activeHeadline.publish_date || activeHeadline.created_at)}
                                    </span>
                                    {activeHeadline.author && (
                                        <span className="flex items-center gap-1.5 text-white/75">
                                            <User className="w-3.5 h-3.5 text-[#3F96DD]" />
                                            {activeHeadline.author}
                                        </span>
                                    )}
                                </motion.div>

                                {/* Headline Title */}
                                <motion.h2
                                    key={`title-${activeHeadline.id || currentHeroIdx}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                    className="font-['Hanken_Grotesk'] font-bold text-[24px] sm:text-[32px] lg:text-[38px] text-white transition-colors leading-[1.18] tracking-tight cursor-pointer line-clamp-2 max-w-4xl hover:text-[#3F96DD]"
                                >
                                    <Link href={`/news/${activeHeadline.slug || activeHeadline.id}`}>
                                        {activeHeadline.title}
                                    </Link>
                                </motion.h2>

                                {/* Bottom Row: Slide Dots Indicator Centered in Middle & Read Link on Right */}
                                <div className="relative flex items-end justify-between gap-4">
                                    {/* Slide Dots Indicator (Centered in Middle) */}
                                    {featuredNewsList.length > 1 && (
                                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                                            {featuredNewsList.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setCurrentHeroIdx(idx)}
                                                    className={`h-2 rounded-full transition-[colors,shadow,opacity,transform] duration-300 cursor-pointer ${
                                                        currentHeroIdx % featuredNewsList.length === idx 
                                                            ? 'w-8 bg-white' 
                                                            : 'w-2 bg-white/40 hover:bg-white/70'
                                                    }`}
                                                    title={`Go to headline ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Read Button (Right Side) */}
                                    <Link
                                        href={`/news/${activeHeadline.slug || activeHeadline.id}`}
                                        className="group/btn font-['Hanken_Grotesk'] font-bold text-[15px] lg:text-[30px] text-white flex items-center gap-1.5 cursor-pointer ml-auto"
                                    >
                                        <span>Read</span>
                                        <span className="transition-transform duration-200 group-hover/btn:translate-x-1.5">&rarr;</span>
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="relative z-10 text-center p-10 max-w-3xl mx-auto w-full">
                            <div className="inline-block px-3 py-1 bg-[#00629D] text-white rounded-[4px] font-['JetBrains_Mono'] text-[11px] font-bold uppercase tracking-wider mb-3">
                                CORPORATE MEDIA
                            </div>
                            <h1 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] text-white tracking-tight leading-[1.12] mb-3">
                                News &amp; Maritime Insights
                            </h1>
                            <p className="font-['Hanken_Grotesk'] font-medium text-[16px] sm:text-[17px] text-white/90 leading-relaxed">
                                Official press releases, operational updates, and industry insights from PT. Pelayaran Pelangi Tunggal Ikan (ABB).
                            </p>
                        </div>
                    )}
                </motion.section>

                {/* 2. NEWS ARTICLES INVENTORY & FILTER SECTION (EXACTLY MATCHING FLEETS.JSX FILTER CONTROL STRUCTURE) */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 sm:p-10 lg:p-14"
                >
                    {/* Header + Search & Filter Popup Controls */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <div className="font-['JetBrains_Mono'] font-bold text-[12px] uppercase text-[#00629D] tracking-wider mb-2">
                                MEDIA &amp; PRESS
                            </div>
                            <h2 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[36px] lg:text-[44px] leading-[1.12] text-[#141B2C] tracking-tight">
                                Explore Published Articles
                            </h2>
                        </div>

                        {/* Search Input Box & Filter Popover Button */}
                        <div className="shrink-0 flex items-center gap-2 relative">
                            {/* Search Input Box */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search article title, keywords..."
                                    className="w-60 sm:w-72 lg:w-80 px-4 py-2 text-[13px] font-['JetBrains_Mono'] text-[#141B2C] placeholder-[#9CA3AF] bg-white border border-[#E5E7EB] rounded-[4px] focus:outline-none focus:border-[#00629D] focus:ring-1 focus:ring-[#00629D] transition-colors"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Red Search Button */}
                            <button
                                type="button"
                                className="bg-gradient-to-r from-[#D93A2B] to-[#FF5542] hover:shadow-[0_4px_14px_rgba(217,58,43,0.35)] active:scale-[0.97] text-white p-3 rounded-[4px] transition-[colors,shadow,opacity,transform] flex items-center justify-center shadow-sm cursor-pointer"
                                title="Search"
                            >
                                <Search className="w-4 h-4 stroke-[2.5]" />
                            </button>

                            {/* Blue Filter Button & Popover */}
                            <div className="relative" ref={filterMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                                    className={`relative bg-gradient-to-r from-[#00629D] to-[#3F96DD] hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] active:scale-[0.97] text-white p-3 rounded-[4px] transition-[colors,shadow,opacity,transform] flex items-center justify-center shadow-sm cursor-pointer ${activeFiltersCount > 0 ? 'ring-2 ring-offset-1 ring-[#00629D]' : ''}`}
                                    title="Filter Articles"
                                >
                                    <Filter className="w-4 h-4 fill-white stroke-none" />
                                    {activeFiltersCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D93A2B] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown Popover Menu */}
                                {isFilterMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-[#E5E7EB] rounded-[8px] shadow-xl z-30 p-4 font-['Hanken_Grotesk'] space-y-4">
                                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                                            <span className="text-[12px] font-['JetBrains_Mono'] font-bold text-[#141B2C] uppercase tracking-wider">
                                                Filter Articles
                                            </span>
                                            {activeFiltersCount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCategories([]);
                                                        setSortOrder('latest');
                                                        setOpenSubDropdown(null);
                                                    }}
                                                    className="text-[11px] font-['JetBrains_Mono'] text-[#D93A2B] hover:underline font-semibold cursor-pointer"
                                                >
                                                    Reset All ({activeFiltersCount})
                                                </button>
                                            )}
                                        </div>

                                        {/* 1. News Category Dropdown with Checkboxes Inside (from NewsCategory model) */}
                                        <div>
                                            <label className="block text-[11px] font-['JetBrains_Mono'] font-bold text-[#8AAFC8] uppercase mb-1.5">
                                                News Category {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                                            </label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenSubDropdown(openSubDropdown === 'category' ? null : 'category')}
                                                    className="w-full flex items-center justify-between border border-[#E5E7EB] rounded-[4px] px-3 py-2 text-[13px] bg-white text-[#141B2C] hover:border-[#00629D] transition-colors cursor-pointer"
                                                >
                                                    <span className="truncate font-medium text-left">
                                                        {selectedCategories.length === 0
                                                            ? "All Categories"
                                                            : `${selectedCategories.length} Selected`}
                                                    </span>
                                                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openSubDropdown === 'category' ? 'rotate-180' : ''}`} />
                                                </button>

                                                {openSubDropdown === 'category' && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-[6px] shadow-lg z-40 p-2 max-h-48 overflow-y-auto space-y-1">
                                                        <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs font-bold border-b border-slate-100 pb-1.5 mb-1 text-[#00629D]">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCategories.length === 0}
                                                                onChange={() => setSelectedCategories([])}
                                                                className="w-3.5 h-3.5 rounded text-[#00629D] focus:ring-[#00629D] border-slate-300 cursor-pointer"
                                                            />
                                                            <span>All Categories</span>
                                                        </label>
                                                        {categoryList.map((catName) => {
                                                            const isChecked = selectedCategories.includes(catName);
                                                            return (
                                                                <label
                                                                    key={catName}
                                                                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 cursor-pointer text-xs text-[#141B2C] transition-colors"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => {
                                                                            if (isChecked) {
                                                                                setSelectedCategories(prev => prev.filter(c => c !== catName));
                                                                            } else {
                                                                                setSelectedCategories(prev => [...prev, catName]);
                                                                            }
                                                                        }}
                                                                        className="w-3.5 h-3.5 rounded text-[#00629D] focus:ring-[#00629D] border-slate-300 cursor-pointer"
                                                                    />
                                                                    <span className={isChecked ? "font-bold text-[#00629D]" : ""}>{catName}</span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 2. Regular Dropdown for Sort Order */}
                                        <div>
                                            <label className="block text-[11px] font-['JetBrains_Mono'] font-bold text-[#8AAFC8] uppercase mb-1.5">
                                                Sort Order
                                            </label>
                                            <select
                                                value={sortOrder}
                                                onChange={(e) => setSortOrder(e.target.value)}
                                                className="w-full border border-[#E5E7EB] rounded-[4px] px-3 py-2 text-[13px] text-[#141B2C] focus:outline-none focus:border-[#00629D] cursor-pointer bg-white"
                                            >
                                                <option value="latest">Latest Articles First</option>
                                                <option value="oldest">Oldest Articles First</option>
                                                <option value="views">Most Viewed First</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Articles Grid */}
                    {filteredNews.length === 0 ? (
                        <div className="py-14 text-center bg-[#F9FAFB] rounded-[8px] border border-dashed border-[#E5E7EB]">
                            <Newspaper className="w-10 h-10 text-slate-400 mx-auto mb-3 stroke-[1.5]" />
                            <h3 className="font-['Hanken_Grotesk'] font-bold text-lg text-[#141B2C] mb-1">
                                No News Articles Found
                            </h3>
                            <p className="text-[14px] text-[#404750] max-w-md mx-auto mb-5 font-['Hanken_Grotesk'] leading-relaxed">
                                We couldn't find any published news articles matching your search query or active category filters.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategories([]);
                                    setSortOrder('latest');
                                    setOpenSubDropdown(null);
                                }}
                                className="px-4 py-2 bg-[#00629D] text-white text-xs font-semibold rounded-[4px] hover:bg-[#004e7e] transition-colors cursor-pointer"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-10 lg:gap-10">
                            {paginatedNews.map((article, idx) => (
                                <Link
                                    key={article.id || idx}
                                    href={`/news/${article.slug || article.id}`}
                                    className="group cursor-pointer flex flex-col justify-between"
                                >
                                    <motion.div
                                        whileHover={{ y: -3 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-col justify-between h-full"
                                    >
                                        <div>
                                            {/* Rounded Cover Image (Classy Rounded Top & Bottom) */}
                                            <div className="relative h-56 sm:h-60 rounded-[12px] overflow-hidden bg-slate-100 mb-3.5 shadow-xs">
                                                <img
                                                    src={resolveArticleImage(article)}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/images/news/top.jpg';
                                                    }}
                                                />
                                            </div>

                                            {/* Metadata Row: Date & Category Tag */}
                                            <div className="flex flex-wrap items-center gap-3.5 text-[13px] text-[#404750] font-['Hanken_Grotesk'] font-medium mb-2.5">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4 text-[#404750] stroke-[2]" />
                                                    {formatDate(article.publish_date || article.created_at)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Tag className="w-4 h-4 text-[#404750] stroke-[2]" />
                                                    {article.category?.name || article.category_name || 'General'}
                                                </span>
                                            </div>

                                            {/* Classy Headline Title */}
                                            <h3 className="font-['Hanken_Grotesk'] font-bold text-[20px] sm:text-[22px] text-[#141B2C] leading-[1.25] tracking-tight group-hover:text-[#00629D] transition-colors">
                                                {article.title}
                                            </h3>
                                        </div>

                                        {/* Bottom Right "Read ->" Link */}
                                        <div className="mt-4 flex items-center justify-end">
                                            <span className="font-['Hanken_Grotesk'] font-bold text-[14px] text-[#141B2C] group-hover:text-[#00629D] transition-colors flex items-center gap-1">
                                                <span>Read</span>
                                                <span className="transition-transform duration-200 group-hover:translate-x-1.5">&rarr;</span>
                                            </span>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 font-['Hanken_Grotesk']">
                            <div className="text-[13px] text-[#404750] font-['JetBrains_Mono']">
                                Showing <span className="font-bold text-[#141B2C]">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-[#141B2C]">{Math.min(currentPage * itemsPerPage, filteredNews.length)}</span> of <span className="font-bold text-[#141B2C]">{filteredNews.length}</span> articles
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] text-[14px] font-bold flex items-center justify-center bg-white hover:bg-slate-50 text-[#141B2C] border border-[#E5E7EB] disabled:opacity-40 disabled:cursor-not-allowed transition-[colors,shadow,opacity,transform] cursor-pointer"
                                    title="Previous Page"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] text-[14px] font-bold flex items-center justify-center transition-[colors,shadow,opacity,transform] cursor-pointer ${currentPage === page
                                                ? 'bg-gradient-to-r from-[#D93A2B] to-[#FF5542] text-white shadow-xs border border-transparent'
                                                : 'bg-white hover:bg-slate-50 text-[#141B2C] border border-[#E5E7EB]'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-[6px] text-[14px] font-bold flex items-center justify-center bg-white hover:bg-slate-50 text-[#141B2C] border border-[#E5E7EB] disabled:opacity-40 disabled:cursor-not-allowed transition-[colors,shadow,opacity,transform] cursor-pointer"
                                    title="Next Page"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.section>
            </div>

        </GuestLayout>
    );
}
