import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Message } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMessages();
  }, [user]);

  async function fetchMessages() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(full_name),
          recipient:recipient_id(full_name)
        `)
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }

  const conversations = messages.reduce((acc, message) => {
    const otherUserId = message.sender_id === user?.id ? message.recipient_id : message.sender_id;
    const otherUserName = message.sender_id === user?.id ? message.recipient?.full_name : message.sender?.full_name;
    
    if (!acc[otherUserId]) {
      acc[otherUserId] = {
        userId: otherUserId,
        name: otherUserName || 'Unknown User',
        messages: [],
      };
    }
    acc[otherUserId].messages.push(message);
    return acc;
  }, {} as Record<string, { userId: string; name: string; messages: Message[] }>);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId || !newMessage.trim()) return;

    try {
      setSending(true);
      const { error } = await supabase.from('messages').insert({
        sender_id: user?.id,
        recipient_id: selectedUserId,
        content: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-3 min-h-[600px]">
          {/* Conversations List */}
          <div className="border-r">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Messages</h2>
            </div>
            <div className="overflow-y-auto h-[calc(600px-4rem)]">
              {Object.values(conversations).length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No messages yet</p>
                </div>
              ) : (
                Object.values(conversations).map(({ userId, name, messages }) => (
                  <button
                    key={userId}
                    onClick={() => setSelectedUserId(userId)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedUserId === userId ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium">{name}</div>
                    <p className="text-sm text-gray-500 truncate">
                      {messages[0]?.content}
                    </p>
                    <div className="text-xs text-gray-400 mt-1">
                      {format(new Date(messages[0]?.created_at), 'MMM d, h:mm a')}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="col-span-2 flex flex-col">
            {selectedUserId ? (
              <>
                <div className="p-4 border-b">
                  <h3 className="font-medium">
                    {conversations[selectedUserId]?.name}
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversations[selectedUserId]?.messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_id === user?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        <p className="mb-1">{message.content}</p>
                        <div
                          className={`text-xs ${
                            message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {format(new Date(message.created_at), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}