import { useState, useEffect } from "react";
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

const ALL_COLUMNS = [
  "binding_date",
  "extrusion_date",
  "billet_batch",
  "die_no",
  "profile",
  "bucket_no",
  "surface",
  "full_rack_no",
  "one_full_rack_qty",
  "pcs_rack_no",
  "pcs_qty",
  "surface2",
  "full_rack_no2",
  "one_full_rack_qty2",
  "pcs_rack_no2",
  "pcs_qty2",
  "total_binding_qty",
  "type",
  "binding_team",
  "average_time",
  "rejection_qty",
  "operator",
];

const COLUMN_HEADERS = [
  "Binding Date",
  "Extrusion Date",
  "Billet Batch",
  "Die No",
  "Profile",
  "Bucket No",
  "Surface",
  "Full Rack No",
  "1 Full Rack Qty",
  "PCS Rack No",
  "PCS Qty",
  "Surface 2",
  "Full Rack No 2",
  "1 Full Rack Qty 2",
  "PCS Rack No 2",
  "PCS Qty 2",
  "Total Binding Qty",
  "Type",
  "Binding Team",
  "Average Time",
  "Rejection Qty",
  "Operator",
];

// Column group definitions: [label, colSpan, borderRight]
const COLUMN_GROUPS = [
  { label: "Basic Info", colSpan: 7 },
  { label: "Surface 1", colSpan: 4 },
  { label: "Surface 2", colSpan: 4 },
  { label: "Summary", colSpan: 7 },
];

