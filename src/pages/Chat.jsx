import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft, HiPaperAirplane, HiUser, HiPhone, HiDotsVertical,
} from 'react-icons/hi';
import {
  collection, query, where, orderBy,
  onSnapshot, serverTimestamp, addDoc, doc, getDoc,
} from 'firebase/firestore';
import { db }      from '../firebase/config';
import Layout      from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/formatDate';
import { getChatId } from '../firebase/firestore';
import clsx        from 'clsx';

// ─── Message bubble ───────────────────────────────────────────────────────────
const Bubble = ({ msg, isOwn }) => (
  <div className={clsx(
    'flex gap-2.5 max-w-[78%]',
    isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
  )}>
    <div className={clsx(
      'w-7 h-7 rounded-full flex items-center justify-center',
      'text-xs font-bold flex-shrink-0 self-end mb-1',
      isOwn
        ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
    )}>
      {msg.senderName?.[0]?.toUpperCase() || <HiUser className="h-3 w-3" />}
    </div>
    <div className="flex flex-col gap-1">
      <div className={clsx(
        'px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
        isOwn
          ? 'bg-primary-600 text-white rounded-br-sm'
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-sm'
      )}>
        {msg.text}
      </div>
      <p className={clsx(
        'text-xs text-gray-400',
        isOwn ? 'text-right pr-1' : 'text-left pl-1'
      )}>
        {timeAgo(msg.createdAt)}
      </p>
    </div>
  </div>
);

// ─── Skeleton for loading ─────────────────────────────────────────────────────
const ChatSkeleton = () => (
  <div className="flex-1 p-4 space-y-4 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className={clsx('flex gap-2 max-w-[60%]', i % 2 === 0 ? 'mr-auto' : 'ml-auto flex-row-reverse')}>
        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className={clsx('h-10 rounded-2xl', i % 2 === 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary-200 dark:bg-primary-900/40', 'flex-1')} />
      </div>
    ))}
  </div>
);

// ─── Main Chat Page ───────────────────────────────────────────────────────────
const Chat = () => {
  const { otherId }  = useParams();
  const navigate     = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [messages,  setMessages]  = useState([]);
  const [text,      setText]      = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const chatId     = currentUser ? getChatId(currentUser.uid, otherId) : null;

  // Load other user's profile
  useEffect(() => {
    if (!otherId) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', otherId));
        if (snap.exists()) setOtherUser(snap.data());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [otherId]);

  // Real-time messages listener
  useEffect(() => {
    if (!chatId) return;
    setLoading(true);

    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('Chat listener error:', err);
      setLoading(false);
    });

    return unsub;
  }, [chatId]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || !chatId || sending || !currentUser) return;

    setText('');
    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        chatId,
        senderId:   currentUser.uid,
        receiverId: otherId,
        senderName: userProfile?.name || 'You',
        text:       content,
        read:       false,
        createdAt:  serverTimestamp(),
      });
      inputRef.current?.focus();
    } catch (e) {
      console.error(e);
      setText(content);
    } finally {
      setSending(false);
    }
  }, [text, chatId, currentUser, otherId, userProfile, sending]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div
          className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl
                     border border-gray-100 dark:border-gray-800
                     shadow-xl overflow-hidden"
          style={{ height: 'calc(100vh - 120px)' }}
        >

          {/* ── Header ── */}
          <div className="flex items-center gap-3 px-5 py-4
                          border-b border-gray-100 dark:border-gray-800
                          bg-white dark:bg-gray-900 flex-shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                         text-gray-500 transition-colors"
            >
              <HiArrowLeft className="h-5 w-5" />
            </button>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400
                            to-primary-700 flex items-center justify-center
                            text-white font-bold text-sm flex-shrink-0">
              {otherUser?.name?.[0]?.toUpperCase() || '?'}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                {otherUser?.name || 'Loading...'}
              </p>
              <p className="text-xs text-gray-400 capitalize flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                {otherUser?.role || 'User'}
                {otherUser?.companyName && ` · ${otherUser.companyName}`}
                {otherUser?.university  && ` · ${otherUser.university}`}
              </p>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3
                          bg-gray-50 dark:bg-gray-950">
            {loading ? (
              <ChatSkeleton />
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl
                                flex items-center justify-center mb-4">
                  <HiPaperAirplane className="h-7 w-7 text-primary-500 rotate-90" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  No messages yet
                </p>
                <p className="text-xs text-gray-400">
                  Send a message to start the conversation!
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => {
                  const prevMsg     = messages[i - 1];
                  const showDate    = !prevMsg ||
                    new Date(msg.createdAt?.toMillis?.()).toDateString() !==
                    new Date(prevMsg.createdAt?.toMillis?.()).toDateString();

                  return (
                    <div key={msg.id}>
                      {showDate && msg.createdAt && (
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(msg.createdAt?.toMillis?.()).toLocaleDateString()}
                          </span>
                          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                        </div>
                      )}
                      <Bubble
                        msg={msg}
                        isOwn={msg.senderId === currentUser?.uid}
                      />
                    </div>
                  );
                })}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Input ── */}
          <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800
                          bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={e => {
                    setText(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message... (Enter to send)"
                  rows={1}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200
                             dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                             text-gray-900 dark:text-white text-sm resize-none
                             focus:outline-none focus:ring-2 focus:ring-primary-500
                             focus:border-transparent placeholder-gray-400 transition-all"
                  style={{ maxHeight: '120px', minHeight: '44px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-11 h-11 rounded-xl bg-primary-600 hover:bg-primary-700
                           text-white flex items-center justify-center flex-shrink-0
                           disabled:opacity-40 disabled:cursor-not-allowed
                           active:scale-90 transition-all shadow-md
                           shadow-primary-200 dark:shadow-none"
              >
                {sending
                  ? <span className="animate-spin w-4 h-4 border-2 border-white
                                     border-t-transparent rounded-full inline-block" />
                  : <HiPaperAirplane className="h-4 w-4 rotate-90" />
                }
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Chat;