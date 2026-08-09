import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { exportToCSV } from "./csvExport";
import HiTechLoader from "./HiTechLoader";

interface Props { searchTerm?: string; }
interface Data { base_colour_date: string; wood_finish_date: string; profile: string; surface: string; length: string; quantity: string; is_damage: boolean | null; damage_quantity: string | null; }

export default function WoodFinishProductionTable({ searchTerm = "" }: Props) {
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
      const { data: d, error: e } = await supabase.from("wood_finish_production").select("*").order("wood_finish_date", { ascending: false });
      if (e) { setError(e.message); } else { setData(d || []); setFilteredData(d || []); }
    } catch (err) { setError(err instanceof Error ? err.message : "An error occurred"); } finally { setLoading(false); }
  };

  const filterData = () => {
    let filtered = [...data];
    if (startDate) filtered = filtered.filter((row) => row.wood_finish_date >= startDate);
    if (endDate) filtered = filtered.filter((row) => row.wood_finish_date <= endDate);
    setFilteredData(filtered);
  };

  const clearFilters = () => { setStartDate(""); setEndDate(""); };

  const handleExport = () => {
    exportToCSV(filteredData, "wood_finish_production", ["base_colour_date", "wood_finish_date", "profile", "surface", "length", "quantity", "is_damage", "damage_quantity"]);
  };

  if (loading) return <HiTechLoader text="Loading Wood Finish Production" />;
  if (error) return (<div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4"><p className="text-red-800 dark:text-red-300"><strong>Error:</strong> {error}</p></div>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h4 className="text-lg font-semibold text-slate-900 dark:text-white">Wood Finish Production Records</h4><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total records: {filteredData.length} {data.length !== filteredData.length && `(of ${data.length})`}</p></div>
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
              <thead className="sticky top-0 z-10 bg-slate-800">
                <tr>{["Base Colour Date", "Wood Finish Date", "Profile", "Surface", "Length (m)", "Quantity", "Damage", "Damage Qty"].map((col) => (<th key={col} className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap border-b-2 border-slate-600">{col}</th>))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredData.map((row, idx) => (<tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.base_colour_date}</td>
                  <td className="px-3 py-3 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">{row.wood_finish_date}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.profile}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.surface}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.length}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.quantity}</td>
                  <td className="px-3 py-3 text-sm whitespace-nowrap">{row.is_damage ? (<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">⚠ Yes</span>) : (<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">✓ No</span>)}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.damage_quantity || "—"}</td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
