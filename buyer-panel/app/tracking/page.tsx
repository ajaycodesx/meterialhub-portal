'use client';

import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import { LiveTrackingPage } from '../../components/buyer/LiveTrackingPage';
import { NoStoreSelected } from '../../components/buyer/NoStoreSelected';

export default function TrackingPage() {
  const router = useRouter();
  const {
    placedOrderId,
    selectedMerchant,
    selectedVehicle,
    location,
    handleResetToHome,
  } = useAppContext();

  const merchant = selectedMerchant;

  if (!merchant || !placedOrderId) {
    return <NoStoreSelected message="No active order to track." />;
  }

  const handleReturnHome = () => {
    handleResetToHome();
    router.push('/');
  };

  return (
    <LiveTrackingPage
      orderId={placedOrderId}
      merchant={merchant}
      vehicle={selectedVehicle}
      location={location}
      onBackToSuccess={() => router.push('/order-success')}
      onReturnHome={handleReturnHome}
    />
  );
}
