import { useState, useEffect, useRef } from 'react';
import { HiBell, HiX, HiCheckCircle, HiXCircle, HiBriefcase } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../firebase/firestore';
import { timeAgo } from '../../utils/formatDate';
import clsx from 'clsx';

const NotifIcon = ({ type }) => {
  if (type === 'accepted')    return <HiCheckCircle className="h-4 w-4 text-green-500" />;
  if (type === 'rejected')    return <HiXCircle     className="h-4 w-4 text-red-500"   />;
  if (type === 'shortlisted') return <HiBriefcase   className="h-4 w-4 text-blue-500"  />;
  return <HiBriefcase className="h-4 w-4 text-primary-500" />;
};

const bgByType = (type) => {
  if (type === 'accepted')    return 'bg-green-100 dark:bg-green-900/30';
  if (type === 'rejected')    return 'bg-red-100   dark:bg-red-900/30';
  if (type === 'shortlisted') return 'bg-blue-100  dark:bg-blue-900/30';
  return 'bg-primary-100 dark:bg-primary-900/30';
};

const NotifItem = ({ notif, onRead }) => (
  <div
    onClick={() => !notif.read && onRead(notif.id)}
    className={clsx(
      'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
      'hover:bg-gray-50 dark:hover:bg-gray-800/60',
      !notif.read && 'bg-primary-50/60 dark:bg-primary-900/10'
    )}
  >
    <div className={clsx(
      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
      bgByType(notif.type)
    )}>
      <NotifIcon type={notif.type} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={clsx(
        'text-sm leading-snug',
        notif.read
          ? 'text-gray-500 dark:text-gray-400'
          : 'text-gray-900 dark:text-white font-medium'
      )}>
        {notif.message}
      </p>
      <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
    </div>
    {!notif.read && (
      <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
    )}
  </div>
);

const NotificationBell = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const loadNotifications = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getNotifications(currentUser.uid);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentUser]);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRead = async (id) => {
    await markNotificationRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleReadAll = async () => {
    if (!currentUser) return;
    await markAllNotificationsRead(currentUser.uid);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900
                   dark:text-gray-400 dark:hover:text-white
                   hover:bg-gray-100 dark:hover:bg-gray-800
                   transition-colors"
        aria-label="Notifications"
      >
        <HiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white
                           text-[10px] font-bold rounded-full flex items-center
                           justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900
                        rounded-2xl shadow-2xl border border-gray-200
                        dark:border-gray-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/40
                                 text-primary-700 dark:text-primary-400
                                 text-xs font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleReadAll}
                  className="text-xs text-primary-600 dark:text-primary-400
                             hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                           text-gray-400 transition-colors"
              >
                <HiX className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin w-6 h-6 border-2 border-primary-600
                                border-t-transparent rounded-full" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <HiBell className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  We'll notify you when something happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.map(notif => (
                  <NotifItem key={notif.id} notif={notif} onRead={handleRead} />
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800
                          bg-gray-50 dark:bg-gray-800/50 text-center">
            <p className="text-xs text-gray-400">
              {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;