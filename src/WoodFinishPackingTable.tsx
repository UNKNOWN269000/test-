import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { exportToCSV } from "./csvExport";
import HiTechLoader from "./HiTechLoader";

interface Props { searchTerm?: string; }
interface Data { wood_prod_date: string; packing_date: string; wood_finish_type: string; length: string; profile: string; main_pack_no: string | null; main_one_qty: string | null; main_total_bundle: string | null; main_total_qty: string | null; main_avg_weight: string | null; pcs_enabled: boolean | null; pcs_pack_no: string | null; pcs_one_qty: string | null; pcs_total_qty: string | null; pcs_avg_weight: string | null; }

type ColumnKey = keyof Data;

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "wood_prod_date", label: "Wood Prod Date" },
  { key: "packing_date", label: "Packing Date" },
  { key: "wood_finish_type", label: "Wood Finish Type" },
  { key: "length", label: "Length (m)" },
  { key: "profile", label: "Profile" },
  { key: "main_pack_no", label: "Pack No" },
  { key: "main_one_qty", label: "1 Qty" },
  { key: "main_total_bundle", label: "Total Bundle" },
  { key: "main_total_qty", label: "Total Qty" },
  { key: "main_avg_weight", label: "Avg Weight" },
  { key: "pcs_pack_no", label: "Pack No" },
  { key: "pcs_one_qty", label: "1 Qty" },
  { key: "pcs_total_qty", label: "Total Qty" },
  { key: "pcs_avg_weight", label: "Avg Weight" },
];

// Map of "enabled" flags to their respective value columns
const ENABLED_FLAGS: Record<string, ColumnKey> = {
  pcs_pack_no: "pcs_enabled",
  pcs_one_qty: "pcs_enabled",
  pcs_total_qty: "pcs_enabled",
  pcs_avg_weight: "pcs_enabled",
};

