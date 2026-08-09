import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { exportToCSV } from "./csvExport";
import HiTechLoader from "./HiTechLoader";

interface Props { searchTerm?: string; }
interface Data { wood_prod_date: string; packing_date: string; wood_finish_type: string; length: string; profile: string; main_pack_no: string | null; main_one_qty: string | null; main_total_bundle: string | null; main_total_qty: string | null; main_avg_weight: string | null; pcs_enabled: boolean | null; pcs_pack_no: string | null; pcs_one_qty: string | null; pcs_total_qty: string | null; pcs_avg_weight: string | null; }

export default function WoodFinishPackingTable({ searchTerm = "" }: Props) {
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
      const { data: d, error: e } = await supabase.from("wood_finish_packing").select("*").order("packing_date", { ascending: false });
      if (e) { setError(e.message); } else { setData(d || []); setFilteredData(d || []); }
    } catch (err) { setError(err instanceof Error ? err.message : "An error occurred"); } finally { setLoading(false); }
  };

  const filterData = () => {
    let filtered = [...data];
    if (startDate) filtered = filtered.filter((row) => row.packing_date >= startDate);
    if (endDate) filtered = filtered.filter((row) => row.packing_date <= endDate);
    setFilteredData(filtered);
  };

  const clearFilters = () => { setStartDate(""); setEndDate(""); };

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
  if (error) return (<div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4"><p className="text-red-800 dark:text-red-300"><strong>Error:</strong> {error}</p></div>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h4 className="text-lg font-semibold text-slate-900 dark:text-white">Wood Finish Packing Records</h4><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total records: {filteredData.length} {data.length !== filteredData.length && `(of ${data.length})`}</p></div>
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
            <table className="w-full">
              <thead className="sticky top-0 z-20 bg-slate-800">
                <tr>
                  <th colSpan={5} className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-white border-r border-slate-600">Basic Info</th>
                  <th colSpan={5} className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-white border-r border-slate-600">Main Pack</th>
                  <th colSpan={4} className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-white">PCS Pack</th>
                </tr>
                <tr>{["Wood Prod Date", "Packing Date", "Wood Finish Type", "Length (m)", "Profile", "Pack No", "1 Qty", "Total Bundle", "Total Qty", "Avg Weight", "Pack No", "1 Qty", "Total Qty", "Avg Weight"].map((col, idx) => (<th key={idx} className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap border-r border-slate-600">{col}</th>))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredData.map((row, idx) => (<tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
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
                </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
