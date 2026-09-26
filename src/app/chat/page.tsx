'use client';

import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { MessageCircle, Search, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import ChatWindow from '@/components/ChatWindow';
import type { Conversation } from '@/types';
import { classNames, timeAgo, truncate } from '@/lib/helpers';
import { SEED_CONVERSATIONS } from '@/lib/seed-data';

export default function ChatPage() {
  const { currentUser, allUsers } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!db) {
      setConversations(SEED_CONVERSATIONS);
      return;
    }
    const convRef = ref(db, 'conversations');
    const unsub = onValue(convRef, (snap) => {
      const val = snap.val();
      if (val && typeof val === 'object') {
        setConversations(Object.values(val) as Conversation[]);
      } else {
        setConversations(SEED_CONVERSATIONS);
      }
    });
    return () => unsub();
  }, []);

  const myConversations = useMemo(() => {
    if (!currentUser) return [];
    return conversations
      .filter((c) => c.participants?.[currentUser.id])
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [conversations, currentUser]);

  const filtered = useMemo(() => {
    if (!query) return myConversations;
    return myConversations.filter((c) => {
      const otherId = Object.keys(c.participants).find(
        (id) => id !== currentUser?.id
      );
      const other = allUsers.find((u) => u.id === otherId);
      return (
        other?.name.toLowerCase().includes(query.toLowerCase()) ||
        c.lastMessage?.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [myConversations, query, allUsers, currentUser]);

  const selected = myConversations.find((c) => c.id === selectedId) || null;

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock className="w-10 h-10 text-warning mx-auto mb-3" />
        <h1 className="text-xl font-bold mb-2">Sign in required</h1>
        <p className="text-gray-400">Please sign in to view your chats.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-bold">Chat</h1>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[420px]">
        {/* Sidebar list */}
        <div
          className={classNames(
            'w-full sm:w-80 flex-shrink-0 bg-base-850 border border-base-700 rounded-xl overflow-hidden flex flex-col',
            selected && 'hidden sm:flex'
          )}
        >
          <div className="p-3 border-b border-base-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full bg-base-800 border border-base-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-8">
                No conversations yet.
              </p>
            )}
            {filtered.map((c) => {
              const otherId = Object.keys(c.participants).find(
                (id) => id !== currentUser.id
              );
              const other = allUsers.find((u) => u.id === otherId);
              const active = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={classNames(
                    'w-full flex items-center gap-3 px-3 py-3 border-b border-base-800 hover:bg-base-800 transition text-left',
                    active && 'bg-base-800'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={other?.avatar || 'https://ui-avatars.com/api/?name=U'}
                    alt={other?.name || 'User'}
                    className="w-10 h-10 rounded-full border border-base-700 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {other?.name || 'Unknown'}
                      </p>
                      <span className="text-[10px] text-gray-500 flex-shrink-0">
                        {c.updatedAt ? timeAgo(c.updatedAt) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {truncate(c.lastMessage || 'No messages yet', 42)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat window */}
        <div
          className={classNames(
            'flex-1 min-w-0',
            !selected && 'hidden sm:flex'
          )}
        >
          <div className="w-full flex flex-col">
            {selected && (
              <button
                onClick={() => setSelectedId(null)}
                className="sm:hidden mb-2 text-xs text-accent text-left"
              >
                ← Back to conversations
              </button>
            )}
            <ChatWindow
              conversation={selected}
              currentUser={currentUser}
              allUsers={allUsers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}