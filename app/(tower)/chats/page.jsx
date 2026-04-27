"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ChatsPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadChats();
    loadActiveCalls();
    checkIncomingCalls();
  }, []);

  const loadActiveCalls = async () => {
    try {
      const res = await fetch('/api/voice-calls');
      if (res.ok) {
        const data = await res.json();
        const userCall = data.calls.find(call => call.status === 'connected');
        setActiveCall(userCall || null);
      }
    } catch (error) {
      console.error('Error loading active calls:', error);
    }
  };

  const checkIncomingCalls = async () => {
    try {
      const res = await fetch('/api/voice-calls');
      if (res.ok) {
        const data = await res.json();
        const ringingCall = data.calls.find(call => call.status === 'ringing');
        setIncomingCall(ringingCall || null);
      }
    } catch (error) {
      console.error('Error checking incoming calls:', error);
    }
  };

  const loadChats = async () => {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats);
      } else {
        setError('Failed to load chats');
      }
    } catch (error) {
      setError('Error loading chats');
    } finally {
      setLoading(false);
    }
  };

  const openChat = (chatId) => {
    router.push(`/chats/${chatId}`);
  };

  const startVoiceCall = async (toUserId) => {
    try {
      const res = await fetch('/api/voice-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', toUserId })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveCall(data.call);
        setIncomingCall(null);
      }
    } catch (error) {
      console.error('Error starting voice call:', error);
    }
  };

  const acceptCall = async (callId) => {
    try {
      const res = await fetch('/api/voice-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', callId })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveCall(data.call);
        setIncomingCall(null);
      }
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const rejectCall = async (callId) => {
    try {
      const res = await fetch('/api/voice-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', callId })
      });

      if (res.ok) {
        setIncomingCall(null);
      }
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  };

  const endCall = async () => {
    if (!activeCall) return;

    try {
      const res = await fetch('/api/voice-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end', callId: activeCall.id })
      });

      if (res.ok) {
        setActiveCall(null);
      }
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-zinc-50">Chats</h1>
        <p className="text-zinc-400">Your conversations and messages</p>
      </motion.div>

      {loading && (
        <div className="text-center py-8">
          <div className="text-zinc-400">Loading chats...</div>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <div className="text-red-400">{error}</div>
        </div>
      )}

      {/* Voice Call Interface */}
      {(activeCall || incomingCall) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 right-1/2 z-50"
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-4 max-w-md mx-auto">
            <div className="text-center mb-4">
              <div className="text-lg font-semibold text-zinc-100 mb-2">
                {activeCall ? 'Active Call' : 'Incoming Call'}
              </div>
              <div className="text-sm text-zinc-400">
                {activeCall ? `Connected with ${activeCall.toUserId}` : `${incomingCall.fromUserId} is calling...`}
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              {activeCall && (
                <button
                  onClick={endCall}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  End Call
                </button>
              )}
              
              {incomingCall && (
                <>
                  <button
                    onClick={() => acceptCall(incomingCall.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectCall(incomingCall.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {chats.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-zinc-400">No chats yet</div>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Start a new chat
              </button>
            </div>
          ) : (
            chats.map((chat) => (
              <div key={chat.id} className="flex items-center justify-between p-3 border border-zinc-700 rounded-lg">
                <div className="flex-1 cursor-pointer" onClick={() => openChat(chat.id)}>
                  <div className="font-medium text-zinc-100">{chat.name}</div>
                  <div className="text-sm text-zinc-400">Click to open chat</div>
                </div>
                <button
                  onClick={() => startVoiceCall(chat.otherUserId)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  disabled={!!activeCall}
                >
                  📞 Call
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <button
        onClick={() => setShowNewChatModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full shadow-lg hover:opacity-90 flex items-center justify-center"
      >
        <span className="text-2xl">+</span>
      </button>

      {showNewChatModal && (
        <NewChatModal onClose={() => setShowNewChatModal(false)} onChatCreated={loadChats} />
      )}
    </div>
  );
}

function ChatCard({ chat, onClick }) {
  const otherMembers = chat.members.filter(m => m.userId !== 'current-user'); // This would need actual user ID
  const displayName = chat.type === 'direct' 
    ? otherMembers[0]?.username || 'Unknown'
    : chat.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 cursor-pointer hover:bg-zinc-950/80 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-50">{displayName}</h3>
          <p className="text-sm text-zinc-400 truncate">
            {chat.lastMessage || 'No messages yet'}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xs text-zinc-500">
            {chat.lastMessageAt 
              ? new Date(chat.lastMessageAt).toLocaleDateString()
              : new Date(chat.createdAt).toLocaleDateString()
            }
          </div>
          {chat.unreadCount > 0 && (
            <div className="mt-1 w-6 h-6 bg-cyan-500 text-white text-xs rounded-full flex items-center justify-center">
              {chat.unreadCount}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function NewChatModal({ onClose, onChatCreated }) {
  const [chatName, setChatName] = useState('');
  const [chatType, setChatType] = useState('direct');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load users for selection (this would need to be implemented)
    // For now, using placeholder data
    setUsers([
      { id: '1', username: 'user1' },
      { id: '2', username: 'user2' },
      // Add more users as needed
    ]);
  }, []);

  const createChat = async () => {
    setLoading(true);
    setError(null);
    try {
      const memberIds = selectedUsers.map(u => u.id);
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: chatName,
          type: chatType,
          memberIds
        }),
      });

      if (res.ok) {
        onChatCreated();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create chat');
      }
    } catch (error) {
      setError('Error creating chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 rounded-2xl border border-white/10 p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold text-zinc-50 mb-4">Create New Chat</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Chat Type
            </label>
            <select
              value={chatType}
              onChange={(e) => setChatType(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            >
              <option value="direct">Direct Message</option>
              <option value="group">Group Chat</option>
            </select>
          </div>

          {chatType === 'group' && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Chat Name
              </label>
              <input
                type="text"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                placeholder="Enter chat name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              {chatType === 'direct' ? 'Select User' : 'Select Users'}
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={user.id}
                    checked={selectedUsers.some(u => u.id === user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={user.id} className="text-zinc-300">
                    {user.username}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm mt-4">{error}</div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={createChat}
            disabled={loading || (chatType === 'direct' ? selectedUsers.length !== 1 : selectedUsers.length < 2)}
            className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Chat'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
