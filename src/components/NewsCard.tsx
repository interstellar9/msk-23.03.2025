import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { News } from '../types';

interface Props {
  news: News;
}

export default function NewsCard({ news }: Props) {
  return (
    <Link
      to={`/news/${news.id}`}
      className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {news.image_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Calendar className="w-4 h-4 mr-2" />
          {format(new Date(news.created_at), 'd MMMM yyyy', { locale: pl })}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
          {news.title}
        </h3>
        
        <p className="text-gray-600 line-clamp-3">
          {news.content}
        </p>
      </div>
    </Link>
  );
}