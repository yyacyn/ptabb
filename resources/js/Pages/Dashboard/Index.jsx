import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Ship, 
    Briefcase, 
    Users, 
    Newspaper, 
    Bell, 
    Building2, 
    ArrowRight, 
    Shield, 
    Anchor,
    Compass,
    ExternalLink
} from 'lucide-react';

export default function Index({ 
    fleetsCount = 15, 
    newsCount = 12, 
    clientsCount = 30, 
    careersCount = 12,
    notificationsCount = 2
}) {
    const authUser = usePage().props.auth.user;

    const managementPages = [
        {
            id: 'fleets',
            title: 'Fleet Specs & Voyage Data',
            category: 'Operations',
            description: 'Manage 15+ vessels, AIS satellite coordinates, DWT specs, and PDF particulars.',
            icon: Ship,
            count: `${fleetsCount} Active Vessels`,
            route: route('fleets.index'),
            badge: 'Fleet & Specs'
        },
        {
            id: 'careers',
            title: 'Careers & Recruitment',
            category: 'Human Resources',
            description: 'Manage Corporate (Darat) & Vessel Crew (Laut) job openings and candidate applications.',
            icon: Briefcase,
            count: `${careersCount} Openings`,
            route: route('careers.index'),
            badge: 'Jobs (Darat & Laut)'
        },
        {
            id: 'news',
            title: 'News & Press Releases',
            category: 'Public Relations',
            description: 'Publish company articles, office event coverage, and CSR sustainability projects.',
            icon: Newspaper,
            count: `${newsCount} Articles`,
            route: route('news.index'),
            badge: 'PR & Media'
        },
        {
            id: 'clients',
            title: 'Clients & Partners',
            category: 'Public Relations',
            description: 'Manage domestic and international partner logos, testimonials, and corporate profiles.',
            icon: Building2,
            count: `${clientsCount}+ Partners`,
            route: route('clients.index'),
            badge: 'Partnerships'
        },
        {
            id: 'notifications',
            title: 'Sitewide Pop-ups & Warnings',
            category: 'System Alerts',
            description: 'Control home/career page pop-up banners, active warnings, and emergency alerts.',
            icon: Bell,
            count: `${notificationsCount} Active Alerts`,
            route: route('notifications.index'),
            badge: 'Banners'
        },
        {
            id: 'waypoints',
            title: 'Voyage Waypoints & Telemetry',
            category: 'Navigation',
            description: 'Manage AIS satellite positioning, GPS waypoints, and active vessel route telemetry.',
            icon: Compass,
            count: 'Live AIS Feed',
            route: route('voyage-waypoints.index'),
            badge: 'Telemetry'
        }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-['Hanken_Grotesk']">
                    <div>
                        <div className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#00629D] uppercase tracking-wider mb-1 flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5" /> ADMINISTRATIVE PORTAL
                        </div>
                        <h2 className="text-2xl font-bold text-[#141B2C] tracking-tight">
                            PT ABB Company Profile & Dashboard
                        </h2>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-[#141B2C] hover:bg-[#00629D] text-white text-xs font-semibold px-4 py-2.5 rounded-[8px] transition-colors self-start md:self-auto"
                    >
                        View Public Website
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard — PT. ABB" />

            <div className="py-8 bg-[#F5F5F5] min-h-[calc(100vh-120px)] font-['Hanken_Grotesk'] text-[#141B2C]">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Welcome Hero Banner */}
                    <div className="bg-[#141B2C] text-white rounded-[10px] p-6 sm:p-8 relative overflow-hidden shadow-lg border border-white/10">
                        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-gradient-to-l from-[#3F96DD] to-transparent pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2 font-['JetBrains_Mono'] text-xs font-bold text-[#8AAFC8] uppercase">
                                    <span>PORTAL OVERVIEW</span>
                                    <span>•</span>
                                    <span className="text-emerald-400">ONLINE</span>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                                    Welcome back, {authUser.name}
                                </h3>
                                <p className="text-[#8AAFC8] text-sm max-w-[620px] leading-relaxed">
                                    Manage PT. ABB’s digital ecosystem. Use the top navigation bar or the quick management cards below to access dedicated management modules.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Telemetry KPI Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Active Vessels", value: `${fleetsCount}`, sub: "Fleet Specs & AIS", icon: Ship, color: "text-[#00629D]" },
                            { label: "Job Vacancies", value: `${careersCount}`, sub: "Darat & Laut", icon: Briefcase, color: "text-[#3F96DD]" },
                            { label: "Pop-up Banners", value: `${notificationsCount}`, sub: "Active Alerts", icon: Bell, color: "text-amber-500" },
                            { label: "Client Partners", value: `${clientsCount}+`, sub: "Domestic & Global", icon: Building2, color: "text-emerald-500" }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white rounded-[8px] p-5 border border-[#E5E7EB] shadow-sm flex items-center justify-between">
                                <div>
                                    <div className="font-['JetBrains_Mono'] text-xs text-[#404750] uppercase font-medium">{stat.label}</div>
                                    <div className="text-2xl font-bold font-['JetBrains_Mono'] text-[#141B2C] mt-1">{stat.value}</div>
                                    <div className="text-[11px] text-[#8AAFC8] mt-0.5">{stat.sub}</div>
                                </div>
                                <div className={`p-3 rounded-[8px] bg-[#F5F5F5] ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dedicated Management Modules Navigation */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="font-['JetBrains_Mono'] text-xs font-bold text-[#00629D] uppercase tracking-wider">
                                    ADMINISTRATION
                                </div>
                                <h3 className="text-xl font-bold text-[#141B2C] tracking-tight">
                                    Management Pages
                                </h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {managementPages.map((page) => {
                                const IconComponent = page.icon;
                                return (
                                    <div 
                                        key={page.id}
                                        className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 shadow-sm flex flex-col justify-between hover:border-[#00629D] hover:shadow-[0_4px_20px_rgba(0,98,157,0.15)] transition-all duration-200 group"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-10 h-10 rounded-[8px] bg-gradient-to-r from-[#00629D] to-[#3F96DD] flex items-center justify-center text-white shadow-sm">
                                                    <IconComponent className="w-5 h-5" />
                                                </div>
                                                <span className="font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider bg-[#F5F5F5] text-[#00629D] border border-[#E5E7EB] px-2.5 py-1 rounded-[4px]">
                                                    {page.badge}
                                                </span>
                                            </div>

                                            <div className="font-['JetBrains_Mono'] text-[11px] text-[#8AAFC8] uppercase font-bold mb-1">
                                                {page.category}
                                            </div>

                                            <h4 className="text-lg font-bold text-[#141B2C] group-hover:text-[#00629D] transition-colors leading-tight mb-2">
                                                {page.title}
                                            </h4>

                                            <p className="text-xs text-[#404750] leading-relaxed mb-4">
                                                {page.description}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                                            <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#141B2C]">
                                                {page.count}
                                            </span>
                                            <Link
                                                href={page.route}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#00629D] group-hover:translate-x-0.5 transition-transform"
                                            >
                                                Go to Page
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
