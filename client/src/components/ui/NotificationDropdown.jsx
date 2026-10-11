import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationDropdown = () => {
  const { notifications, unreadCount, isOpen, setIsOpen, markRead, markAllRead } = useNotifications();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const handleItemClick = (notif) => {
    markRead(notif._id);
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return 'Just now';
    const diffMins = Math.floor((new Date() - new Date(iso)) / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-replate-subtext hover:text-replate-text hover:bg-replate-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#16845B] text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-card bg-white border border-replate-border shadow-card z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-replate-border bg-replate-muted/40">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-replate-text">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-[#16845B] hover:text-[#116747] font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-replate-border/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-replate-subtext">
                <Bell className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 hover:bg-replate-muted/60 transition-colors cursor-pointer text-left flex gap-3 ${
                    !n.read ? 'bg-[#EAF6EF]/25' : ''
                  }`}
                >
                  <span
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      !n.read ? 'bg-[#16845B]' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${!n.read ? 'font-semibold text-replate-text' : 'font-medium text-replate-text'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-replate-subtext mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(n.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 bg-replate-muted/40 border-t border-replate-border text-center">
            <span className="text-[11px] text-replate-subtext">
              Real-time updates active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
