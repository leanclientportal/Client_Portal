import { useState, useMemo, useEffect } from 'react';

type SortDirection = 'asc' | 'desc';

interface Sorting<T> {
  column: keyof T;
  direction: SortDirection;
}

interface Pagination {
  pageIndex: number;
  pageSize: number;
}

interface UseTableProps<T> {
  initialData: T[];
  initialSorting?: Sorting<T>;
  initialPagination?: Pagination;
}

export function useTable<T>({
  initialData,
  initialSorting,
  initialPagination = { pageIndex: 0, pageSize: 5 },
}: UseTableProps<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [sorting, setSorting] = useState<Sorting<T> | undefined>(initialSorting);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);

  const sortedData = useMemo(() => {
    if (!sorting) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sorting.column];
      const bValue = b[sorting.column];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sorting.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      if (aValue < bValue) {
        return sorting.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sorting.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sorting]);

  const paginatedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, pagination]);

  const handleSort = (column: keyof T) => {
    setSorting(currentSorting => {
      if (currentSorting && currentSorting.column === column && currentSorting.direction === 'asc') {
        return { column, direction: 'desc' };
      }
      return { column, direction: 'asc' };
    });
  };

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const pageCount = Math.ceil(data.length / pagination.pageSize);

  const setPageIndex = (index: number) => {
    setPagination(p => ({ ...p, pageIndex: index }));
  };

  const nextPage = () => {
    setPagination(p => ({ ...p, pageIndex: Math.min(p.pageIndex + 1, pageCount - 1) }));
  };

  const previousPage = () => {
    setPagination(p => ({ ...p, pageIndex: Math.max(p.pageIndex - 1, 0) }));
  };

  const canNextPage = pagination.pageIndex < pageCount - 1;
  const canPreviousPage = pagination.pageIndex > 0;
  
  const setPageSize = (size: number) => {
    setPagination({ pageIndex: 0, pageSize: size });
  };

  return {
    tableData: paginatedData,
    sorting,
    handleSort,
    pagination,
    setPageIndex,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageCount,
    setPageSize,
    totalCount: data.length,
  };
}
