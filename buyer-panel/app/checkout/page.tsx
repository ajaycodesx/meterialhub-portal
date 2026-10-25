'use client';

import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import { CheckoutPage } from '../../components/buyer/CheckoutPage';
import { HARDWARE_MERCHANTS } from '../../data/mockBuyerData';

export default function CheckoutPageRoute() {
  const router = useRouter();
  const {
    selectedMerchant,
    currentCart,
    selectedVehicle,
    location,
    setPlacedOrderId,
  } = useAppContext();

  const merchant = selectedMerchant || HARDWARE_MERCHANTS[0];

  const vehicle = selectedVehicle || {
    id: 'pickup_truck',
    name: 'Mahindra Bolero Pickup',
    subtitle: 'Medium Payload Delivery',
    capacityTons: 3.5,
    freightFee: 1250,
    etaMinutes: 60,
    image: '/images/pickup_truck.jpg',
    description: 'Ideal for medium loads up to 3.5 Tons.',
  };

  const handleOrderSuccess = (orderId: string) => {
    setPlacedOrderId(orderId);
    router.push('/order-success');
  };

  return (
    <CheckoutPage
      merchant={merchant}
      cartItems={currentCart}
      vehicle={vehicle}
      location={location}
      onBackToCart={() => router.push('/cart')}
      onPlaceOrderSuccess={handleOrderSuccess}
    />
  );
}
