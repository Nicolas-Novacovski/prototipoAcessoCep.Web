import React from 'react';
import Button from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) {
    return null;
  }

  // Logic to create page numbers with ellipses
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

      if (currentPage <= halfPagesToShow) {
        endPage = maxPagesToShow;
      }

      if (currentPage + halfPagesToShow >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
      }
      
      if (startPage > 1) {
          pageNumbers.push(1);
          if (startPage > 2) {
              pageNumbers.push('...');
          }
      }
      
      for (let i = startPage; i <= endPage; i++) {
          pageNumbers.push(i);
      }

      if (endPage < totalPages) {
          if (endPage < totalPages - 1) {
              pageNumbers.push('...');
          }
          pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className={`flex items-center justify-between border-t border-gray-200 dark:border-slate-700 px-4 py-3 sm:px-6 ${className}`} aria-label="Pagination">
      <div className="flex-1 flex justify-between sm:justify-end">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="secondary"
          size="sm"
        >
          Anterior
        </Button>
        <div className="hidden sm:flex sm:items-center sm:ml-4">
          {pageNumbers.map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={`${page}-${index}`}
                onClick={() => onPageChange(page)}
                className={`mx-1 px-3 py-1 text-sm rounded-md ${
                  currentPage === page
                    ? 'bg-cep-primary text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={`ellipsis-${index}`} className="mx-1 px-3 py-1 text-sm text-gray-500">
                {page}
              </span>
            )
          )}
        </div>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="secondary"
          size="sm"
          className="ml-3"
        >
          Próximo
        </Button>
      </div>
    </nav>
  );
};

export default Pagination;
