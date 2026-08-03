import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Newspaper, ArrowLeft, CheckCircle2, Image as ImageIcon, Calendar, User, FileText, Send } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function Edit({ article = null, categories = [], authors = [] }) {
    const isEditing = !!article;

    const getNewsImage = (item) => {
        if (!item || !item.featured_image) return null;
        let img = item.featured_image;
        if (img.startsWith('http://') || img.startsWith('https://')) return img;
        if (img.startsWith('/images/') || img.startsWith('/storage/')) return img;
        if (img.startsWith('assets/images/news/')) return `/${img.replace('assets/images/news/', 'images/news/')}`;
        if (img.startsWith('../assets/images/news/')) return `/${img.replace('../assets/images/news/', 'images/news/')}`;
        if (img.startsWith('images/') || img.startsWith('storage/')) return `/${img}`;
        const filename = img.split('/').pop();
        return `/images/news/${filename}`;
    };

    const [previewImage, setPreviewImage] = useState(getNewsImage(article));
    const [addingAuthor, setAddingAuthor] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        _method: isEditing ? 'PUT' : 'POST',
        title: article?.title || '',
        meta_title: article?.meta_title || article?.title || '',
        category_id: article?.category_id || (categories[0]?.id || ''),
        category_name: article?.category?.name || article?.category || 'Company News',
        published_at: article?.published_at || article?.publish_date || new Date().toISOString().split('T')[0],
        status: article?.status || 'published',
        author: article?.author || 'ABB Media Team',
        excerpt: article?.excerpt || '',
        content: article?.content || '',
        featured_image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const targetUrl = isEditing ? route('news.update', article.id) : route('news.store');
        post(targetUrl);
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Newspaper className="w-3.5 h-3.5" /> PUBLIC RELATIONS & MEDIA
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            {isEditing ? `Edit Article: ${article.title}` : 'Publish New Press Release'}
                        </h2>
                    </div>

                    <Link
                        href={route('news.index')}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#404750] bg-white border border-[#E5E7EB] px-4 py-2.5 rounded-[8px] hover:bg-slate-50 hover:text-[#141B2C] transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to News Overview
                    </Link>
                </div>
            }
        >
            <Head title={`${isEditing ? 'Edit Article' : 'Create Article'} — PT. ABB`} />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
                    
                    <form onSubmit={handleSubmit}>
                        {/* 70 / 30 Two-Column Split Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            
                            {/* LEFT COLUMN (70% - lg:col-span-8) - ARTICLE CONTENT ONLY */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-sm p-6 sm:p-8 space-y-6 h-[930px]">
                                    
                                    <div className="border-b border-[#E5E7EB] pb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-[#00629D]" />
                                            <h3 className="font-bold text-lg text-[#141B2C]">
                                                Article Content & Body
                                            </h3>
                                        </div>
                                        <span className="font-['JetBrains_Mono'] text-xs text-[#8AAFC8] font-bold">
                                            {isEditing ? `ID: #${article.id}` : 'NEW ARTICLE'}
                                        </span>
                                    </div>

                                    {/* Article Title */}
                                    <div>
                                        <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                            Article Title <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setData(prev => ({
                                                    ...prev,
                                                    title: val,
                                                    meta_title: val
                                                }));
                                            }}
                                            placeholder="e.g. Annual Medical Check-Up 2026 at TZU CHI Hospital"
                                            required
                                            className="w-full border border-[#E5E7EB] rounded-[8px] text-base p-3.5 focus:border-[#00629D] focus:ring-[#00629D] font-bold text-[#141B2C]"
                                        />
                                        {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                                    </div>

                                    {/* Short Excerpt */}
                                    <div>
                                        <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                            Short Excerpt / Summary Preview
                                        </label>
                                        <textarea
                                            value={data.excerpt}
                                            onChange={(e) => setData('excerpt', e.target.value)}
                                            rows={2}
                                            placeholder="Brief summary displayed on news cards, search results, and social previews..."
                                            className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-3 focus:border-[#00629D] focus:ring-[#00629D] leading-relaxed"
                                        />
                                    </div>

                                    {/* Article Content Editor (ReactQuill 70% main canvas) */}
                                    <div className="max-h-[80%]">
                                        <label className="block text-xs font-bold text-[#141B2C] mb-1.5">
                                            Article Content Body <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="bg-white  overflow-hidden">
                                            <ReactQuill
                                                theme="snow"
                                                value={data.content}
                                                onChange={(val) => setData('content', val)}
                                                modules={modules}
                                                placeholder="Write your comprehensive press release or news article content here..."
                                                className="h-[500px] mb-14 text-sm font-['Hanken_Grotesk']"
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* RIGHT COLUMN (30% - lg:col-span-4) - PUBLISH ACTIONS, CATEGORY & FEATURED IMAGE */}
                            <div className="lg:col-span-4 space-y-6">
                                
                                {/* 1. Publish & Status Action Box */}
                                <div className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-sm p-6 space-y-4">
                                    <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
                                        <Send className="w-4 h-4 text-[#00629D]" />
                                        <h4 className="font-bold text-sm text-[#141B2C]">Publishing Options</h4>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#141B2C] mb-1">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D] font-medium"
                                        >
                                            <option value="published">Published</option>
                                            <option value="draft">Draft</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#141B2C] mb-1">Publish Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={data.published_at}
                                                onChange={(e) => setData('published_at', e.target.value)}
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D] font-['JetBrains_Mono']"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2 flex flex-col gap-2.5">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white text-xs font-semibold rounded-[8px] hover:shadow-md transition-[colors,shadow,opacity,transform] cursor-pointer"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {isEditing ? 'Save Article Changes' : 'Publish Article'}
                                        </button>

                                        <Link
                                            href={route('news.index')}
                                            className="w-full text-center py-2.5 bg-[#F5F5F5] hover:bg-slate-200 text-[#404750] text-xs font-semibold rounded-[8px] transition-colors"
                                        >
                                            Cancel
                                        </Link>
                                    </div>
                                </div>

                                {/* 2. Category & Author Settings */}
                                <div className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-sm p-6 space-y-4">
                                    <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
                                        <User className="w-4 h-4 text-[#00629D]" />
                                        <h4 className="font-bold text-sm text-[#141B2C]">Category & Author</h4>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#141B2C] mb-1">Category</label>
                                        <select
                                            value={data.category_name}
                                            onChange={(e) => setData('category_name', e.target.value)}
                                            className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D] font-medium"
                                        >
                                            <option value="Company News">Company News</option>
                                            <option value="Office Events">Office Events</option>
                                            <option value="CSR & Sustainability">CSR & Sustainability</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#141B2C] mb-1">Author / Byline</label>
                                        {addingAuthor ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={data.author}
                                                    onChange={(e) => setData('author', e.target.value)}
                                                    placeholder="Type new author name"
                                                    className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D]"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAddingAuthor(false);
                                                            setData('author', article?.author || 'ABB Media Team');
                                                        }}
                                                        className="text-[11px] font-semibold text-[#00629D] hover:underline"
                                                    >
                                                        Cancel
                                                    </button>
                                                    {data.author && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setAddingAuthor(false);
                                                            }}
                                                            className="text-[11px] font-semibold text-emerald-600 hover:underline"
                                                        >
                                                            Use "{data.author}"
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <select
                                                value={data.author}
                                                onChange={(e) => {
                                                    if (e.target.value === '__add_new__') {
                                                        setAddingAuthor(true);
                                                        setData('author', '');
                                                    } else {
                                                        setData('author', e.target.value);
                                                    }
                                                }}
                                                className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 focus:border-[#00629D] focus:ring-[#00629D] font-medium"
                                            >
                                                {!authors.includes(data.author) && (
                                                    <option value={data.author}>{data.author}</option>
                                                )}
                                                {authors.map((name) => (
                                                    <option key={name} value={name}>{name}</option>
                                                ))}
                                                <option value="__add_new__">+ Add new author...</option>
                                            </select>
                                        )}
                                    </div>
                                </div>

                                {/* 3. Featured Image Upload Box */}
                                <div className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-sm p-6 space-y-4">
                                    <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
                                        <ImageIcon className="w-4 h-4 text-[#00629D]" />
                                        <h4 className="font-bold text-sm text-[#141B2C]">Featured Header Image</h4>
                                    </div>

                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setData('featured_image', file);
                                                    setPreviewImage(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="w-full border border-[#E5E7EB] rounded-[8px] text-xs p-2.5 bg-[#F5F5F5] file:mr-3 file:py-1 file:px-2.5 file:rounded-[6px] file:border-0 file:text-xs file:font-semibold file:bg-[#00629D] file:text-white hover:file:bg-[#3F96DD] cursor-pointer"
                                        />
                                        <p className="text-[11px] text-[#8AAFC8] mt-1.5">PNG, JPG, or WEBP, max 5MB</p>
                                    </div>

                                    {previewImage ? (
                                        <div className="mt-3">
                                            <span className="text-[11px] font-bold text-[#141B2C] block mb-1">Image Preview:</span>
                                            <div className="h-44 w-full rounded-[8px] border border-[#E5E7EB] overflow-hidden bg-[#141B2C]">
                                                <img
                                                    src={previewImage}
                                                    alt="Article Featured Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-32 w-full rounded-[8px] border border-dashed border-[#E5E7EB] flex flex-col items-center justify-center text-slate-400 bg-[#F5F5F5]">
                                            <ImageIcon className="w-8 h-8 mb-1 text-slate-300" />
                                            <span className="text-xs">No image selected</span>
                                        </div>
                                    )}
                                </div>

                            </div>

                        </div>
                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
