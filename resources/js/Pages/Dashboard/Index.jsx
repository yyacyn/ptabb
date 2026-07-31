import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Mail,
    Briefcase,
    Newspaper,
    Ship,
    Globe,
    Bell,
    Users,
    ArrowRight
} from 'lucide-react';

export default function Index({
    fleetsCount = 0,
    newsCount = 0,
    clientsCount = 0,
    careersCount = 0,
    notificationsCount = 0,
    unreadMessagesCount = 0,
    olderUnreadCount = 0,
    applicationsCount = 0,
    draftsCount = 0,
    activeBannersCount = 0,
    recentActivities = []
}) {
    const pageProps = usePage().props;
    const authUser = pageProps.auth?.user || {};
    const userRole = authUser.role || 'super_admin';
    const userName = authUser.name ? authUser.name.split(' ')[0] : 'Admin';

    // Format currentDate dynamically like "Monday, 28 Jul 2026"
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const safeRoute = (routeName, fallback = '#') => {
        try {
            return route(routeName);
        } catch (e) {
            return fallback;
        }
    };

    const getDotColor = (color) => {
        switch (color) {
            case 'rose':
                return 'bg-rose-500';
            case 'sky':
                return 'bg-sky-500';
            case 'emerald':
                return 'bg-emerald-500';
            case 'amber':
                return 'bg-amber-500';
            default:
                return 'bg-[#00629D]';
        }
    };

    // Role-Based UI Display Logic
    const canManageFleet = userRole === 'super_admin';
    const canManageCareers = ['super_admin', 'hr_admin', 'crew_admin'].includes(userRole);
    const canManageNews = ['super_admin', 'pr_admin'].includes(userRole);
    const canManageClients = ['super_admin', 'pr_admin'].includes(userRole);
    const canManageNotifications = ['super_admin', 'hr_admin'].includes(userRole);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-['Hanken_Grotesk']">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141B2C] flex items-center gap-2">
                            Hello, {userName}
                        </h1>
                        <p className="font-['JetBrains_Mono'] text-xs font-medium text-[#8AAFC8] mt-1">
                            {formattedDate} &bull; <span className="uppercase text-[#00629D] font-bold">{userRole.replace('_', ' ')}</span>
                        </p>
                    </div>

                    <Link
                        href="/"
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#141B2C] hover:bg-[#00629D] text-white rounded-[8px] text-xs font-semibold transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
                    >
                        <Globe className="w-4 h-4 text-white/80" />
                        View Public Website
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard — PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-6">

                    {/* Top Stats Cards Grid (Scoped by Role) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                        {/* Stat Card 1: Unread Messages (Visible to all admins) */}
                        <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 flex flex-col justify-between hover:border-[#00629D] hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <span className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider text-[#404750] flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-[2px] bg-rose-500 inline-block" />
                                    UNREAD MESSAGES
                                </span>
                                <div className="p-2 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                                    <Mail className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-5">
                                <div className="text-4xl font-extrabold text-rose-600">
                                    {unreadMessagesCount}
                                </div>
                                <p className="text-xs text-[#8AAFC8] mt-1.5 font-['JetBrains_Mono'] font-semibold">
                                    {olderUnreadCount} older than 48h
                                </p>
                            </div>
                        </div>

                        {/* Stat Card 2: Open Vacancies (Visible to Super, HR, Crew Admins) */}
                        {canManageCareers ? (
                            <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 flex flex-col justify-between hover:border-[#00629D] hover:shadow-md transition-all">
                                <div className="flex items-center justify-between">
                                    <span className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider text-[#404750] flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-[2px] bg-amber-500 inline-block" />
                                        OPEN VACANCIES
                                    </span>
                                    <div className="p-2 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <div className="text-4xl font-extrabold text-amber-600">
                                        {applicationsCount}
                                    </div>
                                    <p className="text-xs text-[#8AAFC8] mt-1.5 font-['JetBrains_Mono'] font-semibold">
                                        {userRole === 'hr_admin' ? 'Corporate positions' : userRole === 'crew_admin' ? 'Crew positions' : 'Active job openings'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 flex flex-col justify-between hover:border-[#00629D] hover:shadow-md transition-all">
                                <div className="flex items-center justify-between">
                                    <span className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider text-[#404750] flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-[2px] bg-blue-500 inline-block" />
                                        CLIENT PARTNERS
                                    </span>
                                    <div className="p-2 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                                        <Users className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <div className="text-4xl font-extrabold text-blue-600">
                                        {clientsCount}
                                    </div>
                                    <p className="text-xs text-[#8AAFC8] mt-1.5 font-['JetBrains_Mono'] font-semibold">
                                        Partner companies
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Stat Card 3: Drafts / News (Visible to Super, PR Admins) */}
                        {canManageNews ? (
                            <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 flex flex-col justify-between hover:border-[#00629D] hover:shadow-md transition-all">
                                <div className="flex items-center justify-between">
                                    <span className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider text-[#404750] flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-[2px] bg-slate-400 inline-block" />
                                        DRAFTS UNPUBLISHED
                                    </span>
                                    <div className="p-2 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                        <Newspaper className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <div className="text-4xl font-extrabold text-[#141B2C]">
                                        {draftsCount}
                                    </div>
                                    <p className="text-xs text-[#8AAFC8] mt-1.5 font-['JetBrains_Mono'] font-semibold">
                                        News articles ({newsCount} total)
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 flex flex-col justify-between hover:border-[#00629D] hover:shadow-md transition-all">
                                <div className="flex items-center justify-between">
                                    <span className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider text-[#404750] flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-[2px] bg-indigo-500 inline-block" />
                                        SITE NOTIFICATIONS
                                    </span>
                                    <div className="p-2 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200">
                                        <Bell className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <div className="text-4xl font-extrabold text-indigo-600">
                                        {notificationsCount}
                                    </div>
                                    <p className="text-xs text-[#8AAFC8] mt-1.5 font-['JetBrains_Mono'] font-semibold">
                                        {activeBannersCount} active banners
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Stat Card 4: Active Vessels (Visible to all, managed by Super Admin) */}
                        <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 flex flex-col justify-between hover:border-[#00629D] hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <span className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider text-[#404750] flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 inline-block" />
                                    ACTIVE VESSELS
                                </span>
                                <div className="p-2 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
                                    <Ship className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-5">
                                <div className="text-4xl font-extrabold text-emerald-600">
                                    {fleetsCount}
                                </div>
                                <p className="text-xs text-[#8AAFC8] mt-1.5 font-['JetBrains_Mono'] font-semibold">
                                    All operational
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Split Layout (Left: Alerts & Quick Actions, Right: Recent Activity) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Left Column (5 Cols) */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* ALERTS Box */}
                            <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 space-y-4 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider text-[#404750]">
                                        ALERTS
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-['JetBrains_Mono'] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                                        {unreadMessagesCount > 0 ? 'ATTENTION REQUIRED' : 'ALL CLEAR'}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {/* Alert 1: Unread Messages */}
                                    <div className="bg-rose-50 border border-rose-200 rounded-[8px] p-4 flex items-start gap-3.5">
                                        <div className="p-2 bg-rose-200 text-rose-900 rounded-md shrink-0">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-rose-900 leading-snug">
                                                {unreadMessagesCount} unread contact messages
                                            </h4>
                                            <p className="text-xs text-rose-700 mt-1 font-['JetBrains_Mono'] font-medium">
                                                {olderUnreadCount > 0 ? `${olderUnreadCount} have no reply in 48h+` : 'Awaiting response'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Alert 2: Active Banners */}
                                    {canManageNotifications && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-[8px] p-4 flex items-start gap-3.5">
                                            <div className="p-2 bg-amber-200 text-amber-900 rounded-md shrink-0">
                                                <Bell className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-amber-900 leading-snug">
                                                    {activeBannersCount > 0 ? `${activeBannersCount} Pop-up banner active` : 'No active alert banners'}
                                                </h4>
                                                <p className="text-xs text-amber-700 mt-1 font-['JetBrains_Mono'] font-medium">
                                                    {activeBannersCount > 0 ? 'BR-06 compliant (max 1/type)' : 'All pop-ups disabled'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* QUICK ACTIONS Box (Strictly Filtered by Role) */}
                            <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 space-y-3 shadow-xs">
                                <span className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider text-[#404750] block mb-2">
                                    QUICK ACTIONS
                                </span>

                                <Link
                                    href={safeRoute('contacts.index', '/dashboard/contacts')}
                                    className="group w-full border border-[#E5E7EB] hover:border-[#00629D] text-[#141B2C] hover:text-[#00629D] text-sm font-semibold px-4 py-3 rounded-[8px] flex items-center justify-between transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.18)] active:scale-[0.97] cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-white  group-hover:border-[#00629D]/30 rounded text-[#00629D] transition-colors">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <span>Review messages</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-[#8AAFC8] group-hover:text-[#00629D] group-hover:translate-x-1 group-active:translate-x-0 transition-all duration-150" />
                                </Link>

                                {canManageCareers && (
                                    <Link
                                        href={safeRoute('careers.index', '/dashboard/careers')}
                                        className="group w-full border border-[#E5E7EB] hover:border-[#00629D] text-[#141B2C] hover:text-[#00629D] text-sm font-semibold px-4 py-3 rounded-[8px] flex items-center justify-between transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.18)] active:scale-[0.97] cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-white  group-hover:border-[#00629D]/30 rounded text-[#00629D] transition-colors">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                            <span>Manage job vacancies</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-[#8AAFC8] group-hover:text-[#00629D] group-hover:translate-x-1 group-active:translate-x-0 transition-all duration-150" />
                                    </Link>
                                )}

                                {canManageNews && (
                                    <Link
                                        href={safeRoute('news.index', '/dashboard/news')}
                                        className="group w-full border border-[#E5E7EB] hover:border-[#00629D] text-[#141B2C] hover:text-[#00629D] text-sm font-semibold px-4 py-3 rounded-[8px] flex items-center justify-between transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.18)] active:scale-[0.97] cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-white  group-hover:border-[#00629D]/30 rounded text-[#00629D] transition-colors">
                                                <Newspaper className="w-4 h-4" />
                                            </div>
                                            <span>Add news article</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-[#8AAFC8] group-hover:text-[#00629D] group-hover:translate-x-1 group-active:translate-x-0 transition-all duration-150" />
                                    </Link>
                                )}

                                {canManageFleet && (
                                    <Link
                                        href={safeRoute('fleets.index', '/dashboard/fleets')}
                                        className="group w-full border border-[#E5E7EB] hover:border-[#00629D] text-[#141B2C] hover:text-[#00629D] text-sm font-semibold px-4 py-3 rounded-[8px] flex items-center justify-between transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.18)] active:scale-[0.97] cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-white  group-hover:border-[#00629D]/30 rounded text-[#00629D] transition-colors">
                                                <Ship className="w-4 h-4" />
                                            </div>
                                            <span>Manage vessel fleet</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-[#8AAFC8] group-hover:text-[#00629D] group-hover:translate-x-1 group-active:translate-x-0 transition-all duration-150" />
                                    </Link>
                                )}
                            </div>

                        </div>

                        {/* Right Column (7 Cols: RECENT ACTIVITY) */}
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 h-full flex flex-col justify-between shadow-xs">
                                <div>
                                    <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] mb-4">
                                        <span className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider text-[#404750]">
                                            RECENT ACTIVITY
                                        </span>
                                    </div>

                                    <div className="space-y-4 text-sm">
                                        {recentActivities && recentActivities.length > 0 ? (
                                            recentActivities.map((act) => (
                                                <div key={act.id} className="flex items-start gap-3.5 pb-4 border-b border-slate-100 last:border-none last:pb-0">
                                                    <span className={`w-2.5 h-2.5 rounded-full ${getDotColor(act.color)} mt-1.5 shrink-0`} />
                                                    <div>
                                                        <p className="text-[#141B2C] font-medium text-sm leading-snug">
                                                            {act.title}
                                                        </p>
                                                        <p className="text-xs text-[#8AAFC8] font-['JetBrains_Mono'] mt-1 font-medium">
                                                            {act.time} &bull; <span className="text-[#404750]">{act.department}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-xs text-[#8AAFC8] font-['JetBrains_Mono']">
                                                No recent activity recorded for your role scope.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
