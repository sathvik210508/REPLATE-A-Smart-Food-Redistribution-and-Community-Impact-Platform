import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are currently no items matching your criteria.',
  actionText,
  onAction,
}) => {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-card border border-dashed border-replate-border my-4">
      <div className="w-12 h-12 rounded-full bg-[#EAF6EF] text-[#16845B] flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-replate-text">{title}</h3>
      <p className="text-xs text-replate-subtext max-w-sm mx-auto mt-1 mb-4">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#16845B] text-white hover:bg-[#116747] transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
