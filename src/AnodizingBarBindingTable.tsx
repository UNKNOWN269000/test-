import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { exportToCSV } from "./csvExport";
import HiTechLoader from "./HiTechLoader";

interface Props { searchTerm?: string; }
interface Data { extrusion_date: string | null; billet_batch: string | null; die_no: string | null; profile: string | null; bucket_no: string | null; surface: string | null; full_rack_no: string | null; one_full_rack_qty: string | null; pcs_rack_no: string | null; pcs_qty: string | null; surface2: string | null; full_rack_no2: string | null; one_full_rack_qty2: string | null; pcs_rack_no2: string | null; pcs_qty2: string | null; total_binding_qty: string | null; type: string | null; binding_team: string | null; average_time: string | null; rejection_qty: string | null; }

export default function AnodizingBarBindingTable({ searchTerm = "" }: Props) {
  const [data, setData] = useState<Data[]>([]);
  const [filteredData, setFilteredData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { filterData(); }, [startDate, endDate, data]);

  useEffect(() => {
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = data.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(lowerSearch)
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
      const { data: d, error: e } = await supabase.from("anodizing_binding").select("*").order("extrusion_date", { ascending: false });
      if (e) { setError(e.message); } else { setData(d || []); setFilteredData(d || []); }
    } catch (err) { setError(err instanceof Error ? err.message : "An error occurred"); } finally { setLoading(false); }
  };

  const filterData = () => {
    let filtered = [...data];
    if (startDate) filtered = filtered.filter((row) => (row.extrusion_date || "") >= startDate);
    if (endDate) filtered = filtered.filter((row) => (row.extrusion_date || "") <= endDate);
    setFilteredData(filtered);
  };

  const clearFilters = () => { setStartDate(""); setEndDate(""); };

  const handleExport = () => {
    exportToCSV(filteredData, "anodizing_binding", ["extrusion_date", "billet_batch", "die_no", "profile", "bucket_no", "surface", "full_rack_no", "one_full_rack_qty", "pcs_rack_no", "pcs_qty", "surface2", "full_rack_no2", "one_full_rack_qty2", "pcs_rack_no2", "pcs_qty2", "total_binding_qty", "type", "binding_team", "average_time", "rejection_qty"]);
  };

  if (loading) return <HiTechLoader text="Loading Anodizing Bar Binding" />;
  if (error) return (<div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4"><p className="text-red-800 dark:text-red-300"><strong>Error:</strong> {error}</p></div>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h4 className="text-lg font-semibold text-slate-900 dark:text-white">Anodizing Bar Binding Records</h4><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total records: {filteredData.length} {data.length !== filteredData.length && `(of ${data.length})`}</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2"><label className="text-xs font-medium text-slate-600 dark:text-slate-400">From:</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex items-center gap-2"><label className="text-xs font-medium text-slate-600 dark:text-slate-400">To:</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          {(startDate || endDate) && <button onClick={clearFilters} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600">Clear</button>}
          <button onClick={fetchData} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors">Refresh</button>
          <button onClick={handleExport} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Export CSV</button>
        </div>
      </div>
      {filteredData.length === 0 ? (<div className="rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center"><p className="text-slate-500 dark:text-slate-400">{data.length === 0 ? "No records found." : "No records match the selected date range."}</p></div>) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-20 bg-slate-800">
                <tr>
                  <th colSpan={6} className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-white border-r border-slate-600">Basic Info</th>
                  <th colSpan={4} className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-white border-r border-slate-600">Surface 1</th>
                  <th colSpan={4} className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-white border-r border-slate-600">Surface 2</th>
                  <th colSpan={6} className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-white">Summary</th>
                </tr>
                <tr>{["Extrusion Date", "Billet Batch", "Die No", "Profile", "Bucket No", "Surface", "Full Rack No", "1 Full Rack Qty", "PCS Rack No", "PCS Qty", "Surface 2", "Full Rack No 2", "1 Full Rack Qty 2", "PCS Rack No 2", "PCS Qty 2", "Total Binding Qty", "Type", "Binding Team", "Average Time", "Rejection Qty"].map((col, idx) => (<th key={idx} className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap border-r border-slate-600">{col}</th>))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredData.map((row, idx) => (<tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
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
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.rejection_qty || "—"}</td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
