import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import {
    LayoutDashboard,
    Ship,
    Newspaper,
    Briefcase,
    Users,
    Bell,
    Navigation,
    Mail,
    LogOut,
    Menu,
    X,
    User as UserIcon,
    ChevronRight,
    Flag,
    Building,
    MapPin
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const pageProps = usePage().props;
    const authProp = pageProps.auth;
    const user = authProp?.user;
    const flash = pageProps.flash || {};

    useEffect(() => {
        if (!user) {
            window.location.href = route('login');
        }
    }, [authProp]);

    // Prevent stale BFCache back-button navigation after logout
    useEffect(() => {
        const handlePageShow = (event) => {
            if (event.persisted) {
                window.location.reload();
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    // Global Sonner Toast listener for Laravel Inertia flash messages
    useEffect(() => {
        if (flash.success || flash.message) {
            toast.success(flash.success || flash.message);
        } else if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash.success, flash.message, flash.error]);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!user) {
        return null;
    }

    const userRole = user.role || 'super_admin';

    const canAccess = (module) => {
        if (userRole === 'super_admin') return true;
        if (userRole === 'hr_admin') return ['dashboard', 'careers', 'notifications', 'milestones', 'contacts'].includes(module);
        if (userRole === 'crew_admin') return ['dashboard', 'careers', 'contacts'].includes(module);
        if (userRole === 'pr_admin') return ['dashboard', 'news', 'clients', 'milestones'].includes(module);
        return false;
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'super_admin':
                return { label: 'Super Admin', bg: 'bg-[#00629D]', text: 'text-white' };
            case 'hr_admin':
                return { label: 'HR Admin', bg: 'bg-emerald-600', text: 'text-white' };
            case 'crew_admin':
                return { label: 'Crew Admin', bg: 'bg-indigo-600', text: 'text-white' };
            case 'pr_admin':
                return { label: 'PR Admin', bg: 'bg-amber-600', text: 'text-white' };
            default:
                return { label: 'Admin', bg: 'bg-slate-600', text: 'text-white' };
        }
    };

    const badge = getRoleBadge(userRole);

    const navItems = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, pattern: 'dashboard', module: 'dashboard' },
        { name: 'Fleet', href: route('fleets.index'), icon: Ship, pattern: 'fleets.*', module: 'fleets' },
        { name: 'Voyage Telemetry', href: route('voyage-waypoints.index'), icon: Navigation, pattern: 'voyage-waypoints.*', module: 'fleets' },
        { name: 'Company Milestones', href: route('milestones.index'), icon: Flag, pattern: 'milestones.*', module: 'milestones' },
        { name: 'News & Articles', href: route('news.index'), icon: Newspaper, pattern: 'news.*', module: 'news' },
        { name: 'Careers & Vacancies', href: route('careers.index'), icon: Briefcase, pattern: 'careers.*', module: 'careers' },
        { name: 'Client Partners', href: route('clients.index'), icon: Users, pattern: 'clients.*', module: 'clients' },
        { name: 'Pop-up Alerts', href: route('notifications.index'), icon: Bell, pattern: 'notifications.*', module: 'notifications' },
        { name: 'Contact Messages', href: route('contacts.index'), icon: Mail, pattern: 'contacts.*', module: 'contacts' },
        { name: 'System Users', href: route('users.index'), icon: UserIcon, pattern: 'users.*', module: 'users' },
        { name: 'HQ Contact Info', href: route('contact-info.index'), icon: Building, pattern: 'contact-info.*', module: 'contact_info' },
        { name: 'Branch Offices', href: route('branches.index'), icon: MapPin, pattern: 'branches.*', module: 'branches' },
    ];

    const accessibleNavItems = navItems.filter(item => canAccess(item.module));

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-['Hanken_Grotesk'] flex text-[#141B2C]">
            
            {/* Desktop Left Sidebar */}
            <aside className="w-64 bg-[#141B2C] text-white flex-col justify-between hidden md:flex shrink-0 min-h-screen border-r border-slate-800 fixed inset-y-0 left-0 z-30">
                <div>
                    {/* Sidebar Brand Header */}
                    <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
                        <Link href={route('dashboard')} className="flex items-center gap-3 group">
                            <div className="p-1.5 bg-white/10 rounded-[6px] group-hover:bg-white/20 transition-colors">
                                <ApplicationLogo className="h-7 w-auto fill-current text-white" />
                            </div>
                            <div>
                                <span className="font-['Hanken_Grotesk'] font-extrabold text-base tracking-tight block text-white leading-none">
                                    PT. ABB
                                </span>
                                <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[#8AAFC8] block mt-1">
                                    Dashboard System
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="p-4 space-y-1">
                        <div className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#8AAFC8] uppercase tracking-wider px-3 mb-3">
                            Navigation Menu
                        </div>

                        {accessibleNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = route().current(item.pattern);

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-[8px] text-xs font-semibold transition-colors group ${
                                        isActive
                                            ? 'bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white shadow-md font-bold'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                                            isActive ? 'text-white' : 'text-[#8AAFC8] group-hover:text-white'
                                        }`} />
                                        <span>{item.name}</span>
                                    </div>
                                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Bottom User & Role Section */}
                <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00629D] to-[#3F96DD] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="truncate">
                                <div className="text-xs font-bold text-white truncate">{user.name}</div>
                                <div className="text-[10px] text-[#8AAFC8] truncate font-['JetBrains_Mono']">{user.email}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase ${badge.bg} ${badge.text}`}>
                            {badge.label}
                        </span>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 px-2 py-1 rounded transition-colors font-semibold cursor-pointer"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Log Out
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile Nav Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#141B2C] text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between shadow-md">
                <Link href={route('dashboard')} className="flex items-center gap-2">
                    <ApplicationLogo className="h-6 w-auto fill-current text-white" />
                    <span className="font-bold text-sm text-white">PT. ABB</span>
                </Link>

                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-1.5 text-slate-300 hover:text-white rounded-[6px] hover:bg-slate-800 cursor-pointer"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Navigation Drawer Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex" onClick={() => setIsMobileMenuOpen(false)}>
                    <div 
                        className="w-64 bg-[#141B2C] text-white h-full flex flex-col justify-between p-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                                <div className="flex items-center gap-2">
                                    <ApplicationLogo className="h-6 w-auto fill-current text-white" />
                                    <span className="font-bold text-sm">PT. ABB Dashboard</span>
                                </div>
                                <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="space-y-1">
                                {accessibleNavItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = route().current(item.pattern);

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-xs font-semibold transition-all ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white font-bold'
                                                    : 'text-slate-300 hover:bg-slate-800'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4 text-[#8AAFC8]" />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <div className="text-xs font-bold text-white mb-1">{user.name}</div>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase mb-3 ${badge.bg} ${badge.text}`}>
                                {badge.label}
                            </span>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full flex items-center justify-center gap-2 bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-semibold py-2 rounded-[6px] transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area Right Column */}
            <div className="flex-1 md:ml-64 flex flex-col min-w-0 min-h-screen">
                
                {/* Header Title Bar */}
                {header && (
                    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-20 shadow-xs mt-12 md:mt-0">
                        <div className="mx-auto max-w-[1270px] px-4 py-4 sm:px-6">
                            {header}
                        </div>
                    </header>
                )}

                {/* Page Body */}
                <main className="flex-1">
                    {children}
                </main>
            </div>

            {/* Official Sonner Toast Container */}
            <Toaster position="bottom-right" richColors closeButton />
        </div>
    );
}
