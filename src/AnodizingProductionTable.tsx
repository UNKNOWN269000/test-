import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { exportToCSV } from "./csvExport";
import HiTechLoader from "./HiTechLoader";

interface Props { searchTerm?: string; }
interface Data { anodizing_date: string | null; bar_binding_date: string | null; type: string | null; surface: string | null; profile: string | null; rack_no: string | null; length: string | null; rack_wise_qty: string | null; total_production_qty: string | null; premium_packing_qty: string | null; non_brand_packing_qty: string | null; weight_bar_qty: string | null; one_micron: string | null; }

export default function AnodizingProductionTable({ searchTerm = "" }: Props) {
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
      const { data: d, error: e } = await supabase.from("anodizing_production").select("*").order("anodizing_date", { ascending: false });
      if (e) { setError(e.message); } else { setData(d || []); setFilteredData(d || []); }
    } catch (err) { setError(err instanceof Error ? err.message : "An error occurred"); } finally { setLoading(false); }
  };

  const filterData = () => {
    let filtered = [...data];
    if (startDate) filtered = filtered.filter((row) => (row.anodizing_date || "") >= startDate);
    if (endDate) filtered = filtered.filter((row) => (row.anodizing_date || "") <= endDate);
    setFilteredData(filtered);
  };

  const clearFilters = () => { setStartDate(""); setEndDate(""); };

  const handleExport = () => {
    exportToCSV(filteredData, "anodizing_production", ["anodizing_date", "bar_binding_date", "type", "surface", "profile", "rack_no", "length", "rack_wise_qty", "total_production_qty", "premium_packing_qty", "non_brand_packing_qty", "weight_bar_qty", "one_micron"]);
  };

  if (loading) return <HiTechLoader text="Loading Anodizing Production" />;
  if (error) return (<div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4"><p className="text-red-800 dark:text-red-300"><strong>Error:</strong> {error}</p></div>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h4 className="text-lg font-semibold text-slate-900 dark:text-white">Anodizing Production Records</h4><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total records: {filteredData.length} {data.length !== filteredData.length && `(of ${data.length})`}</p></div>
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
                  <th colSpan={8} className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-white border-r border-slate-600">Basic Info</th>
                  <th colSpan={5} className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-white">Production & Packing</th>
                </tr>
                <tr>{["Anodizing Date", "Bar Binding Date", "Type", "Surface", "Profile", "Rack No", "Length (m)", "Rack Wise Qty", "Total Production Qty", "Premium Packing Qty", "Non-Brand Packing Qty", "Weight Bar Qty", "1 Micron"].map((col, idx) => (<th key={idx} className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap border-r border-slate-600">{col}</th>))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredData.map((row, idx) => (<tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-3 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.anodizing_date || "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.bar_binding_date || "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.type || "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.surface || "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.profile || "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.rack_no || "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.length || "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.rack_wise_qty || "—"}</td>
                  <td className="px-3 py-3 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.total_production_qty || "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.premium_packing_qty || "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.non_brand_packing_qty || "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.weight_bar_qty || "—"}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.one_micron || "—"}</td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
