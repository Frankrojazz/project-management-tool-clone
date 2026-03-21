import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import logoPng from '../assets/logo.png';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

type PageState = 'loading' | 'invalid_token' | 'form' | 'success';

export function UpdatePasswordPage() {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasProcessedReset = useRef(false);

  useEffect(() => {
    document.title = 'Update Password - FactoCero Manager';
  }, []);

  useEffect(() => {
    if (hasProcessedReset.current) {
      return;
    }

    hasProcessedReset.current = true;

    const processResetLink = async () => {
      try {
        console.log('HASH:', window.location.hash);

        const {
          data: { session: existingSession },
          error: sessionReadError,
        } = await supabase.auth.getSession();

        console.log('USER:', existingSession?.user ?? null);
        console.log('getSession error:', sessionReadError ?? null);

        if (existingSession) {
          setError(null);
          setPageState('form');
          return;
        }

        const hash = window.location.hash;

        if (!hash) {
          setError('This password reset link is invalid or has expired. Please request a new one.');
          setPageState('invalid_token');
          return;
        }

        const params = new URLSearchParams(hash.replace('#', ''));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        console.log('TOKENS:', {
          hasAccessToken: Boolean(accessToken),
          hasRefreshToken: Boolean(refreshToken),
        });

        if (!accessToken || !refreshToken) {
          setError('This password reset link is invalid or has expired. Please request a new one.');
          setPageState('invalid_token');
          return;
        }

        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        console.log('setSession result:', {
          sessionError: sessionError?.message ?? null,
          hasSession: Boolean(data.session),
          user: data.session?.user ?? null,
        });

        if (sessionError || !data.session) {
          setError('We could not verify your reset link. Please request a new one.');
          setPageState('invalid_token');
          return;
        }

        window.history.replaceState({}, document.title, '/update-password');
        setError(null);
        setPageState('form');
      } catch (err) {
        console.error('Error handling password reset:', err);
        setError('We could not verify your reset link. Please request a new one.');
        setPageState('invalid_token');
      }
    };

    void processResetLink();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      setPageState('success');
      toast.success('Password updated successfully!');

      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (signOutError) {
        console.error('Error signing out after password reset:', signOutError);
      }

      localStorage.removeItem('authToken');

      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string): { level: number; label: string; color: string } => {
    if (pwd.length === 0) return { level: 0, label: '', color: '' };
    if (pwd.length < 6) return { level: 1, label: 'Too short', color: 'bg-red-500' };

    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { level: 2, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { level: 3, label: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 4) return { level: 4, label: 'Good', color: 'bg-blue-500' };
    return { level: 5, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-violet-600 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'invalid_token') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h1>
          <p className="text-gray-500 mb-6">
            {error || 'This password reset link is invalid or has expired. Please request a new one.'}
          </p>
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h1>
          <p className="text-gray-500 mb-6">
            Your password has been changed successfully. Redirecting you to login...
          </p>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={logoPng} alt="FACTO|cero" className="h-14 w-14 rounded-xl object-cover" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              FACTO<span className="text-gray-900/70 mx-1">|</span>
              <span className="text-xs align-top text-gray-900/80">cero</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your new password below</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-11 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength.level >= 4 ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Confirm new password"
                  className={`w-full rounded-xl border bg-white pl-10 pr-11 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-400 focus:border-red-400'
                      : confirmPassword && password === confirmPassword
                        ? 'border-green-400 focus:border-green-400'
                        : 'border-gray-200 focus:border-violet-400'
                  }`}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {confirmPassword && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    {password === confirmPassword && <Check size={16} className="text-green-500" />}
                  </div>
                )}
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-red-500">!</span>
                </div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !!(confirmPassword && password !== confirmPassword)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold tracking-tight text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{' '}
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="text-violet-600 font-semibold hover:text-violet-700"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
