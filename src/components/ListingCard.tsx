import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { Listing } from '../types';
import { cn } from '../lib/utils';
import CategoryIcon from './CategoryIcon';

interface Props {
  listing: Listing;
  onLike?: (listingId: string) => Promise<void>;
}

export default function ListingCard({ listing, onLike }: Props) {
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLike) {
      await onLike(listing.id);
    }
  };

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CategoryIcon category={listing.category} className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {listing.title}
            </h3>
          </div>
          {onLike && (
            <button
              onClick={handleLike}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={listing.is_liked ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
            >
              <Heart
                className={cn(
                  'w-5 h-5 transition-colors duration-200',
                  listing.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-500'
                )}
              />
            </button>
          )}
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {listing.description}
        </p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {listing.location}
          </div>
          {listing.price && (
            <div className="font-medium text-blue-600">
              {listing.price.toLocaleString('pl-PL')} zł
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
          <span className="text-gray-500">
            {format(new Date(listing.created_at), 'd MMMM yyyy', { locale: pl })}
          </span>
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">{listing.likes_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}