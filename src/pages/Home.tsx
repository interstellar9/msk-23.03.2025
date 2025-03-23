import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Listing, ListingFilters, News } from '../types';
import ListingFilters from '../components/ListingFilters';
import ListingCard from '../components/ListingCard';
import NewsCard from '../components/NewsCard';
import { Link } from 'react-router-dom';
import { ArrowRight, Coins, Newspaper } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [filters, setFilters] = useState<ListingFilters>({
    sortBy: 'newest',
  });

  useEffect(() => {
    fetchListings();
    fetchNews();
  }, [filters]);

  async function fetchListings() {
    try {
      setLoading(true);
      let query = supabase
        .from('listings')
        .select(`
          *,
          users (
            full_name
          )
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'most_liked':
          query = query.order('likes_count', { ascending: false });
          break;
        default: // newest
          query = query.order('created_at', { ascending: false });
      }

      const { data: listingsData, error } = await query;

      if (error) throw error;

      // If user is logged in, fetch their likes
      if (user) {
        const { data: likes } = await supabase
          .from('likes')
          .select('listing_id')
          .eq('user_id', user.id);

        const likedListingIds = new Set(likes?.map(like => like.listing_id));

        listingsData?.forEach(listing => {
          listing.is_liked = likedListingIds.has(listing.id);
        });
      }

      setListings(listingsData || []);
    } catch (error) {
      console.error('Błąd podczas pobierania ogłoszeń:', error);
      toast.error('Nie udało się załadować ogłoszeń');
    } finally {
      setLoading(false);
    }
  }

  async function fetchNews() {
    try {
      setNewsLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Błąd podczas pobierania aktualności:', error);
      toast.error('Nie udało się załadować aktualności');
    } finally {
      setNewsLoading(false);
    }
  }

  const handleLike = async (listingId: string) => {
    if (!user) {
      toast.error('Musisz być zalogowany, aby polubić ogłoszenie');
      return;
    }

    try {
      const listing = listings.find(l => l.id === listingId);
      if (!listing) return;

      if (listing.is_liked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, listing_id: listingId });

        if (error) throw error;
      }

      // Update local state
      setListings(listings.map(l => {
        if (l.id === listingId) {
          return {
            ...l,
            is_liked: !l.is_liked,
            likes_count: l.likes_count + (l.is_liked ? -1 : 1)
          };
        }
        return l;
      }));
    } catch (error) {
      console.error('Błąd podczas aktualizacji polubienia:', error);
      toast.error('Nie udało się zaktualizować polubienia');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Znajdź lokalne usługi i możliwości
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Połącz się z lokalnymi przedsiębiorcami i odkryj, co oferuje Twoje miasto
          </p>
          {!user && (
            <Link
              to="/auth"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Dołącz teraz <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Token Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Coins className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">MSK Token</h2>
                <p className="text-blue-100">
                  Zarabiaj tokeny za każdą transakcję w serwisie
                </p>
              </div>
            </div>
            <Link
              to="/token"
              className="px-6 py-3 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
            >
              Dowiedz się więcej
            </Link>
          </div>
        </div>

        {/* News Section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Newspaper className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Aktualności</h2>
            </div>
            <Link
              to="/news"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Zobacz wszystkie
            </Link>
          </div>

          {newsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Ładowanie aktualności...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map(item => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Listings Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Najnowsze ogłoszenia</h2>
          <Link
            to="/listings"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Zobacz wszystkie
          </Link>
        </div>

        <ListingFilters
          filters={filters}
          onFilterChange={setFilters}
        />

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ładowanie ogłoszeń...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600">Nie znaleziono ogłoszeń spełniających kryteria</p>
              </div>
            ) : (
              listings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onLike={handleLike}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}