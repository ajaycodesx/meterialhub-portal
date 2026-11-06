'use client';

import React, { useState } from 'react';
import {
  FaStar,
  FaCheck,
  FaStore,
  FaTriangleExclamation
} from 'react-icons/fa6';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { buyerApi } from '../../lib/api';

interface OrderRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess?: () => void;
}

export const OrderRatingModal: React.FC<OrderRatingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onSuccess
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    try {
      setSubmitting(true);
      setError(null);
      await buyerApi.rateOrder(orderId, rating, reviewText.trim() || undefined);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setRating(5);
        setReviewText('');
        onClose();
        if (onSuccess) onSuccess();
      }, 1400);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Rate Delivery Experience"
      subtitle={`Order #${orderId} - Feedback on Store Stock & Dispatch`}
      icon={<FaStore className="h-5 w-5" />}
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-2.5">
          <div className="h-11 w-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xs">
            <FaCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Thank You for Your Feedback</h3>
          <p className="text-xs font-medium text-slate-600 max-w-xs mx-auto">
            Your review helps verify genuine merchant material quality and delivery reliability.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50/80 flex items-start gap-2 text-xs font-medium text-rose-700">
              <FaTriangleExclamation className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-center space-y-2">
            <span className="text-xs font-medium text-slate-500 block">Overall Satisfaction</span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1.5 cursor-pointer transition-transform hover:scale-110"
                  >
                    <FaStar className={`h-7 w-7 transition-colors ${active ? 'text-amber-400' : 'text-slate-200'}`} />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-slate-800">
              {rating === 5 ? '5 Stars - Outstanding Quality' : rating === 4 ? '4 Stars - Good Experience' : rating === 3 ? '3 Stars - Satisfactory' : rating === 2 ? '2 Stars - Needs Improvement' : '1 Star - Poor Experience'}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Contractor Feedback (Optional)
            </label>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Comments on material packing, unloading, invoice accuracy, or driver punctuality..."
              className="w-full text-xs font-medium text-slate-800 p-3 rounded-2xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500] placeholder:text-slate-400 resize-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
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
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

