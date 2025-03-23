import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, MessageSquare, Plus, Settings, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Listing, Message } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

type Tab = 'listings' | 'messages' | 'profile';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchUserData();
  }, [user, activeTab]);

  async function fetchUserData() {
    try {
      setLoading(true);
      
      if (activeTab === 'listings') {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);
      }
      
      if (activeTab === 'messages') {
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
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteListing(listingId: string) {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;
      
      setListings(listings.filter(listing => listing.id !== listingId));
      toast.success('Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.full_name}</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('listings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'listings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-5 h-5 inline-block mr-2" />
              Listings
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-5 h-5 inline-block mr-2" />
              Messages
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-5 h-5 inline-block mr-2" />
              Profile Settings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === 'listings' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Your Listings</h2>
                    <Link
                      to="/create-listing"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create New Listing
                    </Link>
                  </div>

                  {listings.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">You haven't created any listings yet</p>
                      <Link
                        to="/create-listing"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Create your first listing
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {listings.map(listing => (
                        <div
                          key={listing.id}
                          className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="p-6">
                            <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                              <span>{listing.category}</span>
                              <span>{format(new Date(listing.created_at), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                              <Link
                                to={`/listings/${listing.id}`}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                View Details
                              </Link>
                              <button
                                onClick={() => handleDeleteListing(listing.id)}
                                className="text-red-600 hover:text-red-700 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Your Messages</h2>
                  {messages.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map(message => (
                        <div
                          key={message.id}
                          className={`p-4 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-blue-50 ml-12'
                              : 'bg-gray-50 mr-12'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">
                              {message.sender_id === user?.id
                                ? 'You'
                                : message.sender?.full_name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          <p className="text-gray-700">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={user?.full_name || ''}
                          readOnly
                          className="w-full px-3 py-2 border rounded-md bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="w-full px-3 py-2 border rounded-md bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          User Type
                        </label>
                        <input
                          type="text"
                          value={user?.user_type || ''}
                          readOnly
                          className="w-full px-3 py-2 border rounded-md bg-gray-100"
                        />
                      </div>
                      {user?.user_type === 'entrepreneur' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              NIP
                            </label>
                            <input
                              type="text"
                              value={user?.nip || ''}
                              readOnly
                              className="w-full px-3 py-2 border rounded-md bg-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Industry
                            </label>
                            <input
                              type="text"
                              value={user?.industry || ''}
                              readOnly
                              className="w-full px-3 py-2 border rounded-md bg-gray-100"
                            />
                          </div>
                        </>
                      )}
                      {user?.user_type === 'resident' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Karta Łodzianina
                          </label>
                          <input
                            type="text"
                            value={user?.karta_lodzianina || ''}
                            readOnly
                            className="w-full px-3 py-2 border rounded-md bg-gray-100"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}