'use client';

import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import { OrderSuccess } from '../../components/buyer/OrderSuccess';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { placedOrderId, handleResetToHome } = useAppContext();

  const handleReturnHome = () => {
    handleResetToHome();
    router.push('/');
  };

  return (
    <OrderSuccess
      orderId={placedOrderId || 'ord_51187259'}
      onTrackOrderLive={() => router.push('/tracking')}
      onReturnHome={handleReturnHome}
    />
  );
}
