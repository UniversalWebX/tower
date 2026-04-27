"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ChatsPage() {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChats();
    loadUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChats = async () => {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      } else {
        setError('Failed to load chats');
      }
    } catch (error) {
      setError('Error loading chats');
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const res = await fetch('/api/auth/login');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const res = await fetch(`/api/messages?chatId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        // Sort messages by createdAt (oldest first) so new messages appear at bottom
        const sortedMessages = (data.messages || []).sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
      } else {
        setError('Failed to load messages');
      }
    } catch (error) {
      setError('Error loading messages');
    }
  };

  const createDirectChat = async () => {
    if (!recipientUsername.trim()) return;

    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'direct',
          recipientUsername: recipientUsername.trim()
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChats(prev => [data.chat, ...prev]);
        setCurrentChat(data.chat);
        loadMessages(data.chat.id);
        setRecipientUsername("");
        setShowNewChat(false);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create chat');
      }
    } catch (error) {
      setError('Error creating chat');
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !currentChat) return;

    setSendingMessage(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: currentChat.id,
          content: messageInput.trim()
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data]);
        setMessageInput("");
        
        // Update last message in chat list
        setChats(prev => prev.map(chat => 
          chat.id === currentChat.id 
            ? { ...chat, lastMessage: data.content, lastMessageAt: data.createdAt }
            : chat
        ));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send message');
      }
    } catch (error) {
      setError('Error sending message');
    } finally {
      setSendingMessage(false);
    }
  };

  const selectChat = (chat) => {
    setCurrentChat(chat);
    loadMessages(chat.id);
    setShowNewChat(false);
  };

  const openChat = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      selectChat(chat);
    }
  };

  return (
    <div className="h-full flex">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-white/10 bg-zinc-950/40 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-50">Chats</h2>
            <button
              onClick={() => setShowNewChat(true)}
              className="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center hover:bg-cyan-700"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4 text-zinc-400">Loading...</div>
          ) : chats.length === 0 ? (
            <div className="text-center py-4 text-zinc-400">No chats yet</div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`p-3 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
                    currentChat && currentChat.id === chat.id ? 'bg-zinc-800/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-zinc-50 truncate">
                        {chat.type === 'direct' ? chat.otherUser?.username : chat.name}
                      </div>
                      <div className="text-sm text-zinc-400 truncate">
                        {typeof chat.lastMessage === 'string' ? chat.lastMessage : JSON.stringify(chat.lastMessage) || 'No messages yet'}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 ml-2">
                      {chat.lastMessageAt 
                        ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            <div className="p-4 border-b border-white/10 bg-zinc-950/40">
              <div className="font-medium text-zinc-50">
                {currentChat.type === 'direct' 
                  ? currentChat.otherUser?.username 
                  : currentChat.name
                }
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender?.id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isOwn
                        ? 'bg-cyan-600 text-white'
                        : 'bg-zinc-800 text-zinc-100'
                    }`}
                  >
                    <div className="text-sm">{typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}</div>
                    <div className={`text-xs mt-1 ${
                      message.isOwn ? 'text-cyan-100' : 'text-zinc-400'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10 bg-zinc-950/40">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={sendingMessage || !messageInput.trim()}
                  className="px-6 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:opacity-50"
                >
                  {sendingMessage ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              {showNewChat ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-zinc-50">Start a New Chat</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={recipientUsername}
                      onChange={(e) => setRecipientUsername(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && createDirectChat()}
                      placeholder="Enter username to chat with..."
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-cyan-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowNewChat(false)}
                        className="flex-1 px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createDirectChat}
                        disabled={!recipientUsername.trim()}
                        className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                      >
                        Start Chat
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-zinc-400">
                  <div className="text-6xl mb-4">💬</div>
                  <div>Select a chat to start messaging</div>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
