import { useState, useRef, useEffect } from "react";

interface TableProps {
  color: string;
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export default function Table({ color, title, columns, rows }: TableProps) {
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [filters, setFilters] = useState<Record<number, Set<string | number>>>({});
  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
  const iconRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Check if click is on a filter icon
        const target = event.target as HTMLElement;
        if (!target.closest("[data-filter-icon]")) {
          setActiveFilter(null);
        }
      }
    };
    if (activeFilter !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeFilter]);

  // Position the dropdown when opening
  useEffect(() => {
    if (activeFilter !== null && iconRefs.current[activeFilter]) {
      const rect = iconRefs.current[activeFilter]!.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.right - 256, // 256 = dropdown width
      });
    }
  }, [activeFilter]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (activeFilter === null) return;
    const reposition = () => {
      if (iconRefs.current[activeFilter]) {
        const rect = iconRefs.current[activeFilter]!.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + 4,
          left: rect.right - 256,
        });
      }
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [activeFilter]);

  const getUniqueValues = (colIndex: number): (string | number)[] => {
    const values = new Set<string | number>();
    rows.forEach((row) => values.add(row[colIndex]));
    return Array.from(values).sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  };

  const filteredRows = rows.filter((row) => {
    return Object.entries(filters).every(([colIndex, selected]) => {
      if (selected.size === 0) return true;
      return selected.has(row[Number(colIndex)]);
    });
  });

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
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h4>
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
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 whitespace-nowrap"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{col}</span>
                    <button
                      ref={(el) => (iconRefs.current[colIdx] = el)}
                      data-filter-icon
                      onClick={() =>
                        setActiveFilter(activeFilter === colIdx ? null : colIdx)
                      }
                      className={`p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-600/70 transition-colors flex-shrink-0 ${
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
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                      </svg>
                    </button>
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
                      className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap"
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

        {/* Dropdown rendered inside the same container, but with high z-index */}
        {activeFilter !== null && (
          <div
            ref={dropdownRef}
            className="fixed z-50 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
          >
            {/* Search input */}
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerms[activeFilter] || ""}
                onChange={(e) =>
                  setSearchTerms((prev) => ({
                    ...prev,
                    [activeFilter]: e.target.value,
                  }))
                }
                className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Select All / Clear */}
            <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between text-xs">
              <button
                onClick={() => {
                  const all = getUniqueValues(activeFilter);
                  setFilters((prev) => ({
                    ...prev,
                    [activeFilter]: new Set(all),
                  }));
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Select All
              </button>
              <button
                onClick={() => clearFilter(activeFilter)}
                className="text-slate-500 dark:text-slate-400 hover:underline"
              >
                Clear
              </button>
            </div>

            {/* Value list */}
            <div className="max-h-56 overflow-y-auto py-1">
              {getUniqueValues(activeFilter)
                .filter((v) =>
                  String(v)
                    .toLowerCase()
                    .includes((searchTerms[activeFilter] || "").toLowerCase())
                )
                .map((value) => {
                  const isSelected =
                    filters[activeFilter]?.has(value) ?? false;
                  return (
                    <label
                      key={String(value)}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-300"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFilterValue(activeFilter, value)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">{String(value)}</span>
                    </label>
                  );
                })}
              {getUniqueValues(activeFilter).filter((v) =>
                String(v)
                  .toLowerCase()
                  .includes((searchTerms[activeFilter] || "").toLowerCase())
              ).length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No values found
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
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

      <div className="text-xs text-slate-500 dark:text-slate-400">
        Showing {searchFilteredRows.length} of {rows.length} records
      </div>
    </div>
  );
}
