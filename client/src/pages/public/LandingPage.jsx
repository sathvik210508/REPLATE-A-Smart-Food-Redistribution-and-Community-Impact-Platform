import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  TrendingUp,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  Users,
  Award,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const [impactData, setImpactData] = useState(null);
  const { demoLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await api.getImpactAnalytics();
        if (res.success) {
          setImpactData(res.metrics);
        }
      } catch (err) {
        console.warn('Failed to load impact preview:', err);
      }
    };
    fetchImpact();
  }, []);

  const handleDemoAccess = async (role) => {
    try {
      await demoLogin(role);
      if (role === 'donor') navigate('/donor/dashboard');
      else if (role === 'ngo') navigate('/ngo/dashboard');
      else if (role === 'volunteer') navigate('/volunteer/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 md:py-20 lg:py-24 border-b border-replate-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6EF] text-[#116747] text-xs font-semibold tracking-wide border border-[#16845B]/20">
                  <span className="w-2 h-2 rounded-full bg-[#16845B] animate-pulse" />
                  SDG 2 · ZERO HUNGER · IETE IDEATHON 2026
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-replate-text leading-[1.12]">
                  Good Food Should Reach <span className="text-[#16845B]">Good People.</span>
                </h1>

                {/* Supporting description */}
                <p className="text-base sm:text-lg text-replate-subtext max-w-2xl leading-relaxed">
                  Connect surplus food with nearby NGOs, coordinate timely pickups, and turn food donations into measurable community impact.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to={isAuthenticated ? '/donor/donations/new' : '/register?role=donor'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#16845B] text-white text-sm font-semibold hover:bg-[#116747] transition-all shadow-sm"
                  >
                    Donate Surplus Food
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={isAuthenticated ? '/ngo/dashboard' : '/register?role=ngo'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-replate-muted text-replate-text text-sm font-semibold hover:bg-stone-200/80 transition-all border border-replate-border"
                  >
                    Find Food Donations
                  </Link>
                </div>

                {/* Supporting line */}
                <p className="text-xs text-replate-subtext pt-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#16845B]" />
                  Connecting food donors, NGOs, and communities through smarter redistribution.
                </p>

                {/* 1-Click Interactive Demo Access for Ideathon Judges */}
                <div className="pt-4 border-t border-replate-border">
                  <div className="p-3.5 bg-replate-muted rounded-xl border border-replate-border">
                    <span className="text-xs font-semibold text-replate-text block mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#16845B]" />
                      Explore Live Demo (1-Click Judge Access):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDemoAccess('donor')}
                        className="py-1.5 px-3 rounded-lg text-xs font-medium bg-white hover:bg-emerald-50 text-stone-800 border border-replate-border transition-colors text-center"
                      >
                        Donor View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoAccess('ngo')}
                        className="py-1.5 px-3 rounded-lg text-xs font-medium bg-white hover:bg-blue-50 text-stone-800 border border-replate-border transition-colors text-center"
                      >
                        NGO View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoAccess('volunteer')}
                        className="py-1.5 px-3 rounded-lg text-xs font-medium bg-white hover:bg-indigo-50 text-stone-800 border border-replate-border transition-colors text-center"
                      >
                        Volunteer View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoAccess('admin')}
                        className="py-1.5 px-3 rounded-lg text-xs font-medium bg-white hover:bg-purple-50 text-stone-800 border border-replate-border transition-colors text-center"
                      >
                        Admin View
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Photograph */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden border border-replate-border shadow-card bg-stone-100 group">
                  <img
                    src="/replate-hero.jpg"
                    alt="Volunteers packaging fresh surplus food for community redistribution"
                    className="w-full h-[360px] sm:h-[420px] object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent flex items-end p-5">
                    <div className="text-white">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                        CBIT Student Volunteers
                      </p>
                      <p className="text-sm font-medium text-white/95">
                        Safe, hygienic packaging & coordinated transit for community redistribution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-20 bg-replate-muted border-b border-replate-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#16845B]">
                Simple 3-Step Process
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-replate-text mt-1">
                How REPLATE Works
              </h2>
              <p className="text-xs sm:text-sm text-replate-subtext mt-2">
                A seamless transparent workflow from surplus discovery to verified community handover.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-white rounded-card p-6 border border-replate-border shadow-subtle text-left">
                <div className="w-10 h-10 rounded-lg bg-[#EAF6EF] text-[#16845B] font-bold text-sm flex items-center justify-center mb-4">
                  01
                </div>
                <h3 className="text-base font-semibold text-replate-text mb-2">
                  List Surplus Food
                </h3>
                <p className="text-xs text-replate-subtext leading-relaxed">
                  Donors publish available edible food, quantities, dietary labels, and exact safe pickup deadlines before expiry.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-card p-6 border border-replate-border shadow-subtle text-left">
                <div className="w-10 h-10 rounded-lg bg-[#EAF6EF] text-[#16845B] font-bold text-sm flex items-center justify-center mb-4">
                  02
                </div>
                <h3 className="text-base font-semibold text-replate-text mb-2">
                  Connect with NGOs
                </h3>
                <p className="text-xs text-replate-subtext leading-relaxed">
                  Eligible nearby organizations discover matching donations, review allergen & storage details, and submit requests.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-card p-6 border border-replate-border shadow-subtle text-left">
                <div className="w-10 h-10 rounded-lg bg-[#EAF6EF] text-[#16845B] font-bold text-sm flex items-center justify-center mb-4">
                  03
                </div>
                <h3 className="text-base font-semibold text-replate-text mb-2">
                  Complete the Handover
                </h3>
                <p className="text-xs text-replate-subtext leading-relaxed">
                  Volunteer pickup is scheduled, food is collected in safe containers, and recipients confirm verified delivery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Benefits */}
        <section id="benefits" className="py-16 md:py-20 bg-white border-b border-replate-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#16845B]">
                Core Advantages
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-replate-text mt-1">
                Engineered for High-Efficiency Redistribution
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-card border border-replate-border bg-white hover:border-[#16845B]/40 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#EAF6EF] text-[#16845B] flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-replate-text mb-1.5">
                  Reduce Avoidable Waste
                </h3>
                <p className="text-xs text-replate-subtext leading-relaxed">
                  Divert wholesome meals from landfills and contribute directly to carbon emission reductions.
                </p>
              </div>

              <div className="p-5 rounded-card border border-replate-border bg-white hover:border-[#16845B]/40 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#EAF6EF] text-[#16845B] flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-replate-text mb-1.5">
                  Find Suitable Recipients
                </h3>
                <p className="text-xs text-replate-subtext leading-relaxed">
                  Smart rule-based matching pairs food categories with verified local NGOs capable of distribution.
                </p>
              </div>

              <div className="p-5 rounded-card border border-replate-border bg-white hover:border-[#16845B]/40 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#EAF6EF] text-[#16845B] flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-replate-text mb-1.5">
                  Time-Sensitive Pickups
                </h3>
                <p className="text-xs text-replate-subtext leading-relaxed">
                  Countdown alerts and clear pickup windows ensure cooked meals are collected while completely safe.
                </p>
              </div>

              <div className="p-5 rounded-card border border-replate-border bg-white hover:border-[#16845B]/40 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#EAF6EF] text-[#16845B] flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-replate-text mb-1.5">
                  Track Verified Impact
                </h3>
                <p className="text-xs text-replate-subtext leading-relaxed">
                  Full lifecycle timeline tracking with clear receipts, actor logging, and verified SDG 2 analytics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Preview Section */}
        <section className="py-16 md:py-20 bg-replate-muted border-b border-replate-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#16845B]">
                  Platform Metrics
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-replate-text mt-1">
                  Demonstrated Redistribution Impact
                </h2>
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded inline-block mt-2 font-medium">
                  Illustrative Demo Data — IETE IDEATHON 2026 Presentation
                </p>
              </div>
              <Link
                to="/impact"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16845B] hover:text-[#116747]"
              >
                View Full Impact Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-card border border-replate-border text-center shadow-subtle">
                <p className="text-2xl sm:text-3xl font-bold text-replate-text">
                  {impactData?.estimatedMealsServed || 205}
                </p>
                <p className="text-xs font-semibold text-replate-subtext uppercase tracking-wider mt-1">
                  Estimated Meals Served
                </p>
                <span className="text-[10px] text-stone-400 mt-1 block">1 serving = 1 meal</span>
              </div>

              <div className="bg-white p-5 rounded-card border border-replate-border text-center shadow-subtle">
                <p className="text-2xl sm:text-3xl font-bold text-replate-text">
                  {impactData?.completedDonations || 3}
                </p>
                <p className="text-xs font-semibold text-replate-subtext uppercase tracking-wider mt-1">
                  Completed Donations
                </p>
                <span className="text-[10px] text-stone-400 mt-1 block">100% verified handovers</span>
              </div>

              <div className="bg-white p-5 rounded-card border border-replate-border text-center shadow-subtle">
                <p className="text-2xl sm:text-3xl font-bold text-replate-text">
                  {impactData?.estimatedWasteAvoidedKg || 82} kg
                </p>
                <p className="text-xs font-semibold text-replate-subtext uppercase tracking-wider mt-1">
                  Food Waste Diverted
                </p>
                <span className="text-[10px] text-stone-400 mt-1 block">~0.4kg per meal avoided</span>
              </div>

              <div className="bg-white p-5 rounded-card border border-replate-border text-center shadow-subtle">
                <p className="text-2xl sm:text-3xl font-bold text-replate-text">
                  {impactData?.participatingNgos || 2}
                </p>
                <p className="text-xs font-semibold text-replate-subtext uppercase tracking-wider mt-1">
                  Partner NGOs
                </p>
                <span className="text-[10px] text-stone-400 mt-1 block">Akshaya Seva, Robin Hood Army</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-replate-text tracking-tight mb-4">
              Every Surplus Meal Can Make a Difference.
            </h2>
            <p className="text-sm sm:text-base text-replate-subtext max-w-xl mx-auto mb-8">
              Join college canteens, restaurants, and food banks across Hyderabad in building a transparent zero-hunger network.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4">
              <Link
                to="/register?role=donor"
                className="px-6 py-3 rounded-lg bg-[#16845B] text-white text-sm font-semibold hover:bg-[#116747] transition-all shadow-sm"
              >
                Donate Food
              </Link>
              <Link
                to="/register?role=ngo"
                className="px-6 py-3 rounded-lg bg-replate-muted text-replate-text text-sm font-semibold hover:bg-stone-200/80 transition-all border border-replate-border"
              >
                Join as an NGO
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
