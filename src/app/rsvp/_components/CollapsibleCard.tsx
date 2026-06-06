'use client';

import { useState } from 'react';

export default function CollapsibleCard({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
      <div className="flex justify-end px-4 pt-3">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 select-none"
          aria-label={collapsed ? 'Expand' : 'Minimise'}
        >
          {collapsed ? 'Show' : 'Hide'}
          <span
            className="inline-block transition-transform duration-300"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▾
          </span>
        </button>
      </div>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: collapsed ? 0 : '2000px' }}
      >
        {children}
      </div>
    </div>
  );
}
