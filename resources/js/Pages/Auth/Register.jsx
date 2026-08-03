import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { Anchor, ArrowRight, Lock, User, Mail, AtSign, Shield } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        email: '',
        role: 'super_admin',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-[#141B2C] font-['Hanken_Grotesk'] antialiased text-[#141B2C] selection:bg-[#00629D] selection:text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <Head title="Register — PT. ABB" />

            {/* Main Auth Container (Split Screen Layout matching Login.jsx) */}
            <div className="w-full max-w-[1100px] bg-white rounded-[12px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-white/10 my-auto">
                
                {/* Left Side: Brand Image & Hero Telemetry (7 Columns) */}
                <div className="lg:col-span-7 bg-[#141B2C] relative flex flex-col justify-between p-8 lg:p-12 overflow-hidden text-white min-h-[300px] lg:min-h-full">
                    {/* Background Ocean Vessel Image with Dark Gradient Overlay */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000 hover:scale-100"
                        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141B2C] via-[#141B2C]/70 to-[#141B2C]/40" />

                    {/* Top Brand Wordmark */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[8px] bg-gradient-to-r from-[#00629D] to-[#3F96DD] flex items-center justify-center shadow-lg">
                            <Anchor className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-['Hanken_Grotesk'] font-bold text-[18px] text-white tracking-tight leading-none block">
                                PT. PELAYARAN ANDALAS
                            </span>
                            <span className="font-['JetBrains_Mono'] text-[11px] text-[#8AAFC8] uppercase tracking-wider block mt-0.5">
                                BAHTERA BARUNA
                            </span>
                        </div>
                    </div>

                    {/* Middle Tagline / Value Text */}
                    <div className="relative z-10 my-auto py-8">
                        <h1 className="font-['Hanken_Grotesk'] font-bold text-[32px] sm:text-[40px] text-white leading-tight tracking-tight mb-4">
                            Ocean-Scale Logistics & Fleet Management
                        </h1>
                        <p className="font-['Hanken_Grotesk'] text-[15px] text-[#8AAFC8] leading-relaxed max-w-[480px]">
                            Create an administrative account to manage fleet operations, voyage schedules, career applications, and client relations.
                        </p>
                    </div>

                </div>

                {/* Right Side: Registration Form (5 Columns) */}
                <div className="lg:col-span-5 bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-center max-h-[90vh] overflow-y-auto">
                    
                    {/* Header */}
                    <div className="mb-6">
                        <div className="font-['JetBrains_Mono'] text-[12px] font-bold text-[#00629D] uppercase tracking-wider mb-1">
                            ADMINISTRATOR REGISTRATION
                        </div>
                        <h2 className="font-['Hanken_Grotesk'] font-bold text-[26px] text-[#141B2C] tracking-tight">
                            Create New Account
                        </h2>
                        <p className="font-['Hanken_Grotesk'] text-[13px] text-[#404750] mt-1">
                            Enter account details to register an administrator account.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-4">
                        
                        {/* Full Name Input */}
                        <div>
                            <InputLabel htmlFor="name" value="Full Name" className="font-['Hanken_Grotesk'] font-semibold text-[#141B2C] text-xs mb-1" />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="pl-9 w-full rounded-[8px] border-[#E5E7EB] focus:border-[#00629D] focus:ring-[#00629D] font-['Hanken_Grotesk'] text-xs py-2 text-[#141B2C]"
                                    autoComplete="name"
                                    isFocused={true}
                                    placeholder="John Doe"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.name} className="mt-1 text-xs text-red-600" />
                        </div>

                        {/* Username Input */}
                        <div>
                            <InputLabel htmlFor="username" value="Username" className="font-['Hanken_Grotesk'] font-semibold text-[#141B2C] text-xs mb-1" />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <AtSign className="w-4 h-4" />
                                </div>
                                <TextInput
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={data.username}
                                    className="pl-9 w-full rounded-[8px] border-[#E5E7EB] focus:border-[#00629D] focus:ring-[#00629D] font-['Hanken_Grotesk'] text-xs py-2 text-[#141B2C]"
                                    autoComplete="username"
                                    placeholder="johndoe_admin"
                                    onChange={(e) => setData('username', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.username} className="mt-1 text-xs text-red-600" />
                        </div>

                        {/* Email Input */}
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" className="font-['Hanken_Grotesk'] font-semibold text-[#141B2C] text-xs mb-1" />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="pl-9 w-full rounded-[8px] border-[#E5E7EB] focus:border-[#00629D] focus:ring-[#00629D] font-['Hanken_Grotesk'] text-xs py-2 text-[#141B2C]"
                                    autoComplete="email"
                                    placeholder="john.doe@ptabb.com"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1 text-xs text-red-600" />
                        </div>

                        {/* Role Selection */}
                        <div>
                            <InputLabel htmlFor="role" value="Administrative Role" className="font-['Hanken_Grotesk'] font-semibold text-[#141B2C] text-xs mb-1" />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <select
                                    id="role"
                                    name="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="pl-9 w-full rounded-[8px] border-[#E5E7EB] focus:border-[#00629D] focus:ring-[#00629D] font-['Hanken_Grotesk'] text-xs py-2 text-[#141B2C] bg-white cursor-pointer"
                                >
                                    <option value="super_admin">Super Admin (Full Control)</option>
                                    <option value="hr_admin">HR Admin (Careers & Notifications)</option>
                                    <option value="crew_admin">Crew Admin (Crew Vacancies)</option>
                                    <option value="pr_admin">PR Admin (News & Clients)</option>
                                </select>
                            </div>
                            <InputError message={errors.role} className="mt-1 text-xs text-red-600" />
                        </div>

                        {/* Password Input */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" className="font-['Hanken_Grotesk'] font-semibold text-[#141B2C] text-xs mb-1" />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="pl-9 w-full rounded-[8px] border-[#E5E7EB] focus:border-[#00629D] focus:ring-[#00629D] font-['Hanken_Grotesk'] text-xs py-2 text-[#141B2C]"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.password} className="mt-1 text-xs text-red-600" />
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="font-['Hanken_Grotesk'] font-semibold text-[#141B2C] text-xs mb-1" />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="pl-9 w-full rounded-[8px] border-[#E5E7EB] focus:border-[#00629D] focus:ring-[#00629D] font-['Hanken_Grotesk'] text-xs py-2 text-[#141B2C]"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-1 text-xs text-red-600" />
                        </div>

                        {/* Submit CTA Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white rounded-[8px] px-6 py-2.5 font-['Hanken_Grotesk'] font-semibold text-xs transition-[colors,shadow,opacity,transform] duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] active:scale-[0.97] disabled:opacity-50 cursor-pointer mt-3"
                        >
                            {processing ? 'Registering Account...' : 'Create Account'}
                            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                        </button>
                    </form>

                    {/* Back to Login Link */}
                    <div className="mt-5 text-center pt-4 border-t border-[#E5E7EB]">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-1.5 text-xs font-['Hanken_Grotesk'] text-[#404750] hover:text-[#00629D] transition-colors"
                        >
                            ← Already have an account? Sign in
                        </Link>
                    </div>

                </div>

            </div>
        </div>
    );
}
