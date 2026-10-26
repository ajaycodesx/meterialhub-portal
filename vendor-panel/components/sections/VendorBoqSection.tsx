'use client';

import React, { useState } from 'react';
import {
  FaFileContract,
  FaMagnifyingGlass,
  FaLocationDot,
  FaCalendarDays,
  FaPaperPlane,
  FaIndianRupeeSign,
  FaCheck,
  FaClock,
  FaBoxesStacked
} from 'react-icons/fa6';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface VendorBoqSectionProps {
  quotes: any[];
  onSubmitQuote: (quoteId: string, estimatedTotal: number, notes?: string) => Promise<void>;
  onRefresh: () => void;
}

export const VendorBoqSection: React.FC<VendorBoqSectionProps> = ({
  quotes,
  onSubmitQuote,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeQuotes = Array.isArray(quotes) ? quotes : [];
  const filteredQuotes = safeQuotes.filter((q) => {
    const titleMatch = (q.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const siteMatch = (q.deliveryAddress || '').toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || siteMatch;
  });

  async function handleSubmit() {
    if (!selectedQuote || quoteAmount <= 0) return;
    try {
      setIsSubmitting(true);
      await onSubmitQuote(selectedQuote.id, quoteAmount, quoteNotes.trim());
      setSelectedQuote(null);
      setQuoteAmount(0);
      setQuoteNotes('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#FFF7F2] text-[#FF6500]">
            <FaFileContract className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-900">
              Contractor BOQ Estimates & Bulk Project Quotes
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Review builder structural requisitions and submit competitive wholesale bids for site supply
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search project BOQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<FaMagnifyingGlass className="h-4 w-4 text-slate-400" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuotes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
            <FaFileContract className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">No incoming contractor BOQ quote requests</p>
          </div>
        ) : (
          filteredQuotes.map((q) => {
            const isQuoted = q.status === 'quoted' || (q.estimatedTotal && q.estimatedTotal > 0);

            return (
              <div
                key={q.id || q.quoteId}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-900">
                      Ref: {(q.id || q.quoteId || '').slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-lg ${
                        isQuoted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isQuoted ? 'Quote Submitted' : 'Pending Response'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-900">
                      {q.title || 'Bulk Construction Materials Requisition'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                      <FaLocationDot className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{q.deliveryAddress || 'SmartCity Project Site, Kakkanad'}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1.5 border border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Target Supply Slot:</span>
                      <span className="font-medium text-slate-900">
                        {q.targetDate || 'Within 10 days'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Contractor Requisition:</span>
                      <span className="font-medium text-slate-900">
                        {q.materialSummary || 'OPC 53 Grade (400 Bags), 16mm Fe550D TMT (5 Tons)'}
                      </span>
                    </div>

                    {isQuoted && (
                      <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-600">
                        <span>Your Depot Wholesale Bid:</span>
                        <span className="font-medium text-emerald-600">
                          ₹{(q.estimatedTotal || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-medium">
                    {isQuoted ? 'Awaiting Contractor Confirmation' : 'Direct Depot RFQ'}
                  </div>

                  <Button
                    variant={isQuoted ? 'secondary' : 'primary'}
                    size="sm"
                    icon={<FaPaperPlane className="h-3 w-3" />}
                    iconPosition="left"
                    onClick={() => {
                      setSelectedQuote(q);
                      setQuoteAmount(q.estimatedTotal || 0);
                      setQuoteNotes(q.notes || 'Includes 18% GST and hydraulic crane unloading at site');
                    }}
                    className="shrink-0"
                  >
                    {isQuoted ? 'Revise Bid' : 'Submit Wholesale Bid'}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedQuote && (
        <Modal
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          title={`Wholesale Bid for ${selectedQuote.title || 'Project BOQ'}`}
          subtitle="Provide a binding bulk price estimate for project site delivery"
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setSelectedQuote(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                disabled={quoteAmount <= 0}
                onClick={handleSubmit}
              >
                Send Commercial Bid
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="font-medium text-slate-900">Project Location: </span>
              <p className="text-slate-600">{selectedQuote.deliveryAddress || 'Kakkanad Site'}</p>
            </div>

            <Input
              label="Wholesale Bid Amount (₹ Total Inc. Taxes)"
              type="number"
              placeholder="e.g., 285000"
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(Number(e.target.value))}
              required
            />

            <Input
              label="Commercial Terms & Supply Logistics Notes"
              placeholder="e.g., Valid for 7 days, direct depot dispatch, Includes crane unloading"
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
