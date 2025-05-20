import React, { useState, useMemo } from "react";
import Button from "./Button";

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  render?: (row: T, rowIndex: number) => React.ReactNode;
  sortable?: boolean;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey?: (row: T, rowIndex: number) => React.Key;
  className?: string;
  style?: React.CSSProperties;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  searchableKeys?: (keyof T | string)[];
}

export default function Table<T = any>({
  columns,
  data,
  rowKey,
  className,
  style,
  pageSizeOptions = [5, 10, 20, 50],
  defaultPageSize = 10,
}: TableProps<T>) {
  // Per-column search state
  const [columnSearch, setColumnSearch] = useState<{ [key: string]: string }>(
    () =>
      columns.reduce((acc, col) => {
        if (!col.render) acc[col.key as string] = "";
        return acc;
      }, {} as { [key: string]: string })
  );
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Search logic (per column, skip render columns)
  const filteredData = useMemo(() => {
    let filtered = data;
    Object.entries(columnSearch).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) =>
          String((row as any)[key] ?? "")
            .toLowerCase()
            .includes(value.toLowerCase())
        );
      }
    });
    return filtered;
  }, [data, columnSearch]);

  // Sort logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortKey];
      const bValue = (b as any)[sortKey];
      if (aValue === bValue) return 0;
      if (sortDir === "asc") return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });
  }, [filteredData, sortKey, sortDir]);

  // Pagination logic
  const pagedData = useMemo(() => {
    const start = page * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  // Handle sort click (move to th's onClick)
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  // Handle page change
  const totalPages = Math.ceil(sortedData.length / pageSize);

  return (
    <div style={{ overflowX: "auto", ...style }} className={className}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key as string}
                style={{
                  padding: "10px 12px",
                  borderBottom: "2px solid #e0e0e0",
                  background: "#f5f7fa",
                  textAlign: "left",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: col.sortable ? "pointer" : undefined,
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  position: "relative", // Add this for icon alignment
                }}
                onClick={col.sortable ? () => handleSort(col.key as string) : undefined}
              >
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  {col.label}
                  {col.sortable && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 15,
                        width: 20,
                        display: "inline-block",
                        color: sortKey === col.key ? "#1976d2" : "#bbb",
                        fontWeight: sortKey === col.key ? 700 : 400,
                        verticalAlign: "middle",
                      }}
                    >
                      {sortKey === col.key
                        ? sortDir === "asc"
                          ? "▲"
                          : "▼"
                        : "⇅"}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
          <tr>
            {columns.map((col) =>
              !col.render ? (
                <th key={col.key as string} style={{ background: "#fafbfc", padding: "4px 12px" }}>
                  <input
                    type="text"
                    placeholder={`Search ${col.label}`}
                    value={columnSearch[col.key as string] || ""}
                    onChange={e => {
                      setColumnSearch(cs => ({
                        ...cs,
                        [col.key as string]: e.target.value,
                      }));
                      setPage(0);
                    }}
                    style={{
                      width: "90%",
                      padding: "4px 6px",
                      borderRadius: 4,
                      border: "1px solid #e0e0e0",
                      fontSize: 14,
                    }}
                  />
                </th>
              ) : (
                <th key={col.key as string} />
              )
            )}
          </tr>
        </thead>
        <tbody>
          {pagedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 16, textAlign: "center", color: "#888" }}>
                No data
              </td>
            </tr>
          ) : (
            pagedData.map((row, rowIndex) => (
              <tr
                key={rowKey ? rowKey(row, rowIndex + page * pageSize) : rowIndex + page * pageSize}
                style={{
                  background: (rowIndex + page * pageSize) % 2 === 0 ? "#fff" : "#f9f9f9",
                  transition: "background 0.2s",
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key as string}
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: 14,
                    }}
                  >
                    {col.render
                      ? col.render(row, rowIndex + page * pageSize)
                      : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Pagination */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginTop: 14 }}>
        <span style={{ fontSize: 14 }}>
          Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
        </span>
        <Button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{
            padding: "4px 10px",
            borderRadius: 4,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: page === 0 ? "not-allowed" : "pointer",
            opacity: page === 0 ? 0.5 : 1,
          }}
        >
          Prev
        </Button>
        <Button
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          style={{
            padding: "4px 10px",
            borderRadius: 4,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
            opacity: page >= totalPages - 1 ? 0.5 : 1,
          }}
        >
          Next
        </Button>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(0);
          }}
          style={{
            marginLeft: 8,
            padding: "4px 8px",
            borderRadius: 4,
            border: "1px solid #ccc",
            fontSize: 14,
          }}
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}