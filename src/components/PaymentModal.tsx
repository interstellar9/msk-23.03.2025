import React, { useState } from 'react';
import { X, CreditCard, Smartphone } from 'lucide-react';
import type { PaymentMethodType } from '../types';
import { cn } from '../lib/utils';

interface Props {
  amount: number;
  onClose: () => void;
  onSubmit: (data: {
    type: PaymentMethodType;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    blikCode?: string;
  }) => Promise<void>;
}

export default function PaymentModal({ amount, onClose, onSubmit }: Props) {
  const [paymentType, setPaymentType] = useState<PaymentMethodType>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [blikCode, setBlikCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit({
        type: paymentType,
        ...(paymentType === 'card' ? {
          cardNumber,
          expiryDate,
          cvv
        } : {
          blikCode
        })
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Płatność</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <p className="text-lg font-medium">Kwota do zapłaty:</p>
            <p className="text-2xl font-bold text-blue-600">
              {amount.toLocaleString('pl-PL')} zł
            </p>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentType('card')}
                className={cn(
                  'p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors',
                  paymentType === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                )}
              >
                <CreditCard className={cn(
                  'w-6 h-6',
                  paymentType === 'card' ? 'text-blue-500' : 'text-gray-400'
                )} />
                <span className="font-medium">Karta płatnicza</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('blik')}
                className={cn(
                  'p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors',
                  paymentType === 'blik'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                )}
              >
                <Smartphone className={cn(
                  'w-6 h-6',
                  paymentType === 'blik' ? 'text-blue-500' : 'text-gray-400'
                )} />
                <span className="font-medium">BLIK</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {paymentType === 'card' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numer karty
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data ważności
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/RR"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kod BLIK
                </label>
                <input
                  type="text"
                  value={blikCode}
                  onChange={(e) => setBlikCode(e.target.value)}
                  placeholder="Wprowadź 6-cyfrowy kod"
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Przetwarzanie...' : 'Zapłać'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>Po dokonaniu płatności otrzymasz tokeny MSK</p>
            <p>jako nagrodę za aktywność w serwisie</p>
          </div>
        </div>
      </div>
    </div>
  );
}