'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { onValue, ref, push, set, update, remove } from 'firebase/database';
import { Send, Check, CheckCheck, Music } from 'lucide-react';
import { db } from '@/lib/firebase';
import { SEED_MESSAGES } from '@/lib/seed-data';
import type { Conversation, Message, User } from '@/types';
import { classNames, timeAgo } from '@/lib/helpers';
import TypingIndicator from './TypingIndicator';

interface Props {
  conversation: Conversation | null;
  currentUser: User;
  allUsers: User[];
}

const TYPING_TTL = 3000;

function toMessageArray(val: unknown): Message[] {
  if (!val || typeof val !== 'object') return [];
  const arr = Object.values(val as Record<string, Message>).filter(
    (m): m is Message =>
      !!m && typeof m === 'object' && typeof (m as Message).text === 'string'
  );
  arr.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  return arr;
}

export default function ChatWindow({
  conversation,
  currentUser,
  allUsers,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const otherId = conversation
    ? Object.keys(conversation.participants).find(
        (id) => id !== currentUser.id
      ) || null
    : null;
  const other = otherId ? allUsers.find((u) => u.id === otherId) : null;

  // ---- Subscribe to messages (Firebase) OR use seed fallback ----
  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }

    const convoId = conversation.id;

    // Fallback seed data (always available)
    const seedVal = SEED_MESSAGES[convoId];
    const seedList: Message[] = seedVal
      ? Array.isArray(seedVal)
        ? (seedVal as Message[])
        : toMessageArray(seedVal)
      : [];

    if (!db) {
      setMessages(seedList);
      return;
    }

    const msgRef = ref(db, `messages/${convoId}`);
    const unsub = onValue(
      msgRef,
      (snap) => {
        const val = snap.val();
        const remote = toMessageArray(val);
        if (remote.length === 0 && seedList.length > 0) {
          // Nothing in Firebase yet — show seed messages so demo works.
          setMessages(seedList);
        } else {
          setMessages(remote);
        }
      },
      (err) => {
        console.warn('[chat] messages subscription error', err);
        setMessages(seedList);
      }
    );
    return () => unsub();
  }, [conversation]);

  // ---- Subscribe to typing indicators ----
  useEffect(() => {
    if (!db || !conversation) {
      setTypingNames([]);
      return;
    }
    const convoId = conversation.id;
    const typingRef = ref(db, `typing/${convoId}`);
    const unsub = onValue(
      typingRef,
      (snap) => {
        const val = snap.val();
        const now = Date.now();
        if (val && typeof val === 'object') {
          const active = Object.entries(val as Record<string, number>)
            .filter(
              ([uid, ts]) =>
                uid !== currentUser.id && now - Number(ts) < TYPING_TTL
            )
            .map(
              ([uid]) =>
                allUsers
                  .find((u) => u.id === uid)
                  ?.name.split(' ')[0] || 'Someone'
            );
          setTypingNames(active);
        } else {
          setTypingNames([]);
        }
      },
      () => setTypingNames([])
    );
    return () => unsub();
  }, [conversation, currentUser.id, allUsers]);

  // ---- Auto-scroll on new messages ----
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingNames.length]);

  // ---- Mark incoming messages as read ----
  useEffect(() => {
    if (!db || !conversation) return;
    const database = db;
    const convoId = conversation.id;
    const unread = messages.filter(
      (m) => m.from !== currentUser.id && !m.read
    );
    unread.forEach((m) => {
      update(ref(database, `messages/${convoId}/${m.id}`), {
        read: true,
      }).catch(() => {});
    });
  }, [messages, conversation, currentUser.id]);

  // ---- Clear typing indicator after TTL ----
  useEffect(() => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    if (typingNames.length === 0) return;
    typingTimeoutRef.current = window.setTimeout(() => {
      setTypingNames([]);
    }, TYPING_TTL + 500);
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [typingNames]);

  const handleTyping = useCallback(
    (value: string) => {
      setText(value);
      if (!db || !conversation) return;
      const database = db;
      const convoId = conversation.id;
      set(
        ref(database, `typing/${convoId}/${currentUser.id}`),
        Date.now()
      ).catch(() => {});
    },
    [conversation, currentUser.id]
  );

  const sendMessage = useCallback(async () => {
    if (!conversation || !text.trim() || sending) return;

    const trimmed = text.trim();
    setSending(true);

    // Offline / no-Firebase: append locally.
    if (!db) {
      const localMsg: Message = {
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        from: currentUser.id,
        text: trimmed,
        createdAt: Date.now(),
        read: false,
      };
      setMessages((prev) => [...prev, localMsg]);
      setText('');
      setSending(false);
      return;
    }

    const database = db;
    const convoId = conversation.id;
    const msgId = push(ref(database, `messages/${convoId}`)).key;

    if (!msgId) {
      setSending(false);
      return;
    }

    const msg: Message = {
      id: msgId,
      from: currentUser.id,
      text: trimmed,
      createdAt: Date.now(),
      read: false,
    };

    try {
      await set(ref(database, `messages/${convoId}/${msgId}`), msg);
      await update(ref(database, `conversations/${convoId}`), {
        lastMessage: msg.text,
        updatedAt: msg.createdAt,
      });
      await remove(ref(database, `typing/${convoId}/${currentUser.id}`));
      setText('');
    } catch (e) {
      console.warn('[chat] send failed, appending locally', e);
      // Optimistic local append so the UI still works.
      setMessages((prev) => [...prev, msg]);
      setText('');
    } finally {
      setSending(false);
    }
  }, [conversation, currentUser.id, text, sending]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base-900 border border-base-700 rounded-xl min-h-[300px]">
        <div className="text-center px-4">
          <Music className="w-10 h-10 text-base-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-base-900 border border-base-700 rounded-xl overflow-hidden min-h-[400px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-base-700 bg-base-850">
        {other ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={other.avatar}
              alt={other.name}
              className="w-9 h-9 rounded-full border border-base-700"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{other.name}</p>
              <p className="text-[11px] text-gray-500 truncate">
                {other.headline}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">Conversation</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-500 py-8">
            No messages yet. Say hi 👋
          </p>
        )}
        {messages.map((m) => {
          const mine = m.from === currentUser.id;
          return (
            <div
              key={m.id}
              className={classNames(
                'flex',
                mine ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={classNames(
                  'max-w-[75%] px-3.5 py-2 rounded-2xl text-sm break-words',
                  mine
                    ? 'bg-accent text-black rounded-br-sm'
                    : 'bg-base-800 border border-base-700 text-white rounded-bl-sm'
                )}
              >
                <p>{m.text}</p>
                <div
                  className={classNames(
                    'flex items-center gap-1 mt-1 text-[10px]',
                    mine ? 'text-black/60 justify-end' : 'text-gray-500'
                  )}
                >
                  <span>{timeAgo(m.createdAt)}</span>
                  {mine &&
                    (m.read ? (
                      <CheckCheck className="w-3 h-3" />
                    ) : (
                      <Check className="w-3 h-3" />
                    ))}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <TypingIndicator names={typingNames} />

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-base-700 bg-base-850">
        <input
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-base-800 border border-base-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          className="p-2 rounded-lg bg-accent hover:bg-accent-light text-black transition disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}