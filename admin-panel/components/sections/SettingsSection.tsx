'use client';

import React, { useState, useEffect } from 'react';
import {
  FaSliders,
  FaShieldHalved,
  FaCircleCheck,
  FaXmark,
  FaSpinner
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';

export const SettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    platformCommissionPercent: 5,
    defaultGstPercent: 18,
    serviceRadiusKm: 25,
    autoDispatchEnabled: true,
    maintenanceMode: false
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await adminApi.getSettings();
        if (isMounted && res) {
          setSettings(res);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load platform settings');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await adminApi.updateSettings({
        platformCommissionPercent: Number(settings.platformCommissionPercent),
        defaultGstPercent: Number(settings.defaultGstPercent),
        serviceRadiusKm: Number(settings.serviceRadiusKm),
        autoDispatchEnabled: Boolean(settings.autoDispatchEnabled),
        maintenanceMode: Boolean(settings.maintenanceMode)
      });
      setSettings(res);
      setActionSuccess('Platform and regional parameters updated successfully');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400">
        <FaSpinner className="h-6 w-6 animate-spin mx-auto mb-2 text-[#FF6500]" />
        <p className="text-xs font-medium">Loading platform configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {actionSuccess && (
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs font-medium text-emerald-700 shadow-xs">
          <div className="flex items-center gap-2">
            <FaCircleCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-slate-400 hover:text-slate-600">
            <FaXmark className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs font-medium text-rose-700 shadow-xs">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-slate-600">
            <FaXmark className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-start gap-3">
            <div className="text-[#FF6500] mt-0.5">
              <FaSliders className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-medium text-slate-900 leading-tight">
                Commercial & Financial Parameters
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Platform take rates, default taxation, and regional logistics limits
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Platform Take-Rate Margin (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.platformCommissionPercent}
                onChange={(e) =>
                  setSettings({ ...settings, platformCommissionPercent: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6500] transition-colors"
              />
              <p className="text-[11px] text-slate-400 font-normal mt-1.5">
                Marketplace wholesale commission deducted from merchant settlements
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Standard Construction Materials GST (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.defaultGstPercent}
                onChange={(e) => setSettings({ ...settings, defaultGstPercent: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6500] transition-colors"
              />
              <p className="text-[11px] text-slate-400 font-normal mt-1.5">
                Default tax rate computed during buyer checkout
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1.5">
              Regional Cluster Maximum Radius (KM)
            </label>
            <input
              type="number"
              step="1"
              value={settings.serviceRadiusKm}
              onChange={(e) => setSettings({ ...settings, serviceRadiusKm: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF6500] transition-colors"
            />
            <p className="text-[11px] text-slate-400 font-normal mt-1.5">
              Dispatch radius for direct yard-to-site fulfillment in Kochi metropolitan zone
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-start gap-3">
            <div className="text-[#FF6500] mt-0.5">
              <FaShieldHalved className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-medium text-slate-900 leading-tight">
                Automation & Governance Controls
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Autonomous driver fleet dispatch and emergency operational controls
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-50/70 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-900">
                  Autonomous Driver Dispatch Engine
                </p>
                <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                  Automatically broadcast trip notifications to nearest available commercial trucks upon order confirmation
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, autoDispatchEnabled: !settings.autoDispatchEnabled })
                }
                className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-xs ${
                  settings.autoDispatchEnabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {settings.autoDispatchEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-50/70 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-900">
                  Platform Maintenance Mode
                </p>
                <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                  Temporary lock on new buyer checkouts for database maintenance or bulk catalog imports
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })
                }
                className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-xs ${
                  settings.maintenanceMode
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {settings.maintenanceMode ? 'Active (Locked)' : 'Normal Operations'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#FF6500] hover:bg-[#E05800] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <FaSpinner className="h-3.5 w-3.5 animate-spin" />}
            <span>Save Platform Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
