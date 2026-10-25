'use client';

import React, { useState, useEffect } from 'react';
import {
  FaSliders,
  FaCircleCheck,
  FaXmark,
  FaSpinner,
  FaShieldHalved
} from 'react-icons/fa6';
import { adminApi } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const SettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    platformCommissionPercent: 5.0,
    defaultGstPercent: 18.0,
    serviceRadiusKm: 25.0,
    autoDispatchEnabled: true,
    maintenanceMode: false
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchSettings() {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getSettings();
      if (res) {
        setSettings(res);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load platform settings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
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
    <div className="max-w-4xl space-y-6">
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-emerald-800">
          <FaCircleCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs font-semibold text-rose-800">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
            <FaXmark className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <FaSliders className="h-4 w-4 text-[#FF6500]" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Commercial & Financial Parameters</h2>
              <p className="text-xs text-slate-500">Platform take rates, default taxation, and regional logistics limits</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Platform Take-Rate Margin (%)"
              type="number"
              step="0.1"
              value={settings.platformCommissionPercent}
              onChange={(e) =>
                setSettings({ ...settings, platformCommissionPercent: e.target.value })
              }
              helperText="Marketplace wholesale commission deducted from merchant settlements"
            />

            <Input
              label="Standard Construction Materials GST (%)"
              type="number"
              step="0.1"
              value={settings.defaultGstPercent}
              onChange={(e) => setSettings({ ...settings, defaultGstPercent: e.target.value })}
              helperText="Default tax rate computed during buyer checkout"
            />
          </div>

          <div className="pt-2">
            <Input
              label="Regional Cluster Maximum Radius (KM)"
              type="number"
              step="1"
              value={settings.serviceRadiusKm}
              onChange={(e) => setSettings({ ...settings, serviceRadiusKm: e.target.value })}
              helperText="Dispatch radius for direct yard-to-site fulfillment in Kochi metropolitan zone"
            />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <FaShieldHalved className="h-4 w-4 text-[#FF6500]" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Automation & Governance Controls</h2>
              <p className="text-xs text-slate-500">Autonomous driver fleet dispatch and emergency operational controls</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">Autonomous Driver Dispatch Engine</p>
                <p className="text-[11px] text-slate-500">
                  Automatically broadcast trip notifications to nearest available commercial trucks upon order confirmation
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, autoDispatchEnabled: !settings.autoDispatchEnabled })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  settings.autoDispatchEnabled
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {settings.autoDispatchEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-900">Platform Maintenance Mode</p>
                <p className="text-[11px] text-slate-500">
                  Temporary lock on new buyer checkouts for database maintenance or bulk catalog imports
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  settings.maintenanceMode
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {settings.maintenanceMode ? 'Active (Locked)' : 'Normal Operations'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={saving}>
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
