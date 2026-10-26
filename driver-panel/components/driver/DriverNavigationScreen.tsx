'use client';

import React, { useState } from 'react';
import {
  FaArrowLeft,
  FaLocationArrow,
  FaLocationDot,
  FaRoad,
  FaClock,
  FaGaugeHigh,
  FaTriangleExclamation,
  FaStore,
  FaBuildingCircleCheck
} from 'react-icons/fa6';

interface DriverNavigationScreenProps {
  trip: any;
  onClose: () => void;
  gpsCoords?: { lat: number; lng: number } | null;
  gpsActive?: boolean;
  onRequestGps?: () => void;
}

export function DriverNavigationScreen({
  trip,
  onClose,
  gpsCoords,
  gpsActive,
  onRequestGps,
}: DriverNavigationScreenProps) {
  const [navTarget, setNavTarget] = useState<'vendor' | 'buyer'>('vendor');

  const vendorName = trip?.pickupAddress?.split(',')[0] || trip?.vendorName || 'BuildPro Materials';
  const vendorAddress = trip?.pickupAddress || trip?.vendorAddress || 'Industrial Estate Road, Kalamassery';
  const buyerName = trip?.dropAddress?.split(',')[0] || trip?.buyerName || 'Anjali Traders';
  const buyerAddress = trip?.dropAddress || trip?.buyerAddress || 'Market Road, Edappally';

  const currentDestination = navTarget === 'vendor' ? vendorName : buyerName;
  const currentAddress = navTarget === 'vendor' ? vendorAddress : buyerAddress;

  function handleStartTurnByTurn() {
    if (onRequestGps) onRequestGps();
    const destinationQuery = encodeURIComponent(currentAddress);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}&travelmode=driving`;
    window.open(url, '_blank');
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 lg:p-6">
      <div className="w-full max-w-md lg:max-w-4xl h-full lg:h-[88vh] bg-[#F8FAFC] flex flex-col lg:rounded-3xl lg:border lg:border-slate-200 lg:shadow-2xl overflow-hidden relative">
        <div className="bg-white px-4 pt-3 pb-3 border-b border-slate-200/70 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <FaArrowLeft className="h-4 w-4" />
          </button>

          <span className="text-xs font-medium text-slate-900 tracking-wider uppercase">
            COMMERCIAL ROUTE NAVIGATION
          </span>

          <div className="w-10" />
        </div>

        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setNavTarget('vendor')}
            className={`py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              navTarget === 'vendor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FaStore className="h-3.5 w-3.5" />
            <span>To vendor</span>
          </button>

          <button
            onClick={() => setNavTarget('buyer')}
            className={`py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              navTarget === 'buyer'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FaBuildingCircleCheck className="h-3.5 w-3.5" />
            <span>To buyer</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FF6500] inline-block" />
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                  ACTIVE WAYPOINT
                </span>
              </div>

              <h2 className="text-lg font-medium text-slate-900">
                {currentDestination}
              </h2>

              <div className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                <FaLocationDot className="h-4 w-4 text-[#FF6500] shrink-0 mt-0.5" />
                <span>{currentAddress}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">
                    DISTANCE
                  </span>
                  <span className="text-sm font-medium text-slate-900 flex items-center justify-center gap-1">
                    <FaRoad className="h-3 w-3 text-slate-400" />
                    <span>{navTarget === 'vendor' ? '3.2 km' : '6.8 km'}</span>
                  </span>
                </div>

                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">
                    ETA
                  </span>
                  <span className="text-sm font-medium text-emerald-700 flex items-center justify-center gap-1">
                    <FaClock className="h-3 w-3 text-emerald-500" />
                    <span>{navTarget === 'vendor' ? '12 min' : '24 min'}</span>
                  </span>
                </div>

                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">
                    TRAFFIC
                  </span>
                  <span className="text-sm font-medium text-emerald-700 flex items-center justify-center gap-1">
                    <FaGaugeHigh className="h-3 w-3 text-emerald-600" />
                    <span>Normal</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
                TURN-BY-TURN PREVIEW
              </span>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 font-medium flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-900">
                      Head straight on {navTarget === 'vendor' ? 'Kalamassery Depot Access' : 'Express Highway'}
                    </p>
                    <p className="text-slate-500 font-medium">Continue for 1.8 km</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 font-medium flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-900">
                      Take the service exit for {currentDestination}
                    </p>
                    <p className="text-slate-500 font-medium">Clearance 4.5m · No weight restrictions</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-emerald-700 border border-slate-200/60 font-medium flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-900">
                      Arrive at {currentDestination} loading / offloading bay
                    </p>
                    <p className="text-slate-500 font-medium">Present delivery checklist to site supervisor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative w-full h-64 lg:h-80 bg-slate-800 rounded-3xl overflow-hidden shadow-md border border-slate-200">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <div className="py-1 px-3 bg-slate-900/90 rounded-xl backdrop-blur-md text-[11px] font-medium text-white flex items-center gap-1.5 border border-slate-700">
                    <span className={`w-2 h-2 rounded-xs ${gpsActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span>{gpsActive ? 'Carrier GPS Live' : 'Simulated Depot Telemetry'}</span>
                  </div>

                  <div className="py-1 px-3 bg-slate-900/90 rounded-xl backdrop-blur-md text-[11px] font-medium text-slate-300 border border-slate-700">
                    Heavy Vehicle Routing
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="inline-flex p-3 rounded-2xl bg-[#FF6500] text-white shadow-lg animate-bounce">
                    <FaLocationArrow className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-medium text-white drop-shadow-md">
                    En route to {navTarget === 'vendor' ? 'Pickup Depot' : 'Site Offloading Bay'}
                  </p>
                  {gpsCoords && (
                    <p className="text-[10px] font-mono text-slate-300">
                      Lat: {gpsCoords.lat.toFixed(4)} | Lng: {gpsCoords.lng.toFixed(4)}
                    </p>
                  )}
                </div>

                <div className="bg-slate-900/80 rounded-2xl p-2.5 backdrop-blur-md text-[11px] text-slate-300 flex items-center gap-2">
                  <FaTriangleExclamation className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Commercial load clearance verified for heavy axles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 sticky bottom-0 z-20">
          <button
            onClick={handleStartTurnByTurn}
            className="w-full py-4 px-6 bg-[#FF6500] hover:bg-[#E05800] text-white font-medium rounded-2xl flex items-center justify-center gap-2 shadow-lg text-sm transition-all cursor-pointer"
          >
            <FaLocationArrow className="h-4 w-4" />
            <span>Start turn-by-turn navigation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
