'use client';

import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import { CartVehicleSelection, VehicleOption } from '../../components/buyer/CartVehicleSelection';
import { HARDWARE_MERCHANTS } from '../../data/mockBuyerData';
import { CartItem } from '../../types/buyer';

export default function CartPage() {
  const router = useRouter();
  const {
    selectedMerchant,
    currentCart,
    setCurrentCart,
    handleUpdateCartQty,
    handleRemoveCartItem,
    setSelectedVehicle,
  } = useAppContext();

  const merchant = selectedMerchant || HARDWARE_MERCHANTS[0];

  const handleProceedToCheckout = (vehicle: VehicleOption, finalCart: CartItem[]) => {
    setSelectedVehicle(vehicle);
    setCurrentCart(finalCart);
    router.push('/checkout');
  };

  return (
    <CartVehicleSelection
      merchant={merchant}
      cartItems={currentCart}
      onUpdateQuantity={handleUpdateCartQty}
      onRemoveItem={handleRemoveCartItem}
      onBackToCatalog={() => router.push('/catalog')}
      onProceedToCheckout={handleProceedToCheckout}
    />
  );
}
