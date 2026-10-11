import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight, Sparkles, Building2, HeartHandshake, Truck, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (role) => {
    setError('');
    setLoading(true);
    try {
      const user = await demoLogin(role);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'donor') navigate('/donor/dashboard');
    else if (role === 'ngo') navigate('/ngo/dashboard');
    else if (role === 'volunteer') navigate('/volunteer/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/donor/dashboard');
  };

  return (
    <div className="min-h-screen bg-replate-muted flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white rounded-card border border-replate-border shadow-card p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#16845B] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-replate-text">Sign In to REPLATE</h2>
            <p className="text-xs text-replate-subtext mt-1">
              Access your food redistribution portal
            </p>
          </div>

          {/* Quick Demo Mode Panel */}
          <div className="mb-6 p-4 rounded-xl bg-[#EAF6EF] border border-[#16845B]/20">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-[#16845B]" />
              <span className="text-xs font-bold text-[#116747]">
                Explore Demo Mode (1-Click Access)
              </span>
            </div>
            <p className="text-[11px] text-[#116747]/80 mb-3">
              Review full dashboard capabilities instantly without entering credentials:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('donor')}
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-stone-200 hover:border-[#16845B] text-left transition-colors shadow-subtle group"
              >
                <Building2 className="w-4 h-4 text-[#16845B]" />
                <div>
                  <span className="text-xs font-semibold text-replate-text block leading-none">
                    Food Donor
                  </span>
                  <span className="text-[10px] text-stone-500">CBIT Canteen</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn('ngo')}
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-stone-200 hover:border-blue-600 text-left transition-colors shadow-subtle group"
              >
                <HeartHandshake className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-xs font-semibold text-replate-text block leading-none">
                    NGO Partner
                  </span>
                  <span className="text-[10px] text-stone-500">Akshaya Seva</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn('volunteer')}
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-stone-200 hover:border-indigo-600 text-left transition-colors shadow-subtle group"
              >
                <Truck className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-xs font-semibold text-replate-text block leading-none">
                    Volunteer
                  </span>
                  <span className="text-[10px] text-stone-500">NovaNex Fleet</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn('admin')}
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-stone-200 hover:border-purple-600 text-left transition-colors shadow-subtle group"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <div>
                  <span className="text-xs font-semibold text-replate-text block leading-none">
                    Admin
                  </span>
                  <span className="text-[10px] text-stone-500">Full Audit Log</span>
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-replate-border w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-stone-400 font-medium absolute">
              Or Sign In with Email
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-replate-text mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. donor@replate.org"
                className="w-full px-3.5 py-2.5 rounded-lg border border-replate-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#16845B] focus:border-[#16845B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-replate-text mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-replate-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#16845B] focus:border-[#16845B]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#16845B] hover:bg-[#116747] text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-xs text-replate-subtext border-t border-replate-border pt-4">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#16845B] hover:underline">
              Register Organization
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
