import React from 'react';
import { Filter, SortAsc, Search } from 'lucide-react';
import type { ListingFilters, SortOrder } from '../types';

const categories = [
  'Usługi',
  'Praca',
  'Nieruchomości',
  'Wydarzenia',
  'Sprzedaż',
  'Społeczność',
];

const sortOptions: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: 'Najnowsze' },
  { value: 'oldest', label: 'Najstarsze' },
  { value: 'price_asc', label: 'Cena: rosnąco' },
  { value: 'price_desc', label: 'Cena: malejąco' },
  { value: 'most_liked', label: 'Najpopularniejsze' },
];

interface Props {
  filters: ListingFilters;
  onFilterChange: (filters: ListingFilters) => void;
}

export default function ListingFilters({ filters, onFilterChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value,
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value ? Number(value) : undefined,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Szukaj ogłoszeń..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={filters.search || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" />
            <select
              name="category"
              className="w-full border rounded-lg px-4 py-2"
              value={filters.category || ''}
              onChange={handleChange}
            >
              <option value="">Wszystkie kategorie</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min cena"
            className="w-full px-4 py-2 border rounded-lg"
            value={filters.minPrice || ''}
            onChange={handlePriceChange}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max cena"
            className="w-full px-4 py-2 border rounded-lg"
            value={filters.maxPrice || ''}
            onChange={handlePriceChange}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <SortAsc className="text-gray-400" />
            <select
              name="sortBy"
              className="w-full border rounded-lg px-4 py-2"
              value={filters.sortBy || 'newest'}
              onChange={handleChange}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}