'use client';

import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import { SiteDeliveryPage } from '../../components/buyer/SiteDeliveryPage';

export default function SiteDeliveryRoute() {
  const router = useRouter();
  const { location, setLocation } = useAppContext();

  return (
    <SiteDeliveryPage
      location={location}
      onBack={() => router.push('/')}
      onSaveInstructions={(instructions) => {
        setLocation({
          ...location,
          siteConstraints: {
            roadWidth: instructions.accessOption === 'narrow' ? 'Narrow Road (< 10ft)' : '12ft+ (Standard Truck)',
            heavyVehicleAccess: instructions.accessOption !== 'no_heavy',
            craneNeeded: instructions.accessOption === 'crane',
            unloadingTimeSlot: location.siteConstraints?.unloadingTimeSlot || '08:00 AM - 01:00 PM',
          },
        });
        router.push('/');
      }}
    />
  );
}