export default function AnodizingBarBindingTable({ searchTerm = "" }: Props) {
  const [data, setData] = useState<Data[]>([]);
  const [filteredData, setFilteredData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateField, setDateField] = useState<"binding_date" | "extrusion_date">("binding_date");

  useEffect(() => { fetchData(); }, []);

  useEffect(() => { filterData(); }, [startDate, endDate, dateField, data]);

  useEffect(() => {
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = data.filter((row) =>
        Object.values(row).some((value) =>
          String(value ?? "").toLowerCase().includes(lowerSearch)
        )
      );
      setFilteredData(filtered);
    } else {
      filterData();
    }
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: d, error: e } = await supabase
        .from("anodizing_binding")
        .select("*")
        .order("binding_date", { ascending: false });

      if (e) {
        setError(e.message);
      } else {
        setData(d || []);
        setFilteredData(d || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...data];
    if (startDate) {
      filtered = filtered.filter((row) => (row[dateField] || "") >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((row) => (row[dateField] || "") <= endDate);
    }
    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const handleExport = () => {
    exportToCSV(filteredData, "anodizing_binding", ALL_COLUMNS);
  };

  const renderCell = (value: string | null, highlight = false) => (
    <span className={highlight ? "font-semibold text-slate-900 dark:text-white" : ""}>
      {value || "—"}
    </span>
  );

  if (loading) return <HiTechLoader text="Loading Anodizing Bar Binding" />;

  if (error) return (
    <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
      <p className="text-red-800 dark:text-red-300">
        <strong>Error:</strong> {error}
      </p>
      <button
        onClick={fetchData}
        className="mt-3 px-4 py-2 text-sm font-medium rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
            Anodizing Bar Binding Records
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Total records:{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {filteredData.length}
            </span>
            {data.length !== filteredData.length && (
              <span className="ml-1 text-slate-400 dark:text-slate-500">
                (of {data.length})
              </span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date field toggle */}
          <select
            value={dateField}
            onChange={(e) => setDateField(e.target.value as "binding_date" | "extrusion_date")}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600
                       bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="binding_date">Filter by Binding Date</option>
            <option value="extrusion_date">Filter by Extrusion Date</option>
          </select>

          {/* From date */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* To date */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-200 dark:bg-slate-700
                         text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600
                         transition-colors"
            >
              Clear
            </button>
          )}

          <button
            onClick={fetchData}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-700 hover:bg-slate-600
                       text-white transition-colors"
          >
            Refresh
          </button>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300
                       dark:border-slate-700 text-slate-700 dark:text-slate-300
                       hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table or Empty State */}
      {filteredData.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-10 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {data.length === 0
              ? "No records found in the database."
              : "No records match the selected filters."}
          </p>
          {data.length > 0 && (
            <button
              onClick={clearFilters}
              className="mt-3 px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800
                         text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700
                         transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto overflow-y-auto max-h-[560px]
                          scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600
                          scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 z-20">
                {/* Group row */}
                <tr className="bg-slate-900">
                  {COLUMN_GROUPS.map((group, i) => (
                    <th
                      key={i}
                      colSpan={group.colSpan}
                      className={`px-3 py-2 text-center text-xs font-bold uppercase tracking-wider
                                  text-slate-200 ${i < COLUMN_GROUPS.length - 1 ? "border-r border-slate-600" : ""}`}
                    >
                      {group.label}
                    </th>
                  ))}
                </tr>

                {/* Column headers */}
                <tr className="bg-slate-800">
                  {COLUMN_HEADERS.map((col, idx) => (
                    <th
                      key={idx}
                      className={`px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider
                                  text-slate-300 whitespace-nowrap
                                  ${idx < COLUMN_HEADERS.length - 1 ? "border-r border-slate-600" : ""}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredData.map((row, idx) => (
                  <tr
                    key={row.id ?? idx}
                    className={`transition-colors hover:bg-blue-50/40 dark:hover:bg-slate-800/60
                                ${idx % 2 === 0 ? "bg-white dark:bg-slate-900/20" : "bg-slate-50/60 dark:bg-slate-800/20"}`}
                  >
                    {/* Binding Date */}
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.binding_date || "—"}
                    </td>
                    {/* Extrusion Date */}
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.extrusion_date || "—"}
                    </td>
                    {/* Billet Batch */}
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.billet_batch || "—"}
                    </td>
                    {/* Die No */}
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.die_no || "—"}
                    </td>
                    {/* Profile */}
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.profile || "—"}
                    </td>
                    {/* Bucket No */}
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.bucket_no || "—"}
                    </td>
                    {/* Surface — last in Basic Info group */}
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-400 dark:border-slate-500">
                      {row.surface || "—"}
                    </td>

                    {/* Surface 1 group */}
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.full_rack_no || "—"}
                    </td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.one_full_rack_qty || "—"}
                    </td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.pcs_rack_no || "—"}
                    </td>
                    {/* Last in Surface 1 */}
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-400 dark:border-slate-500">
                      {row.pcs_qty || "—"}
                    </td>

                    {/* Surface 2 group */}
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.surface2 || "—"}
                    </td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.full_rack_no2 || "—"}
                    </td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.one_full_rack_qty2 || "—"}
                    </td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.pcs_rack_no2 || "—"}
                    </td>
                    {/* Last in Surface 2 */}
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-400 dark:border-slate-500">
                      {row.pcs_qty2 || "—"}
                    </td>

                    {/* Summary group */}
                    <td className="px-2 py-2 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {renderCell(row.total_binding_qty, true)}
                    </td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.type || "—"}
                    </td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.binding_team || "—"}
                    </td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.average_time || "—"}
                    </td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">
                      {row.rejection_qty || "—"}
                    </td>
                    {/* Operator — last column */}
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.operator || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Footer summary */}
              <tfoot className="sticky bottom-0 z-10 bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-600">
                <tr>
                  <td
                    colSpan={16}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 text-right border-r border-slate-300 dark:border-slate-600"
                  >
                    Totals ({filteredData.length} records):
                  </td>
                  {/* Total Binding Qty sum */}
                  <td className="px-2 py-2 text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap border-r border-slate-300 dark:border-slate-600">
                    {filteredData.reduce((sum, row) => {
                      const val = parseFloat(row.total_binding_qty || "0");
                      return sum + (isNaN(val) ? 0 : val);
                    }, 0).toLocaleString()}
                  </td>
                  {/* Rejection Qty sum — spans type, team, avg_time, rejection */}
                  <td colSpan={3} className="px-2 py-2 border-r border-slate-300 dark:border-slate-600" />
                  <td className="px-2 py-2 text-xs font-bold text-red-600 dark:text-red-400 whitespace-nowrap border-r border-slate-300 dark:border-slate-600">
                    {filteredData.reduce((sum, row) => {
                      const val = parseFloat(row.rejection_qty || "0");
                      return sum + (isNaN(val) ? 0 : val);
                    }, 0).toLocaleString()}
                  </td>
                  <td className="px-2 py-2" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
