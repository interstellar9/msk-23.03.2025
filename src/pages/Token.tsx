import React from 'react';
import { Coins, ArrowRight, ShieldCheck, Wallet, Zap, Building2, BarChart3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Token() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              MSK Token
              <span className="text-blue-600"> - Miejska Sieć Kontaktów</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Innowacyjny token nagradzający aktywność w lokalnej społeczności biznesowej.
              Zarabiaj MSK za każdą transakcję i buduj swoją pozycję w sieci.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/auth"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Rozpocznij <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Jak działa MSK Token?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Prosty i przejrzysty system nagradzania za aktywność w sieci
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Zarabiaj tokeny</h3>
              <p className="text-gray-600">
                Otrzymuj 10% wartości transakcji w tokenach MSK za każdą zrealizowaną płatność w serwisie
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Buduj sieć</h3>
              <p className="text-gray-600">
                Wykorzystuj tokeny do zwiększania widoczności swoich ogłoszeń i budowania sieci kontaktów
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rozwijaj biznes</h3>
              <p className="text-gray-600">
                Wymieniaj tokeny na promocje, wyróżnienia ogłoszeń i dostęp do ekskluzywnych funkcji
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Korzyści z MSK Token</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nagrody za transakcje</h3>
              <p className="text-gray-600">10% wartości każdej transakcji wraca do Ciebie w tokenach</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Bezpieczeństwo</h3>
              <p className="text-gray-600">Tokeny są bezpiecznie przechowywane na Twoim koncie</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Szybkie transakcje</h3>
              <p className="text-gray-600">Natychmiastowe naliczanie tokenów po zakończonej transakcji</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Rozwój biznesu</h3>
              <p className="text-gray-600">Wykorzystuj tokeny do promocji swojej działalności</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10%</div>
              <div className="text-gray-600">Zwrotu w tokenach</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Dostępność systemu</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">0 zł</div>
              <div className="text-gray-600">Koszt otrzymania tokenów</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Dołącz do Miejskiej Sieci Kontaktów
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Zacznij zarabiać tokeny MSK już dziś
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
          >
            Rozpocznij teraz <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}