export default function WoodFinishPackingTable({ searchTerm = "" }: Props) {
  const [data, setData] = useState<Data[]>([]);
  const [filteredData, setFilteredData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Column filter state
  const [columnFilters, setColumnFilters] = useState<Record<string, Set<string>>>({});
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const iconRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => { applyFilters(); }, [startDate, endDate, data, columnFilters]);

  useEffect(() => {
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = data.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(lowerSearch)
        )
      );
      applyFiltersToRows(filtered);
    } else {
      applyFilters();
    }
  }, [searchTerm]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  // Position dropdown
  useEffect(() => {
    if (activeFilter && iconRefs.current[activeFilter]) {
      const reposition = () => {
        const rect = iconRefs.current[activeFilter]?.getBoundingClientRect();
        if (rect) {
          setDropdownPos({ top: rect.bottom + 6, left: Math.max(8, rect.right - 256) });
        }
      };
      reposition();
      window.addEventListener("scroll", reposition, true);
      window.addEventListener("resize", reposition);
      return () => {
        window.removeEventListener("scroll", reposition, true);
        window.removeEventListener("resize", reposition);
      };
    }
  }, [activeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: d, error: e } = await supabase
        .from("wood_finish_packing")
        .select("*")
        .order("packing_date", { ascending: false });
      if (e) { setError(e.message); }
      else { setData(d || []); setFilteredData(d || []); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally { setLoading(false); }
  };

  // Convert any column value to its display string for filtering
  // For columns gated by an *_enabled flag, disabled rows show as "—"
  const valueToFilterString = (key: ColumnKey, row: Data): string => {
    const enabledKey = ENABLED_FLAGS[key];
    if (enabledKey && !row[enabledKey]) return "—";
    const v = row[key];
    if (v === null || v === undefined || v === "") return "—";
    return String(v);
  };

  // Get unique values for a column
  const getUniqueValues = (key: ColumnKey): string[] => {
    const values = new Set<string>();
    data.forEach((row) => values.add(valueToFilterString(key, row)));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  };

  // Apply all filters (date + column + search)
  const applyFilters = () => {
    let filtered = [...data];
    if (startDate) filtered = filtered.filter((row) => row.packing_date >= startDate);
    if (endDate) filtered = filtered.filter((row) => row.packing_date <= endDate);
    filtered = filtered.filter((row) =>
      Object.entries(columnFilters).every(([key, selected]) => {
        if (selected.size === 0) return true;
        return selected.has(valueToFilterString(key as ColumnKey, row));
      })
    );
    setFilteredData(filtered);
  };

  const applyFiltersToRows = (rows: Data[]) => {
    let filtered = [...rows];
    if (startDate) filtered = filtered.filter((row) => row.packing_date >= startDate);
    if (endDate) filtered = filtered.filter((row) => row.packing_date <= endDate);
    filtered = filtered.filter((row) =>
      Object.entries(columnFilters).every(([key, selected]) => {
        if (selected.size === 0) return true;
        return selected.has(valueToFilterString(key as ColumnKey, row));
      })
    );
    setFilteredData(filtered);
  };

  const toggleFilterValue = (key: string, value: string) => {
    setColumnFilters((prev) => {
      const current = new Set(prev[key] || []);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      return { ...prev, [key]: current };
    });
  };

  const clearColumnFilter = (key: string) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setColumnSearch((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const isColumnFiltered = (key: string) => (columnFilters[key]?.size ?? 0) > 0;

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setColumnFilters({});
    setColumnSearch({});
  };

  const handleExport = () => {
    const exportData = filteredData.map((row) => ({
      wood_prod_date: row.wood_prod_date,
      packing_date: row.packing_date,
      wood_finish_type: row.wood_finish_type,
      length: row.length,
      profile: row.profile,
      main_pack_no: row.main_pack_no,
      main_one_qty: row.main_one_qty,
      main_total_bundle: row.main_total_bundle,
      main_total_qty: row.main_total_qty,
      main_avg_weight: row.main_avg_weight,
      pcs_pack_no: row.pcs_enabled ? row.pcs_pack_no : null,
      pcs_one_qty: row.pcs_enabled ? row.pcs_one_qty : null,
      pcs_total_qty: row.pcs_enabled ? row.pcs_total_qty : null,
      pcs_avg_weight: row.pcs_enabled ? row.pcs_avg_weight : null,
    }));
    exportToCSV(exportData, "wood_finish_packing");
  };

  if (loading) return <HiTechLoader text="Loading Wood Finish Packing" />;
  if (error) return (
    <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
      <p className="text-red-800 dark:text-red-300"><strong>Error:</strong> {error}</p>
    </div>
  );

  const hasAnyFilter = startDate || endDate || Object.keys(columnFilters).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Wood Finish Packing Records</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Total records: {filteredData.length} {data.length !== filteredData.length && `(of ${data.length})`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">From:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">To:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {hasAnyFilter && (
            <button onClick={clearFilters}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600">
              Clear
            </button>
          )}
          <button onClick={fetchData}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors">
            Refresh
          </button>
          <button onClick={handleExport}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            Export CSV
          </button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            {data.length === 0 ? "No records found." : "No records match the selected filters."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
            <table className="w-full">
              <thead className="sticky top-0 z-20 bg-slate-800">
                <tr>
                  <th colSpan={5} className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-white border-r border-slate-600">Basic Info</th>
                  <th colSpan={5} className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-white border-r border-slate-600">Main Pack</th>
                  <th colSpan={4} className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-white">PCS Pack</th>
                </tr>
                <tr>
                  {COLUMNS.map(({ key, label }) => {
                    const filtered = isColumnFiltered(key);
                    return (
                      <th key={key} className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap border-r border-slate-600">
                        <div className="flex items-center justify-between gap-2">
                          <span>{label}</span>
                          <button
                            ref={(el) => { iconRefs.current[key] = el; }}
                            data-filter-icon
                            onClick={() => setActiveFilter(activeFilter === key ? null : key)}
                            className={`p-1 rounded transition-colors flex-shrink-0 ${
                              filtered
                                ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                                : "text-slate-300 hover:bg-slate-700 hover:text-white"
                            }`}
                            aria-label={`Filter ${label}`}
                            title={`Filter ${label}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                            </svg>
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.wood_prod_date}</td>
                    <td className="px-3 py-3 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.packing_date}</td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.wood_finish_type}</td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.length}</td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.profile}</td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.main_pack_no || "—"}</td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.main_one_qty || "—"}</td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.main_total_bundle || "—"}</td>
                    <td className="px-3 py-3 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.main_total_qty || "—"}</td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.main_avg_weight || "—"}</td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.pcs_enabled ? (row.pcs_pack_no || "—") : "—"}</td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.pcs_enabled ? (row.pcs_one_qty || "—") : "—"}</td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.pcs_enabled ? (row.pcs_total_qty || "—") : "—"}</td>
                    <td className="px-3 py-3 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">{row.pcs_enabled ? (row.pcs_avg_weight || "—") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating filter dropdown - rendered outside the table to escape overflow */}
      {activeFilter && (
        <div
          ref={dropdownRef}
          className="fixed z-50 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <input
              type="text"
              placeholder="Search values..."
              value={columnSearch[activeFilter] || ""}
              onChange={(e) => setColumnSearch((prev) => ({ ...prev, [activeFilter]: e.target.value }))}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between text-xs">
            <button
              onClick={() => {
                const all = getUniqueValues(activeFilter as ColumnKey);
                setColumnFilters((prev) => ({ ...prev, [activeFilter]: new Set(all) }));
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Select All
            </button>
            <button
              onClick={() => clearColumnFilter(activeFilter)}
              className="text-slate-500 dark:text-slate-400 hover:underline"
            >
              Clear
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {(() => {
              const allValues = getUniqueValues(activeFilter as ColumnKey);
              const term = (columnSearch[activeFilter] || "").toLowerCase();
              const matches = allValues.filter((v) => v.toLowerCase().includes(term));
              if (matches.length === 0) {
                return (
                  <div className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    No values found
                  </div>
                );
              }
              return matches.map((value) => {
                const isSelected = columnFilters[activeFilter]?.has(value) ?? false;
                return (
                  <label
                    key={value}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFilterValue(activeFilter, value)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="truncate">{value}</span>
                  </label>
                );
              });
            })()}
          </div>

          <div className="p-2 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
            <button
              onClick={() => setActiveFilter(null)}
              className="px-4 py-1.5 text-xs font-medium rounded text-white bg-slate-700 hover:bg-slate-600"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
