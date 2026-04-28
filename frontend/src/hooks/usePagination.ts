import { useState } from 'react';

export function usePagination(defaultPageSize = 20) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage + 1); // MUI TablePagination is 0-indexed
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1);
  };

  return { page, pageSize, handlePageChange, handlePageSizeChange };
}
