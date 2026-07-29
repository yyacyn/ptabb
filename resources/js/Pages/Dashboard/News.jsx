import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Newspaper, Plus, Search, Calendar, Edit2, Filter, ArrowUpDown, Eye } from 'lucide-react';

export default function News({ news = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const getNewsImage = (item) => {
        if (!item || !item.featured_image) return '/images/news/top.jpg';
        let img = item.featured_image;
        if (img.startsWith('http://') || img.startsWith('https://')) return img;
        if (img.startsWith('/images/') || img.startsWith('/storage/')) return img;
        if (img.startsWith('assets/images/news/')) return `/${img.replace('assets/images/news/', 'images/news/')}`;
        if (img.startsWith('../assets/images/news/')) return `/${img.replace('../assets/images/news/', 'images/news/')}`;
        if (img.startsWith('images/') || img.startsWith('storage/')) return `/${img}`;
        const filename = img.split('/').pop();
        return `/images/news/${filename}`;
    };

    const categoriesList = [
        { label: 'All Articles', value: 'all' },
        { label: 'Company News', value: 'Company News' },
        { label: 'Office Events', value: 'Office Events' },
        { label: 'CSR & Sustainability', value: 'CSR & Sustainability' }
    ];

    const filteredNews = (news || [])
        .filter(n => {
            const cat = n.category?.name || n.category || '';
            const matchesCategory = selectedCategory === 'all' ||
                cat.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                (selectedCategory === 'Company News' && (cat === '3' || cat.includes('News'))) ||
                (selectedCategory === 'Office Events' && (cat === '4' || cat.includes('Events') || cat.includes('Dinner') || cat.includes('Outing'))) ||
                (selectedCategory === 'CSR & Sustainability' && (cat === '5' || cat.includes('CSR') || cat.includes('Green') || cat.includes('Eco')));

            const query = searchTerm.toLowerCase();
            const matchesSearch = (n.title || '').toLowerCase().includes(query) ||
                (n.excerpt || '').toLowerCase().includes(query) ||
                (n.author || '').toLowerCase().includes(query) ||
                (n.content || '').toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') {
                const dateA = new Date(a.published_at || a.publish_date || a.created_at);
                const dateB = new Date(b.published_at || b.publish_date || b.created_at);
                return dateB - dateA;
            }
            if (sortBy === 'oldest') {
                const dateA = new Date(a.published_at || a.publish_date || a.created_at);
                const dateB = new Date(b.published_at || b.publish_date || b.created_at);
                return dateA - dateB;
            }
            if (sortBy === 'title_asc') {
                return (a.title || '').localeCompare(b.title || '');
            }
            if (sortBy === 'title_desc') {
                return (b.title || '').localeCompare(a.title || '');
            }
            if (sortBy === 'views') {
                return (b.view_count || 0) - (a.view_count || 0);
            }
            return 0;
        });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Newspaper className="w-3.5 h-3.5" /> PUBLIC RELATIONS
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            News & Press Releases
                        </h2>
                    </div>

                    <Link
                        href={route('news.create')}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] hover:shadow-md transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Create Article
                    </Link>
                </div>
            }
        >
            <Head title="News Management — PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1270px] mx-auto px-4 sm:px-6 space-y-6">

                    {/* Category Tabs, Search & Sort Control Bar */}
                    <div className="bg-white rounded-[8px] p-4 border border-[#E5E7EB]  space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                            {/* Category Filter Pills */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8] font-bold uppercase mr-1 flex items-center gap-1">
                                    <Filter className="w-3 h-3" /> Category:
                                </span>
                                {categoriesList.map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setSelectedCategory(cat.value)}
                                        className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all cursor-pointer ${selectedCategory === cat.value
                                                ? 'bg-[#141B2C] text-white '
                                                : 'bg-[#F5F5F5] text-[#404750] hover:bg-slate-200'
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search & Sort Controls */}
                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 lg:w-72">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by title, author, or excerpt..."
                                        className="w-full pl-9 pr-4 py-1.5 border border-[#E5E7EB] rounded-[8px] text-xs focus:border-[#00629D] focus:ring-[#00629D]"
                                    />
                                </div>

                                <div className="flex items-center gap-1 text-xs text-[#404750] shrink-0">
                                    <ArrowUpDown className="w-3.5 h-3.5 text-[#00629D]" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="border border-[#E5E7EB] rounded-[8px] text-xs py-1.5 px-4.5 focus:border-[#00629D] focus:ring-[#00629D] font-medium"
                                    >
                                        <option value="newest">Sort: Newest First</option>
                                        <option value="oldest">Sort: Oldest First</option>
                                        <option value="title_asc">Sort: Title (A - Z)</option>
                                        <option value="title_desc">Sort: Title (Z - A)</option>
                                        <option value="views">Sort: Most Viewed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#8AAFC8] font-['JetBrains_Mono']">
                            <span>Active Filter: <strong className="text-[#00629D]">{selectedCategory === 'all' ? 'All Categories' : selectedCategory}</strong></span>
                            <span>Showing {filteredNews.length} of {(news || []).length} Articles</span>
                        </div>
                    </div>

                    {/* News Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredNews.map((item) => {
                            const imageSrc = getNewsImage(item);
                            const categoryName = item.category?.name || item.category || 'Company News';

                            return (
                                <div key={item.id} className="bg-white rounded-[8px] border border-[#E5E7EB] p-4  flex flex-col justify-between hover:border-[#00629D] hover:shadow-md transition-all group">
                                    <div>
                                        {/* Featured Image Thumbnail */}
                                        <div className="h-44 w-full bg-[#141B2C] rounded-[6px] overflow-hidden relative mb-3.5 border border-[#E5E7EB]">
                                            <img
                                                src={imageSrc}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/news/top.jpg';
                                                }}
                                            />
                                            <div className="absolute top-2 left-2 bg-[#141B2C]/80 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider border border-white/10">
                                                {categoryName}
                                            </div>
                                            {item.view_count !== undefined && (
                                                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> {item.view_count}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-['JetBrains_Mono'] text-[11px] text-[#8AAFC8] flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {item.published_at || item.publish_date || '2026-04-01'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase ${item.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                {item.status || 'published'}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-base text-[#141B2C] group-hover:text-[#00629D] transition-colors leading-snug mb-2 line-clamp-2">
                                            {item.title}
                                        </h3>

                                        {item.excerpt && (
                                            <p className="text-xs text-[#404750] line-clamp-2 leading-relaxed mb-4">
                                                {item.excerpt}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-semibold">
                                        <Link
                                            href={route('news.edit', item.id)}
                                            className="inline-flex items-center gap-1 text-[#00629D] hover:underline cursor-pointer"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit Article
                                        </Link>

                                        {item.author && (
                                            <span className="font-['JetBrains_Mono'] text-[11px] text-[#8AAFC8]">
                                                By {item.author}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
