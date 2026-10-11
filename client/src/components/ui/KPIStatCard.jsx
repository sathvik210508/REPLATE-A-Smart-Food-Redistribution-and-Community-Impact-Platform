import React from 'react';

export const KPIStatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  badgeText,
  badgeColor = 'green',
  accentColor = '#16845B',
}) => {
  return (
    <div className="bg-white rounded-card p-5 border border-replate-border shadow-subtle hover:border-[#16845B]/40 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-replate-subtext">
          {title}
        </span>
        {Icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#EAF6EF', color: '#16845B' }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold text-replate-text tracking-tight">
          {value}
        </span>
        {badgeText && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              badgeColor === 'orange'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-replate-subtext flex items-center gap-1">
          {subtext}
        </p>
      )}
    </div>
  );
};
