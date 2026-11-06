'use client';

import React, { useState } from 'react';
import {
  FaFileArrowUp,
  FaBuilding,
  FaLocationDot,
  FaBoxesStacked,
  FaPaperclip,
  FaCheck,
  FaTriangleExclamation
} from 'react-icons/fa6';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { buyerApi } from '../../lib/api';

interface BoqQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BoqQuoteModal: React.FC<BoqQuoteModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [projectName, setProjectName] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('682030');
  const [siteAddress, setSiteAddress] = useState('');
  const [rawMaterialsText, setRawMaterialsText] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      setFileName(file.name);
      const res: any = await buyerApi.uploadFile(file);
      setFileUrl(res?.file_url || res?.url || `/uploads/${file.name}`);
    } catch (err: any) {
      setError(err?.message || 'File upload failed. You can still paste material schedule text.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !siteAddress.trim() || !deliveryPincode.trim()) {
      setError('Please provide project name, site delivery address, and postal PIN code.');
      return;
    }
    if (!rawMaterialsText.trim() && !fileUrl) {
      setError('Please paste your material schedule or upload a BOQ document.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await buyerApi.submitBoqQuote({
        projectName: projectName.trim(),
        deliveryPincode: deliveryPincode.trim(),
        siteAddress: siteAddress.trim(),
        rawMaterialsText: rawMaterialsText.trim(),
        fileUrl: fileUrl || undefined
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setProjectName('');
        setSiteAddress('');
        setRawMaterialsText('');
        setFileUrl('');
        setFileName('');
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit BOQ quotation request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title="Request Factory BOQ Quotation"
      subtitle="Direct factory wholesale estimates for large commercial & residential construction"
      icon={<FaFileArrowUp className="h-5 w-5" />}
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xs">
            <FaCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">BOQ Quotation Submitted</h3>
          <p className="text-xs font-medium text-slate-600 max-w-sm mx-auto">
            Our procurement team and regional verified distributors have received your materials schedule. You will be notified with wholesale quotes.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50/80 flex items-start gap-2.5 text-xs font-medium text-rose-700">
              <FaTriangleExclamation className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <Input
              label="Project or Site Name *"
              placeholder="e.g. Skyline Residency Phase 2"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Delivery Site Address *"
                  placeholder="Plot/Survey number, Street, Landmark"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  label="PIN Code *"
                  placeholder="682030"
                  value={deliveryPincode}
                  onChange={(e) => setDeliveryPincode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Bill of Quantities / Material Schedule
              </label>
              <textarea
                rows={4}
                value={rawMaterialsText}
                onChange={(e) => setRawMaterialsText(e.target.value)}
                placeholder="List required materials and quantities, e.g.:
- 500 Bags UltraTech OPC 53 Cement
- 12 MT Tata Tiscon 550D TMT Rebars (12mm, 16mm)
- 400 Mtr Astral CPVC 1 inch pipes
- 20 Buckets Asian Paints Apex Ultima White 20L"
                className="w-full text-xs font-medium text-slate-800 p-3 rounded-2xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500] placeholder:text-slate-400 resize-none transition-all"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaPaperclip className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700">Attach Drawing or Excel Schedule</span>
                </div>
                {fileName && (
                  <span className="text-[11px] font-medium text-emerald-600 truncate max-w-[180px]">
                    {fileName}
                  </span>
                )}
              </div>
              <label className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#FF6500] bg-white text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <FaFileArrowUp className="h-3.5 w-3.5 text-[#FF6500]" />
                <span>{isUploading ? 'Uploading file...' : fileName ? 'Change attached file' : 'Select PDF, DWG, or XLSX document'}</span>
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.dwg,.csv,.png,.jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting || isUploading}
            >
              {submitting ? 'Submitting BOQ...' : 'Submit BOQ Request'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

