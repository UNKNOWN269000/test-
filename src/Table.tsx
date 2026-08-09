import { useState, useRef, useEffect } from "react";

interface TableProps {
  color: string;
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export default function Table({ color, title, columns, rows }: TableProps) {
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [filters, setFilters] = useState<Record<number, Set<string | number>>>({});
  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get unique values for a column
  const getUniqueValues = (colIndex: number): (string | number)[] => {
    const values = new Set<string | number>();
    rows.forEach((row) => values.add(row[colIndex]));
    return Array.from(values).sort();
  };

  // Apply filters to rows
  const filteredRows = rows.filter((row) => {
    return Object.entries(filters).every(([colIndex, selected]) => {
      if (selected.size === 0) return true;
      return selected.has(row[Number(colIndex)]);
    });
  });

  // Apply search term filter
  const searchFilteredRows = filteredRows.filter((row) => {
    return Object.entries(searchTerms).every(([colIndex, term]) => {
      if (!term) return true;
      return String(row[Number(colIndex)])
        .toLowerCase()
        .includes(term.toLowerCase());
    });
  });

  const toggleFilterValue = (colIndex: number, value: string | number) => {
    setFilters((prev) => {
      const current = new Set(prev[colIndex] || []);
      if (current.has(value)) {
        current.delete(value);
      } else {
        current.add(value);
      }
      return { ...prev, [colIndex]: current };
    });
  };

  const clearFilter = (colIndex: number) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[colIndex];
      return next;
    });
    setSearchTerms((prev) => {
      const next = { ...prev };
      delete next[colIndex];
      return next;
    });
  };

  const isColumnFiltered = (colIndex: number) => {
    return (filters[colIndex]?.size ?? 0) > 0 || !!searchTerms[colIndex];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h4>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 text-sm font-medium rounded-lg text-white"
            style={{ backgroundColor: color }}
          >
            Add New
          </button>
          <button className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full">
          <thead style={{ backgroundColor: `${color}15` }}>
            <tr>
              {columns.map((col, colIdx) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{col}</span>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFilter(activeFilter === colIdx ? null : colIdx);
                        }}
                        className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors ${
                          isColumnFiltered(colIdx)
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                        aria-label={`Filter ${col}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                      </button>

                      {activeFilter === colIdx && (
                        <div
                          ref={filterRef}
                          className="absolute right-0 top-full mt-1 z-20 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Search input */}
                          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={searchTerms[colIdx] || ""}
                              onChange={(e) =>
                                setSearchTerms((prev) => ({
                                  ...prev,
                                  [colIdx]: e.target.value,
                                }))
                              }
                              className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          {/* Select All / None */}
                          <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between text-xs">
                            <button
                              onClick={() => {
                                const all = getUniqueValues(colIdx);
                                setFilters((prev) => ({
                                  ...prev,
                                  [colIdx]: new Set(all),
                                }));
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Select All
                            </button>
                            <button
                              onClick={() => {
                                setFilters((prev) => {
                                  const next = { ...prev };
                                  delete next[colIdx];
                                  return next;
                                });
                              }}
                              className="text-slate-500 dark:text-slate-400 hover:underline"
                            >
                              Clear
                            </button>
                          </div>

                          {/* Value list */}
                          <div className="max-h-56 overflow-y-auto py-1">
                            {getUniqueValues(colIdx)
                              .filter((v) =>
                                String(v)
                                  .toLowerCase()
                                  .includes(
                                    (searchTerms[colIdx] || "").toLowerCase()
                                  )
                              )
                              .map((value) => {
                                const isSelected =
                                  filters[colIdx]?.has(value) ?? false;
                                return (
                                  <label
                                    key={String(value)}
                                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-300"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() =>
                                        toggleFilterValue(colIdx, value)
                                      }
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="truncate">
                                      {String(value)}
                                    </span>
                                  </label>
                                );
                              })}
                            {getUniqueValues(colIdx).filter((v) =>
                              String(v)
                                .toLowerCase()
                                .includes(
                                  (searchTerms[colIdx] || "").toLowerCase()
                                )
                            ).length === 0 && (
                              <div className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                                No values found
                              </div>
                            )}
                          </div>

                          {/* Apply / Clear footer */}
                          <div className="p-2 border-t border-slate-200 dark:border-slate-700 flex justify-between gap-2">
                            <button
                              onClick={() => clearFilter(colIdx)}
                              className="flex-1 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              Clear
                            </button>
                            <button
                              onClick={() => setActiveFilter(null)}
                              className="flex-1 px-3 py-1.5 text-xs font-medium rounded text-white"
                              style={{ backgroundColor: color }}
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {searchFilteredRows.length > 0 ? (
              searchFilteredRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Showing {searchFilteredRows.length} of {rows.length} records
      </div>
    </div>
  );
}
