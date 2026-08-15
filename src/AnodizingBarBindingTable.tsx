import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { exportToCSV } from "./csvExport";
import HiTechLoader from "./HiTechLoader";

interface Props { searchTerm?: string; }

interface Data {
  id: number;
  binding_date: string | null;
  extrusion_date: string | null;
  billet_batch: string | null;
  die_no: string | null;
  profile: string | null;
  bucket_no: string | null;
  surface: string | null;
  full_rack_no: string | null;
  one_full_rack_qty: string | null;
  pcs_rack_no: string | null;
  pcs_qty: string | null;
  surface2: string | null;
  full_rack_no2: string | null;
  one_full_rack_qty2: string | null;
  pcs_rack_no2: string | null;
  pcs_qty2: string | null;
  total_binding_qty: string | null;
  type: string | null;
  binding_team: string | null;
  average_time: string | null;
  rejection_qty: string | null;
  operator: string | null;
}

type ColumnKey = keyof Omit<Data, "id">;

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "binding_date", label: "Binding Date" },
  { key: "extrusion_date", label: "Extrusion Date" },
  { key: "billet_batch", label: "Billet Batch" },
  { key: "die_no", label: "Die No" },
  { key: "profile", label: "Profile" },
  { key: "bucket_no", label: "Bucket No" },
  { key: "surface", label: "Surface" },
  { key: "full_rack_no", label: "Full Rack No" },
  { key: "one_full_rack_qty", label: "1 Full Rack Qty" },
  { key: "pcs_rack_no", label: "PCS Rack No" },
  { key: "pcs_qty", label: "PCS Qty" },
  { key: "surface2", label: "Surface 2" },
  { key: "full_rack_no2", label: "Full Rack No 2" },
  { key: "one_full_rack_qty2", label: "1 Full Rack Qty 2" },
  { key: "pcs_rack_no2", label: "PCS Rack No 2" },
  { key: "pcs_qty2", label: "PCS Qty 2" },
  { key: "total_binding_qty", label: "Total Binding Qty" },
  { key: "type", label: "Type" },
  { key: "binding_team", label: "Binding Team" },
  { key: "average_time", label: "Average Time" },
  { key: "rejection_qty", label: "Rejection Qty" },
  { key: "operator", label: "Operator" },
];

const EXPORT_COLUMNS = COLUMNS.map((c) => c.key);

// Group header definitions - MUST sum to COLUMNS.length (22)
const COLUMN_GROUPS = [
  { label: "Basic Info", colSpan: 7 },   // binding_date, extrusion_date, billet_batch, die_no, profile, bucket_no, surface
  { label: "Surface 1", colSpan: 4 },    // full_rack_no, one_full_rack_qty, pcs_rack_no, pcs_qty
  { label: "Surface 2", colSpan: 4 },    // surface2, full_rack_no2, one_full_rack_qty2, pcs_rack_no2, pcs_qty2  -> wait, 5
];
// Correction: Surface 2 group has 5 fields, so:
// Basic Info (7) + Surface 1 (4) + Surface 2 (5) + Summary (6) = 22
const CORRECTED_GROUPS = [
  { label: "Basic Info", colSpan: 7 },
  { label: "Surface 1", colSpan: 4 },
  { label: "Surface 2", colSpan: 5 },
  { label: "Summary", colSpan: 6 },
];

export default function AnodizingBarBindingTable({ searchTerm = "" }: Props) {
  const [data, setData] = useState<Data[]>([]);
  const [filteredData, setFilteredData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateField, setDateField] = useState<"binding_date" | "extrusion_date">("binding_date");

  // Column filter state
  const [columnFilters, setColumnFilters] = useState<Record<string, Set<string>>>({});
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const iconRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => { applyFilters(); }, [startDate, endDate, dateField, data, columnFilters, searchTerm]);

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
      setError(null);
      const { data: d, error: e } = await supabase
        .from("anodizing_binding")
        .select("*")
        .order("binding_date", { ascending: false });
      if (e) { setError(e.message); }
      else { setData(d || []); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally { setLoading(false); }
  };

  // Convert any column value to its display string for filtering
  const valueToFilterString = (key: ColumnKey, row: Data): string => {
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

    if (startDate) filtered = filtered.filter((row) => (row[dateField] || "") >= startDate);
    if (endDate) filtered = filtered.filter((row) => (row[dateField] || "") <= endDate);

    filtered = filtered.filter((row) =>
      Object.entries(columnFilters).every(([key, selected]) => {
        if (selected.size === 0) return true;
        return selected.has(valueToFilterString(key as ColumnKey, row));
      })
    );

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(lower))
      );
    }

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
    exportToCSV(filteredData, "anodizing_binding", EXPORT_COLUMNS);
  };

  if (loading) return <HiTechLoader text="Loading Anodizing Bar Binding" />;
  if (error) return (
    <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
      <p className="text-red-800 dark:text-red-300"><strong>Error:</strong> {error}</p>
      <button
        onClick={fetchData}
        className="mt-3 px-4 py-2 text-sm font-medium rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60"
      >
        Retry
      </button>
    </div>
  );

  const hasAnyFilter = startDate || endDate || Object.keys(columnFilters).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Anodizing Bar Binding Records</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Total records: {filteredData.length} {data.length !== filteredData.length && `(of ${data.length})`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={dateField}
            onChange={(e) => setDateField(e.target.value as "binding_date" | "extrusion_date")}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="binding_date">Binding Date</option>
            <option value="extrusion_date">Extrusion Date</option>
          </select>

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
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-20 bg-slate-800">
                <tr>
                  {CORRECTED_GROUPS.map((g, i) => (
                    <th
                      key={i}
                      colSpan={g.colSpan}
                      className={`px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-white ${
                        i < CORRECTED_GROUPS.length - 1 ? "border-r border-slate-600" : ""
                      }`}
                    >
                      {g.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  {COLUMNS.map(({ key, label }) => {
                    const filtered = isColumnFiltered(key);
                    return (
                      <th key={key} className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap border-r border-slate-600">
                        <div className="flex items-center justify-between gap-1">
                          <span>{label}</span>
                          <button
                            ref={(el) => { iconRefs.current[key] = el; }}
                            data-filter-icon
                            onClick={() => setActiveFilter(activeFilter === key ? null : key)}
                            className={`p-0.5 rounded transition-colors flex-shrink-0 ${
                              filtered
                                ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                                : "text-slate-300 hover:bg-slate-700 hover:text-white"
                            }`}
                            aria-label={`Filter ${label}`}
                            title={`Filter ${label}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
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
                  <tr key={row.id ?? idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.binding_date || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.extrusion_date || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.billet_batch || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.die_no || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.profile || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.bucket_no || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.surface || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.full_rack_no || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.one_full_rack_qty || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.pcs_rack_no || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.pcs_qty || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.surface2 || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.full_rack_no2 || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.one_full_rack_qty2 || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.pcs_rack_no2 || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.pcs_qty2 || "—"}</td>
                    <td className="px-2 py-2 font-medium text-slate-900 dark:text-white whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.total_binding_qty || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.type || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.binding_team || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.average_time || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.rejection_qty || "—"}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.operator || "—"}</td>
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
