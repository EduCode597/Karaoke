import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

/**
 * Flowbite "Pagination with input" component styled for PinoyVideoke.
 * Supports segmented previous/next navigation, windowed numbered page buttons,
 * and a direct "Go to [ ] page" input field.
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = '',
}: PaginationProps) {
  const [inputVal, setInputVal] = useState<string>(String(currentPage));

  // Sync internal input display whenever currentPage updates
  useEffect(() => {
    setInputVal(String(currentPage));
  }, [currentPage]);

  if (totalPages <= 1 && (!totalItems || totalItems <= 0)) {
    return null;
  }

  // Calculate sliding 5-page window (matches Flowbite pagination preview)
  const getVisiblePages = (): number[] => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageSelect = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleGoToSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputVal.trim(), 10);
    if (!isNaN(parsed)) {
      const target = Math.max(1, Math.min(totalPages, parsed));
      onPageChange(target);
      setInputVal(String(target));
    } else {
      setInputVal(String(currentPage));
    }
  };

  const visiblePages = getVisiblePages();

  // Item bounds readout
  const startItem = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : undefined;
  const endItem =
    itemsPerPage && totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : undefined;

  return (
    <nav
      aria-label="Songbook pagination navigation"
      className={`w-full flex flex-col md:flex-row items-center justify-between gap-4 py-2 select-none ${className}`}
    >
      {/* Track Range Summary */}
      {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-cyan-400 font-bold">{startItem}</span>-
          <span className="text-cyan-400 font-bold">{endItem}</span> of{' '}
          <span className="text-slate-200 font-bold">{totalItems}</span> tracks
        </div>
      ) : (
        <div className="text-xs font-mono text-slate-400">
          Page <span className="text-cyan-400 font-bold">{currentPage}</span> of{' '}
          <span className="text-slate-200 font-bold">{totalPages}</span>
        </div>
      )}

      {/* Flowbite Pagination Component with Input */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {/* Segmented Page Button Group (-space-x-px) */}
        <ul className="flex items-center -space-x-px text-xs sm:text-sm font-mono shadow-md rounded-xl overflow-hidden border border-slate-800">
          {/* Previous Button */}
          <li>
            <button
              type="button"
              onClick={() => handlePageSelect(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className={`flex items-center justify-center gap-1 px-3 sm:px-3.5 h-9 border-r border-slate-800 transition-colors ${
                currentPage <= 1
                  ? 'bg-slate-950/70 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden min-[400px]:inline">Previous</span>
            </button>
          </li>

          {/* Numbered Page Links */}
          {visiblePages.map((pageNum) => {
            const isActive = pageNum === currentPage;
            return (
              <li key={pageNum}>
                <button
                  type="button"
                  onClick={() => handlePageSelect(pageNum)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-center min-w-[36px] sm:min-w-[40px] h-9 px-2 sm:px-3 border-r border-slate-800 text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'z-10 bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold shadow-neon-cyan'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              </li>
            );
          })}

          {/* Next Button */}
          <li>
            <button
              type="button"
              onClick={() => handlePageSelect(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className={`flex items-center justify-center gap-1 px-3 sm:px-3.5 h-9 transition-colors ${
                currentPage >= totalPages
                  ? 'bg-slate-950/70 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700'
              }`}
            >
              <span className="hidden min-[400px]:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </li>
        </ul>

        {/* Flowbite "Go to [ 99 ] page" Input Field */}
        <form onSubmit={handleGoToSubmit} className="flex items-center space-x-2">
          <label
            htmlFor="flowbite-page-input"
            className="text-xs sm:text-sm font-medium text-slate-400 shrink-0 font-mono"
          >
            Go to
          </label>
          <input
            id="flowbite-page-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={handleGoToSubmit}
            aria-label="Direct page navigation input"
            className="w-11 sm:w-12 h-9 text-center rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-digital font-bold text-xs sm:text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-inner"
          />
          <span className="text-xs sm:text-sm font-medium text-slate-400 shrink-0 font-mono">
            page
          </span>
          <button
            type="submit"
            className="px-2.5 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 font-mono text-xs font-bold transition-all active:scale-95"
            title="Navigate to page"
          >
            Go
          </button>
        </form>
      </div>
    </nav>
  );
}
