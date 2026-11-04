import React from 'react';

interface NoDataProps {
  title?: string;
  description?: string;
}

export function NoData({ title = 'No data', description }: NoDataProps) {
  return (
    <div className="py-10 px-4 text-center space-y-2">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
  );
}
