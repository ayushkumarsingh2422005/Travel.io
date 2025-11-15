import React, { useState } from 'react';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any, row?: any) => React.ReactNode;
}

interface PaginationProps {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

interface TableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  title?: string;
  onExport?: () => void;
  pagination?: PaginationProps; 
  onPageChange?: (newPage: number) => void; 
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  isLoading = false,
  title,
  onExport,
  pagination,
  onPageChange,
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Determine pagination values based on props or internal defaults
  const currentPage = pagination?.current_page || 1;
  const rowsPerPage = pagination?.per_page || 10;
  const totalItems = pagination?.total || data.length;
  const totalPages = pagination?.total_pages || Math.ceil(data.length / rowsPerPage);

  // Sorting logic
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null) return 1;
      if (bValue === null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });
  }, [data, sortConfig]);

  // Pagination logic (now uses data directly, as filtering is handled externally)
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleSort = (columnId: string) => {
    setSortConfig((prevSort) => {
      if (!prevSort || prevSort.key !== columnId) {
        return { key: columnId, direction: 'asc' };
      }
      if (prevSort.direction === 'asc') {
        return { key: columnId, direction: 'desc' };
      }
      return null;
    });
  };

  const handleInternalPageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      // If no external handler, component manages its own page state (though not ideal with external data)
      // For now, we'll just log a warning if this happens without an external handler
      console.warn("Table component is trying to change page internally without an 'onPageChange' prop. Ensure pagination is handled externally.");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-16 bg-gray-100 rounded-t-2xl" />
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="h-16 bg-gray-50 border-t border-gray-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      </div>

      {/* Table for desktop and tablet */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    style={{ minWidth: column.minWidth }}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleSort(column.id)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortConfig?.key === column.id && (
                        <svg
                          className={`w-4 h-4 transform ${
                            sortConfig.direction === 'desc' ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className="px-6 py-4 text-sm text-gray-900"
                    >
                      {column.format
                        ? column.format(row[column.id], row)
                        : row[column.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card view for mobile */}
      <div className="sm:hidden divide-y divide-gray-100 max-w-full">
        {paginatedData.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="p-4 hover:bg-gray-50 transition-colors duration-200 space-y-3"
          >
            {columns.map((column) => (
              <div key={column.id} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">
                  {column.label}
                </span>
                <div className="text-sm text-gray-900 text-right">
                  {column.format
                    ? column.format(row[column.id], row)
                    : row[column.id]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Showing {startIndex + 1} to{' '}
            {Math.min(startIndex + rowsPerPage, totalItems)} of{' '}
            {totalItems} results
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handleInternalPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                currentPage === 1
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === currentPage;
              const isNearCurrentPage =
                Math.abs(page - currentPage) <= 1 ||
                page === 1 ||
                page === totalPages;

              if (!isNearCurrentPage) {
                if (
                  (page === 2 && currentPage > 3) ||
                  (page === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return (
                    <span
                      key={page}
                      className="px-4 py-2 text-gray-500 text-sm"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => handleInternalPageChange(page)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    isCurrentPage
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => handleInternalPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                currentPage === totalPages
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
