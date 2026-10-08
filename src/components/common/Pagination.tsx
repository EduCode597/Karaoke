import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = '',
}: PaginationProps) {
  const [inputVal, setInputVal] = useState<string>(String(currentPage));

  useEffect(() => {
    setInputVal(String(currentPage));
  }, [currentPage]);

  if (totalPages <= 1 && (!totalItems || totalItems <= 0)) {
    return null;
  }

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
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]" />
          <span>
            Tracks <strong className="text-cyan-300 font-digital">{startItem}</strong> –{' '}
            <strong className="text-cyan-300 font-digital">{endItem}</strong> of{' '}
            <strong className="text-slate-100 font-digital">{totalItems}</strong>
          </span>
        </div>
      ) : (
        <div className="text-xs font-mono text-slate-400">
          Page <strong className="text-cyan-400 font-digital">{currentPage}</strong> of{' '}
          <strong className="text-slate-200 font-digital">{totalPages}</strong>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Segmented Button Enclosure */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-lg backdrop-blur-md">
          {/* Jump to first page */}
          <button
            type="button"
            onClick={() => handlePageSelect(1)}
            disabled={currentPage <= 1}
            aria-label="First page"
            className="p-2 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-900 transition-all touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            onClick={() => handlePageSelect(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all touch-manipulation min-h-[40px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Numbered Page Links */}
          <div className="flex items-center gap-1 mx-1">
            {visiblePages.map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageSelect(pageNum)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-w-[38px] h-10 px-2 rounded-xl font-digital text-sm font-bold transition-all flex items-center justify-center touch-manipulation ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 shadow-neon-cyan scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => handlePageSelect(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all touch-manipulation min-h-[40px]"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Jump to last page */}
          <button
            type="button"
            onClick={() => handlePageSelect(totalPages)}
            disabled={currentPage >= totalPages}
            aria-label="Last page"
            className="p-2 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-900 transition-all touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Direct Jump Input */}
        <form
          onSubmit={handleGoToSubmit}
          className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-md"
        >
          <span className="text-xs font-mono text-slate-400 pl-2">Go to:</span>
          <input
            id="flowbite-page-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={handleGoToSubmit}
            aria-label="Direct page navigation input"
            className="w-12 h-9 text-center rounded-xl bg-slate-900 border border-slate-700/80 text-amber-400 font-digital font-bold text-xs focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-inner"
          />
          <button
            type="submit"
            className="px-3 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs font-bold transition-all active:scale-95 touch-manipulation"
          >
            Jump
          </button>
        </form>
      </div>
    </nav>
  );
}
