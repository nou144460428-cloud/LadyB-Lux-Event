'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/store/cart';
import { useRentalCart } from '@/store/rentalCart';

export default function PaymentSuccess() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { clearCart: clearRentalCart } = useRentalCart();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const reference =
          params.get('reference') ||
          params.get('paymentReference') ||
          params.get('trxref');
        const providerParam = params.get('provider');
        const provider =
          providerParam === 'monnify' ? 'monnify' : 'paystack';

        if (reference) {
          // Verify payment with backend
          await api.post('/payments/verify', { reference, provider });
          clearCart();
          const pendingRentalPayment = localStorage.getItem('pending-rental-payment');
          if (pendingRentalPayment === '1') {
            clearRentalCart();
            localStorage.removeItem('pending-rental-payment');
            localStorage.removeItem('pending-rental-request-id');
          }
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard/customer');
          }, 3000);
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        router.push('/');
      }
    };

    handlePaymentSuccess();
  }, [router, clearCart, clearRentalCart]);

  return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="card">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your booking has been confirmed. Redirecting to your dashboard...
        </p>
        <div className="animate-spin inline-block">⏳</div>
      </div>
    </div>
  );
}
