import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, user, demoLogin } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'donor') return '/donor/dashboard';
    if (user.role === 'ngo') return '/ngo/dashboard';
    if (user.role === 'volunteer') return '/volunteer/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/donor/dashboard';
  };

  const handleQuickDemo = async () => {
    await demoLogin('donor');
    navigate('/donor/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-replate-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#16845B] text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-replate-text leading-none flex items-center gap-1.5">
              REPLATE
              <span className="text-[10px] font-semibold text-[#16845B] bg-[#EAF6EF] px-1.5 py-0.5 rounded">
                SDG 2
              </span>
            </span>
            <span className="text-[10px] text-replate-subtext tracking-wider uppercase font-medium mt-0.5">
              Zero Hunger Initiative
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-replate-subtext">
          <a href="#how-it-works" className="hover:text-replate-text transition-colors">
            How It Works
          </a>
          <a href="#benefits" className="hover:text-replate-text transition-colors">
            Benefits
          </a>
          <Link to="/impact" className="hover:text-replate-text transition-colors">
            Impact Analytics
          </Link>
          <a href="#novanex" className="hover:text-replate-text transition-colors">
            About Team NovaNex
          </a>
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to={getDashboardPath()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#16845B] text-white hover:bg-[#116747] transition-all shadow-sm"
            >
              Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[#16845B]/40 text-[#16845B] bg-[#EAF6EF] hover:bg-[#16845B] hover:text-white transition-all"
                title="Instant test without passwords"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Explore Demo
              </button>
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium text-replate-text hover:text-[#16845B] px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#16845B] text-white hover:bg-[#116747] transition-all shadow-sm"
              >
                Join REPLATE
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
