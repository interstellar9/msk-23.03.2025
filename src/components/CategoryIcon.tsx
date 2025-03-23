import React from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  ShoppingBag,
  Users,
  Wrench,
  type LucideIcon
} from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  'Usługi': Wrench,
  'Praca': Briefcase,
  'Nieruchomości': Building2,
  'Wydarzenia': Calendar,
  'Sprzedaż': ShoppingBag,
  'Społeczność': Users,
};

interface Props {
  category: string;
  className?: string;
}

export default function CategoryIcon({ category, className }: Props) {
  const Icon = categoryIcons[category] || Building2;
  return <Icon className={className} />;
}