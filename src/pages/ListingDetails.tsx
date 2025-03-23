import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, User, Send, Heart, Phone, Mail, Building2, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Listing, PaymentMethodType } from '../types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import toast from 'react-hot-toast';
import CategoryIcon from '../components/CategoryIcon';
import PaymentModal from '../components/PaymentModal';
import { cn } from '../lib/utils';

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  async function fetchListing() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          users (
            full_name,
            contact_email,
            phone,
            company_description,
            industry
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // If user is logged in, check if they liked this listing
      if (user) {
        const { data: likes } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', id);

        data.is_liked = likes && likes.length > 0;
      }

      setListing(data);
    } catch (error) {
      console.error('Błąd podczas pobierania ogłoszenia:', error);
      toast.error('Nie udało się załadować szczegółów ogłoszenia');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  async function handleLike() {
    if (!user) {
      toast.error('Musisz być zalogowany, aby polubić ogłoszenie');
      return;
    }

    if (!listing) return;

    try {
      if (listing.is_liked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, listing_id: listing.id });

        if (error) throw error;
      }

      setListing({
        ...listing,
        is_liked: !listing.is_liked,
        likes_count: listing.likes_count + (listing.is_liked ? -1 : 1)
      });
    } catch (error) {
      console.error('Błąd podczas aktualizacji polubienia:', error);
      toast.error('Nie udało się zaktualizować polubienia');
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      setSending(true);
      const { error: messageError } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: listing?.user_id,
        content: message,
        listing_id: id
      });

      if (messageError) throw messageError;

      setMessage('');
      toast.success('Wiadomość została wysłana');
    } catch (error) {
      console.error('Błąd podczas wysyłania wiadomości:', error);
      toast.error('Nie udało się wysłać wiadomości');
    } finally {
      setSending(false);
    }
  }

  async function handlePayment(data: {
    type: PaymentMethodType;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    blikCode?: string;
  }) {
    if (!user || !listing) return;

    try {
      // Create payment method
      const { data: paymentMethod, error: methodError } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type: data.type,
          ...(data.type === 'card' ? {
            card_last4: data.cardNumber?.slice(-4),
            card_brand: 'visa' // In real app, detect card brand
          } : {})
        })
        .select()
        .single();

      if (methodError) throw methodError;

      // Create payment
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          listing_id: listing.id,
          amount: listing.price,
          status: 'pending',
          payment_method_id: paymentMethod.id
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Simulate payment processing
      setTimeout(async () => {
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', payment.id);

        if (updateError) {
          console.error('Error updating payment:', updateError);
          toast.error('Błąd podczas przetwarzania płatności');
        } else {
          toast.success('Płatność została zrealizowana pomyślnie');
          setShowPaymentModal(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Błąd podczas przetwarzania płatności:', error);
      toast.error('Nie udało się przetworzyć płatności');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Nie znaleziono ogłoszenia</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <CategoryIcon category={listing.category} className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
                <div className="mt-2 flex items-center space-x-4 text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    {format(new Date(listing.created_at), 'd MMMM yyyy', { locale: pl })}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    {listing.location}
                  </span>
                </div>
              </div>
            </div>
            
            {user && user.id !== listing.user_id && (
              <button
                onClick={handleLike}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={listing.is_liked ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
              >
                <Heart
                  className={cn(
                    'w-6 h-6 transition-colors duration-200',
                    listing.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                  )}
                />
              </button>
            )}
          </div>

          {listing.price && (
            <div className="mb-6 flex items-center justify-between">
              <div className="inline-block px-4 py-2 bg-blue-50 rounded-lg">
                <span className="text-2xl font-bold text-blue-600">
                  {listing.price.toLocaleString('pl-PL')} zł
                </span>
              </div>
              
              {user && user.id !== listing.user_id && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Zapłać teraz
                </button>
              )}
            </div>
          )}

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
          </div>

          <div className="border-t pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informacje o ogłoszeniodawcy</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{listing.users?.full_name}</div>
                      {listing.users?.industry && (
                        <div className="text-sm text-gray-600">{listing.users.industry}</div>
                      )}
                    </div>
                  </div>

                  {listing.users?.company_description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {listing.users.company_description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {listing.users?.contact_email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-5 h-5 mr-2" />
                        <a href={`mailto:${listing.users.contact_email}`} className="hover:text-blue-600">
                          {listing.users.contact_email}
                        </a>
                      </div>
                    )}
                    {listing.users?.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-5 h-5 mr-2" />
                        <a href={`tel:${listing.users.phone}`} className="hover:text-blue-600">
                          {listing.users.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {user && user.id !== listing.user_id && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Wyślij wiadomość</h3>
                  <form onSubmit={handleSendMessage} className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-4">
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Napisz swoją wiadomość..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      {sending ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          amount={listing.price || 0}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handlePayment}
        />
      )}
    </div>
  );
}