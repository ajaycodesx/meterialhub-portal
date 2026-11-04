'use client';

import React, { useEffect, useState } from 'react';
import { FaClock, FaLocationDot, FaTruckFast, FaIndianRupeeSign, FaFlagCheckered } from 'react-icons/fa6';
import { Button } from '../ui/Button';

const OFFER_WINDOW_SECONDS = 120;

interface DispatchOfferModalProps {
  offers: any[];
  busyOfferId: string | null;
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
}

export function DispatchOfferModal({ offers, busyOfferId, onAccept, onDecline }: DispatchOfferModalProps) {
  const offer = offers[0];
  const [secondsLeft, setSecondsLeft] = useState<number>(offer?.secondsLeft ?? 0);

  useEffect(() => {
    setSecondsLeft(offer?.secondsLeft ?? 0);
  }, [offer?.offerId, offer?.secondsLeft]);

  useEffect(() => {
    if (!offer) return;
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [offer?.offerId]);

  if (!offer) return null;

  const progress = Math.max(0, Math.min(100, (secondsLeft / OFFER_WINDOW_SECONDS) * 100));
  const expired = secondsLeft === 0;
  const busy = busyOfferId === offer.offerId;

  return (
    <div role="dialog" aria-modal="true" aria-label="New trip request" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-[#B7791F]">New trip request</span>
          <span className={`text-xs font-medium flex items-center gap-1 ${expired ? 'text-rose-600' : 'text-slate-700'}`}>
            <FaClock className="h-3 w-3" />
            {expired ? 'Expired' : `${secondsLeft}s to respond`}
          </span>
        </div>

        <div className="h-1.5 bg-slate-100 rounded-lg overflow-hidden">
          <div className="h-full bg-[#F5A623] transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2.5">
            <FaLocationDot className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Pickup{offer.distanceToPickupKm != null ? ` · ${offer.distanceToPickupKm} km away` : ''}</p>
              <p className="font-medium text-slate-900">{offer.pickupAddress || 'No data'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <FaFlagCheckered className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Drop</p>
              <p className="font-medium text-slate-900">{offer.dropAddress || 'No data'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <FaTruckFast className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Vehicle required</p>
              <p className="font-medium text-slate-900">{offer.vehicleRequired || 'No data'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <FaIndianRupeeSign className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Trip fare</p>
              <p className="font-medium text-slate-900">
                {offer.tripFare != null ? `₹${Number(offer.tripFare).toLocaleString('en-IN')}` : 'No data'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button variant="outline" className="flex-1" disabled={busy} onClick={() => onDecline(offer.offerId)}>
            Decline
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-[#059669] hover:bg-[#047857]"
            loading={busy}
            disabled={expired || busy}
            onClick={() => onAccept(offer.offerId)}
          >
            Accept
          </Button>
        </div>

        {offers.length > 1 && (
          <p className="text-xs text-slate-500 text-center">{offers.length - 1} more request(s) waiting</p>
        )}
      </div>
    </div>
  );
}
