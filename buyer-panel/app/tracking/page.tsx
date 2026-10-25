'use client';

import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import { LiveTrackingPage } from '../../components/buyer/LiveTrackingPage';
import { HARDWARE_MERCHANTS } from '../../data/mockBuyerData';

export default function TrackingPage() {
  const router = useRouter();
  const {
    placedOrderId,
    selectedMerchant,
    selectedVehicle,
    location,
    handleResetToHome,
  } = useAppContext();

  const merchant = selectedMerchant || HARDWARE_MERCHANTS[0];

  const handleReturnHome = () => {
    handleResetToHome();
    router.push('/');
  };

  return (
    <LiveTrackingPage
      orderId={placedOrderId || 'ord_98241'}
      merchant={merchant}
      vehicle={selectedVehicle}
      location={location}
      onBackToSuccess={() => router.push('/order-success')}
      onReturnHome={handleReturnHome}
    />
  );
}
