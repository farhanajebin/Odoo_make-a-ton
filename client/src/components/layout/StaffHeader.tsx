import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  LogOut,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface StaffHeaderProps {
  title: string;
  subtitle?: string;
  onToggleMobileMenu: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
  title,
  subtitle,
  onToggleMobileMenu,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search operational records, customers, invoices...',
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const sampleNotifications = [
    {
      id: 'notif_1',
      title: 'Quotation Accepted',
      desc: 'Quantum Labs accepted QT-2026-083 ($1,190.75)',
      time: '10m ago',
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
    {
      id: 'notif_2',
      title: 'Payment Received',
      desc: '$18,000.00 via Bank Wire from Oasis Cloud',
      time: '25m ago',
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      id: 'notif_3',
      title: 'Overdue Notice',
      desc: 'Apex Logistics INV-2026-105 balance $3,800.00 pending',
      time: '2h ago',
      icon: AlertCircle,
      color: 'text-amber-500',
    },
  ];

  return (
    <header className="flex flex-col gap-4 pb-6 border-b border-[#E9EDF2]">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl border border-[#E9EDF2] text-[#171717] hover:bg-slate-50 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#171717] tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-[#7B8493] mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Right: Date, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Formatted Date */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-[#E9EDF2] text-xs font-medium text-[#7B8493]">
            <Calendar className="h-3.5 w-3.5 text-[#171717]" />
            <span>{formattedDate}</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2.5 rounded-2xl border border-[#E9EDF2] bg-white text-[#171717] hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4 text-[#171717]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#E9EDF2] shadow-xl p-3 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E9EDF2] px-2">
                  <span className="text-xs font-bold text-[#171717]">Operational Alerts</span>
                  <span className="text-[10px] bg-[#E2F0FC] text-[#1E3A8A] font-semibold px-2 py-0.5 rounded-full">
                    3 Unread
                  </span>
                </div>
                <div className="space-y-1.5">
                  {sampleNotifications.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <div
                        key={notif.id}
                        className="p-2 rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer"
                      >
                        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${notif.color}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#171717]">{notif.title}</p>
                          <p className="text-[11px] text-[#7B8493] line-clamp-1">{notif.desc}</p>
                          <span className="text-[10px] text-slate-400 mt-0.5 inline-block">{notif.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Staff Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-[#E9EDF2] bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#A9D4F5] to-[#EAE3F4] text-[#171717] font-bold text-xs flex items-center justify-center shrink-0">
                {getInitials(user?.fullName)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[#171717] leading-tight">
                  {user?.fullName || 'Sarah Jenkins'}
                </p>
                <p className="text-[10px] text-[#7B8493] leading-none">Operations Staff</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#7B8493]" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E9EDF2] shadow-xl p-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-[#E9EDF2] mb-1">
                  <p className="text-xs font-bold text-[#171717]">{user?.fullName || 'Sarah Jenkins'}</p>
                  <p className="text-[11px] text-[#7B8493] truncate">{user?.email || 'staff@loopnex.io'}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-[#DDF0E1] px-2 py-0.5 rounded-md w-fit">
                    <Shield className="h-3 w-3" />
                    <span>Staff Clearance Active</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/staff/profile');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#171717] hover:bg-slate-50 transition-colors"
                >
                  <User className="h-4 w-4 text-[#7B8493]" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors mt-1"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Functional Search Bar */}
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B8493]" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-white border border-[#E9EDF2] text-[#171717] placeholder-[#7B8493] focus:outline-none focus:ring-2 focus:ring-[#A9D4F5] focus:border-transparent transition-all shadow-sm"
          />
        </div>
      )}
    </header>
  );
};

