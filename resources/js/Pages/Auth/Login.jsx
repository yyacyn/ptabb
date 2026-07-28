import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { Anchor, ArrowRight, ShieldCheck, Lock, User } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#141B2C] font-['Hanken_Grotesk'] antialiased text-[#141B2C] selection:bg-[#00629D] selection:text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <Head title="Log in — PT. ABB" />

            {/* Main Auth Container (Split Screen Layout) */}
            <div className="w-full max-w-[1100px] bg-white rounded-[12px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] border border-white/10">
                
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
                            Access your administrative dashboard to manage fleet operations, voyage schedules, career applications, and client relations.
                        </p>
                    </div>

                    {/* Bottom Status Telemetry Footer */}
                </div>

                {/* Right Side: Login Form (5 Columns) */}
                <div className="lg:col-span-5 bg-white p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <div className="font-['JetBrains_Mono'] text-[12px] font-bold text-[#00629D] uppercase tracking-wider mb-1">
                            WELCOME BACK
                        </div>
                        <h2 className="font-['Hanken_Grotesk'] font-bold text-[28px] text-[#141B2C] tracking-tight">
                            Sign in to Account
                        </h2>
                        <p className="font-['Hanken_Grotesk'] text-[14px] text-[#404750] mt-1">
                            Enter your credentials to access the management portal.
                        </p>
                    </div>

                    {/* Flash Status Message */}
                    {status && (
                        <div className="mb-6 p-4 rounded-[8px] bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-700">
                            {status}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-5">
                        
                        {/* Username Input */}
                        <div>
                            <InputLabel htmlFor="username" value="Username or Email" className="font-['Hanken_Grotesk'] font-semibold text-[#141B2C] text-sm mb-1.5" />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <TextInput
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={data.username}
                                    className="pl-10 w-full rounded-[8px] border-[#E5E7EB] focus:border-[#00629D] focus:ring-[#00629D] font-['Hanken_Grotesk'] text-sm py-2.5 text-[#141B2C]"
                                    autoComplete="username"
                                    isFocused={true}
                                    placeholder="Enter your username"
                                    onChange={(e) => setData('username', e.target.value)}
                                />
                            </div>
                            <InputError message={errors.username} className="mt-1.5 text-xs text-red-600" />
                        </div>

                        {/* Password Input */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" className="font-['Hanken_Grotesk'] font-semibold text-[#141B2C] text-sm mb-1.5" />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="pl-10 w-full rounded-[8px] border-[#E5E7EB] focus:border-[#00629D] focus:ring-[#00629D] font-['Hanken_Grotesk'] text-sm py-2.5 text-[#141B2C]"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>
                            <InputError message={errors.password} className="mt-1.5 text-xs text-red-600" />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center cursor-pointer">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    className="rounded border-gray-300 text-[#00629D] focus:ring-[#00629D]"
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="ms-2 text-xs font-['Hanken_Grotesk'] text-[#404750]">
                                    Remember me
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs font-['Hanken_Grotesk'] font-medium text-[#00629D] hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        {/* Submit CTA Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00629D] to-[#3F96DD] text-white rounded-[8px] px-6 py-3 font-['Hanken_Grotesk'] font-semibold text-sm transition-all duration-200 hover:shadow-[0_4px_14px_rgba(0,98,157,0.35)] active:scale-[0.97] disabled:opacity-50 cursor-pointer mt-2"
                        >
                            {processing ? 'Authenticating...' : 'Sign in to Dashboard'}
                            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                        </button>
                    </form>

                    {/* Back to Home Link */}
                    <div className="mt-8 text-center pt-6 border-t border-[#E5E7EB]">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs font-['Hanken_Grotesk'] text-[#404750] hover:text-[#00629D] transition-colors"
                        >
                            ← Back to Main Website
                        </Link>
                    </div>

                </div>

            </div>
        </div>
    );
}
