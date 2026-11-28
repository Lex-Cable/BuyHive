import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { BrandMark } from '../components/common/BrandMark';

export const CustomerAuthPage: React.FC<{ mode: 'login' | 'register' | 'forgot' }> = ({ mode }) => {
  const { loginCustomer, registerCustomer, navigate, notify } = useMarketplace();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') {
      const res = await loginCustomer(email, password);
      if (!res.ok) {
        setError(res.error || 'Unable to sign in.');
        return;
      }
      navigate('/dashboard');
    } else if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!acceptTerms) {
        setError('Please accept the BuyHive Terms and Conditions.');
        return;
      }
      const res = await registerCustomer({ fullName, email, phone, password });
      if (!res.ok) {
        setError(res.error || 'Registration failed.');
        return;
      }
      navigate('/dashboard');
    } else {
      if (!email.includes('@')) {
        setError('Enter your registered email address.');
        return;
      }
      setResetSent(true);
      notify('Password recovery instructions sent to your email.', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BrandMark onClick={() => navigate('/')} />
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-[#141619] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Marketplace
          </button>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-7 sm:p-8 space-y-6">
          <div>
            <p className="text-xs font-semibold text-amber-800">Customer Account</p>
            <h1 className="font-display text-2xl font-bold text-[#141619] mt-1">
              {mode === 'login' && 'Sign in to BuyHive'}
              {mode === 'register' && 'Create your Customer Account'}
              {mode === 'forgot' && 'Reset Customer Password'}
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              {mode === 'login' && 'Access your shopping dashboard, saved wishlist, orders, and rewards.'}
              {mode === 'register' && 'Register as a buyer. Looking to sell? Visit the Seller Portal instead.'}
              {mode === 'forgot' && 'Enter your email to receive a secure password reset link.'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {resetSent ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Reset Link Dispatched</span>
              </div>
              <p className="text-xs">If an account exists for {email}, recovery instructions have been sent.</p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs font-semibold underline cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Amina Ochieng"
                    className="w-full h-10 px-3.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-amber-700"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {mode === 'login' ? 'Email Address or Phone Number' : 'Email Address'}
                </label>
                <input
                  type={mode === 'login' ? 'text' : 'email'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@buyhive.co.ke"
                  className="w-full h-10 px-3.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-amber-700"
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Phone Number (Kenya M-Pesa Ready)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 712 345 678"
                    className="w-full h-10 px-3.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-amber-700"
                  />
                </div>
              )}

              {mode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full h-10 px-3.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-amber-700"
                  />
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full h-10 px-3.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-amber-700"
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-2 text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-stone-300"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="font-medium text-amber-800 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {mode === 'register' && (
                <label className="flex items-start gap-2.5 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 rounded border-stone-300"
                  />
                  <span>
                    I accept BuyHive’s{' '}
                    <button type="button" onClick={() => navigate('/policies/terms')} className="underline text-[#141619]">
                      Terms and Conditions
                    </button>{' '}
                    and{' '}
                    <button type="button" onClick={() => navigate('/policies/privacy')} className="underline text-[#141619]">
                      Privacy Policy
                    </button>.
                  </span>
                </label>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#141619] hover:bg-stone-800 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                {mode === 'login' ? 'Sign In to Dashboard' : mode === 'register' ? 'Create Customer Account' : 'Send Reset Link'}
              </button>

              {mode === 'login' && (
                <button
                  type="button"
                  onClick={fillDemoCustomer}
                  className="w-full py-2 px-3 rounded-lg border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Use Sample Customer Credentials (customer@buyhive.co.ke)
                </button>
              )}
            </form>
          )}

          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600">
            {mode === 'login' ? (
              <button type="button" onClick={() => navigate('/register')} className="hover:text-[#141619] cursor-pointer">
                New to BuyHive? <span className="font-semibold underline">Create customer account</span>
              </button>
            ) : (
              <button type="button" onClick={() => navigate('/login')} className="hover:text-[#141619] cursor-pointer">
                Already have an account? <span className="font-semibold underline">Sign in</span>
              </button>
            )}
            <button type="button" onClick={() => navigate('/seller/login')} className="text-amber-800 font-semibold hover:underline cursor-pointer">
              Seller Portal →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
