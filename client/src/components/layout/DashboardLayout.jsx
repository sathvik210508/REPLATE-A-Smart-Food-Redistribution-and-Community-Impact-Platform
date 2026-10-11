import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  PlusCircle,
  LayoutDashboard,
  Search,
  Truck,
  Shield,
  BarChart3,
  LogOut,
  Menu,
  X,
  Building2,
  Users,
  Compass,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';

export const DashboardLayout = ({ children, title = 'Dashboard', subtitle = '' }) => {
  const { user, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleRoleSwitch = async (role) => {
    try {
      await demoLogin(role);
      if (role === 'donor') navigate('/donor/dashboard');
      else if (role === 'ngo') navigate('/ngo/dashboard');
      else if (role === 'volunteer') navigate('/volunteer/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  const getNavItems = () => {
    const role = user?.role || 'donor';

    if (role === 'donor') {
      return [
        { label: 'My Surplus Dashboard', path: '/donor/dashboard', icon: LayoutDashboard },
        { label: '+ Post Surplus Food', path: '/donor/donations/new', icon: PlusCircle, highlight: true },
        { label: 'Platform Impact', path: '/impact', icon: BarChart3 },
      ];
    }

    if (role === 'ngo') {
      return [
        { label: 'Available Surplus Food', path: '/ngo/dashboard', icon: Search },
        { label: 'My Requests', path: '/ngo/dashboard?tab=requests', icon: ClipboardList },
        { label: 'Smart Matches', path: '/ngo/dashboard?tab=matches', icon: Sparkles },
        { label: 'Platform Impact', path: '/impact', icon: BarChart3 },
      ];
    }

    if (role === 'volunteer') {
      return [
        { label: 'Active Pickup Dispatch', path: '/volunteer/dashboard', icon: Truck },
        { label: 'Platform Impact', path: '/impact', icon: BarChart3 },
      ];
    }

    if (role === 'admin') {
      return [
        { label: 'Platform Control Panel', path: '/admin/dashboard', icon: Shield },
        { label: 'Impact Analytics', path: '/impact', icon: BarChart3 },
      ];
    }

    return [{ label: 'Impact', path: '/impact', icon: BarChart3 }];
  };

  const navItems = getNavItems();

  const getRoleBadge = (role) => {
    const map = {
      donor: { label: 'Food Donor', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
      ngo: { label: 'NGO / Recipient', color: 'bg-blue-50 text-blue-800 border-blue-200' },
      volunteer: { label: 'Volunteer Logistics', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
      admin: { label: 'System Administrator', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    };
    return map[role] || { label: role, color: 'bg-stone-50 text-stone-700 border-stone-200' };
  };

  const roleInfo = getRoleBadge(user?.role || 'donor');

  return (
    <div className="min-h-screen bg-replate-muted flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-replate-border shrink-0 fixed inset-y-0 z-30">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-replate-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#16845B] text-white flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-replate-text block leading-none">
                REPLATE
              </span>
              <span className="text-[10px] text-replate-subtext font-medium">
                Food Redistribution Platform
              </span>
            </div>
          </Link>
        </div>

        {/* User Card in Sidebar */}
        <div className="p-4 border-b border-replate-border bg-replate-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EAF6EF] text-[#16845B] font-bold text-sm flex items-center justify-center border border-[#16845B]/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-replate-text truncate">{user?.name}</p>
              <p className="text-[11px] text-replate-subtext truncate">
                {user?.organization?.name || user?.email}
              </p>
              <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path.includes('?') && location.search === item.path.split('?')[1]);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  item.highlight
                    ? 'bg-[#16845B] text-white hover:bg-[#116747] shadow-sm font-semibold'
                    : isActive
                    ? 'bg-[#EAF6EF] text-[#116747] font-semibold border border-[#16845B]/20'
                    : 'text-replate-text hover:bg-replate-muted hover:text-replate-text'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : isActive ? 'text-[#16845B]' : 'text-replate-subtext'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Quick Demo Role Switcher (Ideathon Convenience) */}
        <div className="p-3 mx-3 mb-2 bg-[#EAF6EF]/50 rounded-lg border border-[#16845B]/20 text-[11px]">
          <span className="font-semibold text-[#116747] block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#16845B]" />
            Switch Demo Role:
          </span>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => handleRoleSwitch('donor')}
              className={`px-2 py-1 rounded text-[10px] font-medium border text-center transition-colors ${
                user?.role === 'donor'
                  ? 'bg-[#16845B] text-white border-[#16845B]'
                  : 'bg-white hover:bg-emerald-50 text-stone-700 border-stone-200'
              }`}
            >
              Donor
            </button>
            <button
              onClick={() => handleRoleSwitch('ngo')}
              className={`px-2 py-1 rounded text-[10px] font-medium border text-center transition-colors ${
                user?.role === 'ngo'
                  ? 'bg-[#16845B] text-white border-[#16845B]'
                  : 'bg-white hover:bg-blue-50 text-stone-700 border-stone-200'
              }`}
            >
              NGO
            </button>
            <button
              onClick={() => handleRoleSwitch('volunteer')}
              className={`px-2 py-1 rounded text-[10px] font-medium border text-center transition-colors ${
                user?.role === 'volunteer'
                  ? 'bg-[#16845B] text-white border-[#16845B]'
                  : 'bg-white hover:bg-indigo-50 text-stone-700 border-stone-200'
              }`}
            >
              Volunteer
            </button>
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`px-2 py-1 rounded text-[10px] font-medium border text-center transition-colors ${
                user?.role === 'admin'
                  ? 'bg-[#16845B] text-white border-[#16845B]'
                  : 'bg-white hover:bg-purple-50 text-stone-700 border-stone-200'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-replate-border">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-replate-subtext hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-replate-border h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-replate-subtext hover:text-replate-text hover:bg-replate-muted"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-replate-text leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-replate-subtext hidden sm:block">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <div className="h-6 w-px bg-replate-border mx-1" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#EAF6EF] text-[#16845B] font-bold text-xs flex items-center justify-center">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold text-replate-text block leading-none">
                  {user?.name}
                </span>
                <span className="text-[10px] text-replate-subtext">
                  {user?.organization?.name || roleInfo.label}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-stone-900/30"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-replate-border">
              <div className="h-16 flex items-center justify-between px-6 border-b border-replate-border">
                <span className="font-bold text-base text-replate-text">REPLATE</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-replate-text hover:bg-replate-muted"
                    >
                      <Icon className="w-4 h-4 text-[#16845B]" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-replate-border">
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center gap-2 w-full text-xs text-red-600 p-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
