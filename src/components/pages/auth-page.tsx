'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/shared/constants/routes';
import { Lock, Eye, EyeOff, Mail, User, ArrowLeft, Loader2 } from 'lucide-react';

type AuthTab = 'login' | 'register' | 'forgot';

export function AuthPage() {
  const router = useRouter();
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const inputClass = 'w-full rounded-xl border border-rl-outline-variant bg-rl-surface-container-lowest px-4 py-3 text-sm text-rl-on-surface placeholder:text-rl-on-surface-variant focus:border-rl-primary focus:ring-2 focus:ring-rl-primary/20 outline-none transition-all';
  const btnPrimary = 'w-full bg-rl-primary text-rl-on-primary py-3 rounded-full font-semibold shadow-md hover:bg-rl-primary/90 active:scale-[0.98] transition-all';

  return (
    <div className="min-h-screen bg-rl-surface flex items-center justify-center px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => router.push(ROUTES.HOME)}
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-rl-surface-container-high transition-colors z-10"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-rl-on-surface" />
      </button>

      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Left Decoration Panel - Desktop Only */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 relative flex-col justify-center items-center p-12">
          <div className="absolute top-8 left-8">
            <div className="flex items-center gap-2">
              <Image src="/brand-logo.png" alt="RupNogor" width={32} height={32} className="rounded-full" />
              <h2 className="text-2xl font-bold text-rl-primary italic">RupNogor</h2>
            </div>
          </div>
          <div className="text-center max-w-sm">
            <div className="w-24 h-24 bg-white/60 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden">
              <Image src="/brand-logo.png" alt="RupNogor" width={96} height={96} className="rounded-full" />
            </div>
            <h3 className="text-2xl font-bold text-rl-on-surface mb-3">
              Where Tradition Meets Modern Elegance
            </h3>
            <p className="text-sm text-rl-on-surface-variant leading-relaxed">
              Join thousands of fashion-forward women who trust RupNogor for their wardrobe essentials.
            </p>
          </div>
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center gap-3 text-xs text-rl-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                10,000+ Happy Customers
              </span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex items-center justify-center gap-2">
              <Image src="/brand-logo.png" alt="RupNogor" width={32} height={32} className="rounded-full" />
              <h2 className="text-2xl font-bold text-rl-primary italic">RupNogor</h2>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-rl-surface-container-low rounded-full p-1 mb-8">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-rl-primary text-rl-on-primary shadow-sm'
                    : 'text-rl-on-surface-variant hover:text-rl-on-surface'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* LOGIN VIEW */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-rl-on-surface">Welcome Back</h2>
              <p className="text-sm text-rl-on-surface-variant">Sign in to continue to RupNogor</p>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-rl-on-surface">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rl-on-surface-variant" />
                  <input type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={`${inputClass} pl-10`} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-rl-on-surface">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rl-on-surface-variant" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    className={`${inputClass} pl-10 pr-10`}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rl-on-surface-variant hover:text-rl-on-surface"
                    type="button"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-rl-on-surface-variant cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-rl-outline-variant accent-rl-primary" />
                  Remember Me
                </label>
                <button
                  onClick={() => setActiveTab('forgot')}
                  className="text-sm text-rl-primary font-medium hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button onClick={async () => { const result = await login(loginEmail, loginPassword); if (result.success) { router.push(ROUTES.HOME); } else { toast({ title: 'Login Failed', description: result.error || 'Please try again', variant: 'destructive' }); } }} disabled={isLoading} className={btnPrimary}>{isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Sign In'}</button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-rl-outline-variant" />
                <span className="text-xs text-rl-on-surface-variant">Or continue with</span>
                <div className="flex-1 h-px bg-rl-outline-variant" />
              </div>

              <button onClick={() => toast({ title: 'Google Login', description: 'Google sign-in coming soon!' })} className="w-full flex items-center justify-center gap-3 py-3 rounded-full border border-rl-outline-variant text-sm font-medium text-rl-on-surface hover:bg-rl-surface-container-high transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>

              <p className="text-center text-sm text-rl-on-surface-variant mt-4">
                Don&apos;t have an account?{' '}
                <button onClick={() => setActiveTab('register')} className="text-rl-primary font-medium hover:underline">
                  Sign Up
                </button>
              </p>
            </div>
          )}

          {/* REGISTER VIEW */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-rl-on-surface">Create Account</h2>
              <p className="text-sm text-rl-on-surface-variant">Join RupNogor and start shopping</p>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-rl-on-surface">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rl-on-surface-variant" />
                  <input type="text" placeholder="Enter your full name" value={regName} onChange={(e) => setRegName(e.target.value)} className={`${inputClass} pl-10`} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-rl-on-surface">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rl-on-surface-variant" />
                  <input type="email" placeholder="you@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={`${inputClass} pl-10`} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-rl-on-surface">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rl-on-surface-variant" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    className={`${inputClass} pl-10 pr-10`}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rl-on-surface-variant hover:text-rl-on-surface"
                    type="button"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button onClick={async () => { const result = await register(regEmail, regPassword, regName); if (result.success) { router.push(ROUTES.HOME); } else { toast({ title: 'Registration Failed', description: result.error || 'Please try again', variant: 'destructive' }); } }} disabled={isLoading} className={btnPrimary}>{isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Account'}</button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-rl-outline-variant" />
                <span className="text-xs text-rl-on-surface-variant">Or sign up with</span>
                <div className="flex-1 h-px bg-rl-outline-variant" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => toast({ title: 'Google Sign Up', description: 'Google registration coming soon!' })} className="flex items-center justify-center gap-2 py-3 rounded-full border border-rl-outline-variant text-sm font-medium text-rl-on-surface hover:bg-rl-surface-container-high transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button onClick={() => toast({ title: 'Facebook Sign Up', description: 'Facebook registration coming soon!' })} className="flex items-center justify-center gap-2 py-3 rounded-full border border-rl-outline-variant text-sm font-medium text-rl-on-surface hover:bg-rl-surface-container-high transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </button>
              </div>

              <p className="text-center text-sm text-rl-on-surface-variant mt-4">
                Already have an account?{' '}
                <button onClick={() => setActiveTab('login')} className="text-rl-primary font-medium hover:underline">
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {activeTab === 'forgot' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-rl-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-rl-on-primary-container" />
                </div>
                <h2 className="text-2xl font-bold text-rl-on-surface">Verify Identity</h2>
                <p className="text-sm text-rl-on-surface-variant mt-2">
                  We&apos;ve sent a 4-digit code to your email. Please enter it below to verify your identity.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-14 h-14 text-center text-xl font-bold rounded-xl border-2 border-rl-outline-variant bg-rl-surface-container-lowest text-rl-on-surface focus:border-rl-primary focus:ring-2 focus:ring-rl-primary/20 outline-none transition-all"
                  />
                ))}
              </div>

              <button onClick={() => toast({ title: 'Verified!', description: 'Password reset link sent to your email' })} className={btnPrimary}>Verify & Reset</button>

              <div className="text-center space-y-2">
                <button onClick={() => toast({ title: 'Code Resent', description: 'A new verification code has been sent' })} className="text-sm text-rl-primary font-medium hover:underline">
                  Resend Code
                </button>
                <p className="text-xs text-rl-on-surface-variant">Didn&apos;t receive the code? Check your spam folder.</p>
              </div>

              <button
                onClick={() => setActiveTab('login')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-rl-outline-variant text-sm font-medium text-rl-on-surface hover:bg-rl-surface-container-high transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}