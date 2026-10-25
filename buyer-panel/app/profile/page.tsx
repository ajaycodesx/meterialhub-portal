'use client';

import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import { ProfileSitesPage } from '../../components/buyer/ProfileSitesPage';
import { HardwareMerchant } from '../../types/buyer';

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    location,
    setSelectedMerchant,
    setIsLanguageModalOpen,
    handleLogout,
  } = useAppContext();

  const handleOpenStore = (merchant: HardwareMerchant) => {
    setSelectedMerchant(merchant);
    router.push('/catalog');
  };

  const handleLogoutAndRedirect = () => {
    handleLogout();
    router.push('/');
  };

  return (
    <ProfileSitesPage
      user={user}
      location={location}
      onOpenSiteModal={() => router.push('/site-delivery')}
      onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
      onLogout={handleLogoutAndRedirect}
      onOpenStore={handleOpenStore}
    />
  );
}
