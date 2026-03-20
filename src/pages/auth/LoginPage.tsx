import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Activity, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLogin } from '@/hooks/useApi';
import { useAuthStore } from '@/store/slices/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>();
  const login = useLogin();

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      const res: any = await login.mutateAsync(data);
      const { accessToken, refreshToken, user } = res.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate('/dashboard');
    } catch (e: any) {
      // error shown below
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-8 py-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Activity size={22} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">HIS Portal</p>
                <p className="text-primary-200 text-xs">Hospital Information System</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold">Staff Login</h2>
            <p className="text-primary-200 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-5">
            {login.isError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{(login.error as any)?.error?.message || 'Invalid email or password'}</span>
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <input type="email" placeholder="you@hospital.ng"
                className="input"
                {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  className="input pr-10"
                  {...register('password', { required: 'Password is required' })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={login.isPending}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
              {login.isPending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : 'Sign In'}
            </button>

            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
              <p className="font-semibold mb-1 text-slate-600">Demo credentials:</p>
              <p>Admin: admin@hospital.ng / Admin@1234</p>
              <p>Doctor: doctor@hospital.ng / Doctor@1234</p>
              <p>Cashier: cashier@hospital.ng / Cashier@1234</p>
            </div>
          </form>
        </div>
        <p className="text-center text-slate-400 text-xs mt-4">
          © {new Date().getFullYear()} Hospital Information System · All rights reserved
        </p>
      </div>
    </div>
  );
}
