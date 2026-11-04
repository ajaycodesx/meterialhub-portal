'use client';

import { useRouter } from 'next/navigation';

interface NoStoreSelectedProps {
  message?: string;
}

export function NoStoreSelected({ message = 'Choose a store before continuing.' }: NoStoreSelectedProps) {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
      <p className="text-slate-700 font-medium">{message}</p>
      <button
        type="button"
        onClick={() => router.push('/')}
        className="px-5 py-2.5 rounded-xl bg-[#FF6500] text-white font-semibold"
      >
        Browse stores
      </button>
    </div>
  );
}
