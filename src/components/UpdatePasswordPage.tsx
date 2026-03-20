import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import logoPng from "../assets/logo.png";
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Check } from 'lucide-react';

export function UpdatePasswordPage() {
  const navigate = (path: string) => {
    window.location.href = path;
  };
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Update Password | FactoCero';
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsReady(true);
      } else {
        toast.error('Invalid or expired reset link');
        navigate('/login');
      }
    });
  }, [navigate]);

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
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    }

    setIsLoading(false);
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

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
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
          <p className="text-gray-500 text-sm mt-1">
            Enter your new password below
          </p>
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
                    {password === confirmPassword ? (
                      <Check size={16} className="text-green-500" />
                    ) : null}
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
            onClick={() => navigate('/login')}
            className="text-violet-600 font-semibold hover:text-violet-700"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
