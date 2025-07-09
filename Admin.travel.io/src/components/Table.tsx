import React, { useState } from 'react';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any, row?: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  title?: string;
  onExport?: () => void;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  isLoading = false,
  title,
  onExport,
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  // const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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

  // // Search logic
  // const filteredData = React.useMemo(() => {
  //   if (!searchTerm) return sortedData;

  //   return sortedData.filter((row) =>
  //     Object.values(row).some(
  //       (value) =>
  //         value &&
  //         value.toString().toLowerCase().includes(searchTerm.toLowerCase())
  //     )
  //   );
  // }, [sortedData, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          {/* <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div> */}
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
            {Math.min(startIndex + rowsPerPage, data.length)} of{' '}
            {data.length} results
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
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
                  onClick={() => handlePageChange(page)}
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
              onClick={() => handlePageChange(currentPage + 1)}
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