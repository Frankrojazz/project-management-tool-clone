import { useState, useEffect } from 'react';
import logoPng from "../assets/logo.png";
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  BarChart3,
  Users,
  Github,
  Chrome,
} from 'lucide-react';

export function LoginPage() {
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInviteMessage, setShowInviteMessage] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'true') {
      setShowInviteMessage(true);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setError('Please fill in all fields');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        await signUp(email, password);
        toast.success('Account created! Please check your email to verify.');
        setIsRegister(false);
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    }

    setIsLoading(false);
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsLoading(true);
    setEmail('sarah@projectify.io');
    setPassword('demo123');
    toast.error('Demo account requires backend. Use your Supabase credentials.');
    setIsLoading(false);
  };

  // ============================================
  // TODO: OAuth Implementation
  // ============================================
  // 1. Backend needs OAuth routes:
  //    GET  /api/auth/google         - redirect to Google
  //    GET  /api/auth/google/callback - handle callback
  //    GET  /api/auth/github         - redirect to GitHub
  //    GET  /api/auth/github/callback - handle callback
  //
  // 2. Environment variables needed:
  //    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
  //    GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
  //
  // 3. Implement these functions with real OAuth flow:
  // ============================================

  const loginWithGoogle = () => {
    // TODO: Implement OAuth flow
    // window.location.href = '/api/auth/google';
    toast.error('Google login: Próximamente disponible');
  };

  const loginWithGithub = () => {
    // TODO: Implement OAuth flow
    // window.location.href = '/api/auth/github';
    toast.error('GitHub login: Próximamente disponible');
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'Google') {
      loginWithGoogle();
    } else if (provider === 'GitHub') {
      loginWithGithub();
    } else {
      toast.error(`${provider}: Próximamente disponible`);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 flex-col justify-between p-12 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 -right-32 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <img src={logoPng} alt="FACTO|cero" className="h-16 w-16 rounded-xl object-cover shadow-lg" />
            <span className="text-2xl font-bold tracking-tight text-white">FACTO<span className="text-white/70 mx-1">|</span><span className="text-xs align-top text-white/80">cero</span></span>
          </div>
          <p className="text-violet-200 text-sm mt-1">Project Management Platform</p>
        </div>

        {/* Feature highlights */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Manage projects<br />
            <span className="text-violet-200">like never before.</span>
          </h2>
          <div className="space-y-4">
            <FeatureItem icon={<Zap size={18} />} text="Kanban boards, lists, calendars & timelines" />
            <FeatureItem icon={<Target size={18} />} text="Goal tracking with OKRs and key results" />
            <FeatureItem icon={<BarChart3 size={18} />} text="Real-time reporting and team insights" />
            <FeatureItem icon={<Users size={18} />} text="Collaborate with your team seamlessly" />
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10">
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 border border-white/10">
            <p className="text-white/90 text-sm leading-relaxed mb-4">
              "FC Manager transformed how our team works. We shipped 40% faster in just 3 months."
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-400/30 text-sm font-bold text-white">
                CEO
              </div>
              <div>
                <p className="text-white text-sm font-medium">Frank Rojazz</p>
                <p className="text-violet-300 text-xs">Founder & CEO, FACTOCERO</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex -space-x-2">
              {['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'].map((color, i) => (
                <div
                  key={i}
                  className="h-7 w-7 rounded-full border-2 border-violet-600"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <p className="text-violet-200 text-xs ml-1">
              <span className="font-semibold tracking-tight text-white">2,400+</span> teams trust FC Manager
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src={logoPng} alt="FACTO|cero" className="h-14 w-14 rounded-xl object-cover" />
            <span className="text-xl font-bold tracking-tight text-gray-900">FACTO<span className="text-gray-900/70 mx-1">|</span><span className="text-xs align-top text-gray-900/80">cero</span></span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isRegister
                ? 'Start managing your projects today'
                : 'Sign in to continue to your workspace'}
            </p>
            
            {showInviteMessage && (
              <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
                <p className="text-sm text-violet-700 dark:text-violet-300">
                  You're signing in to accept a project invitation
                </p>
              </div>
            )}
          </div>

          {/* Social Login */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => handleSocialLogin('Google')}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
            >
              <Chrome size={18} className="text-blue-500" />
              Google
            </button>
            <button
              onClick={() => handleSocialLogin('GitHub')}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
            >
              <Github size={18} />
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                    required={isRegister}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                {!isRegister && (
                  <button type="button" className="text-xs text-violet-600 hover:text-violet-700 font-medium" onClick={() => toast.error('Recuperar contraseña: Próximamente disponible')}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-11 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                  required
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-red-500">!</span>
                </div>
                {error}
              </div>
            )}

            {isRegister && (
              <label className="flex items-start gap-2.5 text-sm text-gray-600">
                <input
                  type="checkbox"
                  required
                  className="mt-1 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  I agree to the{' '}
                  <button type="button" className="text-violet-600 hover:underline font-medium">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-violet-600 hover:underline font-medium">
                    Privacy Policy
                  </button>
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold tracking-tight text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo Login */}
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/50 px-4 py-2.5 text-sm font-medium text-violet-600 hover:bg-violet-50 hover:border-violet-300 transition-all disabled:opacity-50"
          >
            <Zap size={14} />
            Try Demo Account (instant access)
          </button>

          {/* Toggle form */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-violet-600 font-semibold hover:text-violet-700"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-6 rounded-xl bg-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Demo Credentials:</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-green-500" />
                <span className="text-xs text-gray-600">
                  <strong>sarah@projectify.io</strong> / <strong>demo123</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-green-500" />
                <span className="text-xs text-gray-600">Or register a new account below</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white flex-shrink-0">
        {icon}
      </div>
      <span className="text-white/90 text-sm">{text}</span>
    </div>
  );
}
