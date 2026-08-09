import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { exportToCSV } from "./csvExport";
import HiTechLoader from "./HiTechLoader";

interface Props { searchTerm?: string; }
interface Data { production_date: string; packing_date: string; length: string; production_type: string; profile: string; surface: string; premium_enabled: boolean | null; premium_pack_no: string | null; premium_one_qty: string | null; premium_total_bundles: string | null; premium_total_qty: string | null; premium_avg_weight: string | null; premium_pcs_enabled: boolean | null; premium_pcs_pack_no: string | null; premium_pcs_one_qty: string | null; premium_pcs_total_qty: string | null; premium_pcs_avg_weight: string | null; nonbrand_enabled: boolean | null; nonbrand_pack_no: string | null; nonbrand_one_qty: string | null; nonbrand_total_bundles: string | null; nonbrand_total_qty: string | null; nonbrand_avg_weight: string | null; nonbrand_pcs_enabled: boolean | null; nonbrand_pcs_pack_no: string | null; nonbrand_pcs_one_qty: string | null; nonbrand_pcs_total_qty: string | null; nonbrand_pcs_avg_weight: string | null; weightbar_enabled: boolean | null; weightbar_pack_no: string | null; weightbar_bundle_qty: string | null; weightbar_avg_weight: string | null; }

export default function AnodizingPackingTable({ searchTerm = "" }: Props) {
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
      const { data: d, error: e } = await supabase.from("anodizing_packing").select("*").order("packing_date", { ascending: false });
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
      production_date: row.production_date,
      packing_date: row.packing_date,
      length: row.length,
      production_type: row.production_type,
      profile: row.profile,
      surface: row.surface,
      premium_pack_no: row.premium_enabled ? row.premium_pack_no : null,
      premium_one_qty: row.premium_enabled ? row.premium_one_qty : null,
      premium_total_bundles: row.premium_enabled ? row.premium_total_bundles : null,
      premium_total_qty: row.premium_enabled ? row.premium_total_qty : null,
      premium_pcs_pack_no: row.premium_pcs_enabled ? row.premium_pcs_pack_no : null,
      premium_pcs_one_qty: row.premium_pcs_enabled ? row.premium_pcs_one_qty : null,
      premium_pcs_total_qty: row.premium_pcs_enabled ? row.premium_pcs_total_qty : null,
      premium_pcs_avg_weight: row.premium_pcs_enabled ? row.premium_pcs_avg_weight : null,
      nonbrand_pack_no: row.nonbrand_enabled ? row.nonbrand_pack_no : null,
      nonbrand_one_qty: row.nonbrand_enabled ? row.nonbrand_one_qty : null,
      nonbrand_total_bundles: row.nonbrand_enabled ? row.nonbrand_total_bundles : null,
      nonbrand_total_qty: row.nonbrand_enabled ? row.nonbrand_total_qty : null,
      nonbrand_pcs_pack_no: row.nonbrand_pcs_enabled ? row.nonbrand_pcs_pack_no : null,
      nonbrand_pcs_one_qty: row.nonbrand_pcs_enabled ? row.nonbrand_pcs_one_qty : null,
      nonbrand_pcs_total_qty: row.nonbrand_pcs_enabled ? row.nonbrand_pcs_total_qty : null,
      nonbrand_pcs_avg_weight: row.nonbrand_pcs_enabled ? row.nonbrand_pcs_avg_weight : null,
      weightbar_pack_no: row.weightbar_enabled ? row.weightbar_pack_no : null,
      weightbar_bundle_qty: row.weightbar_enabled ? row.weightbar_bundle_qty : null,
      weightbar_avg_weight: row.weightbar_enabled ? row.weightbar_avg_weight : null,
    }));
    exportToCSV(exportData, "anodizing_packing");
  };

  if (loading) return <HiTechLoader text="Loading Anodizing Packing" />;
  if (error) return (<div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4"><p className="text-red-800 dark:text-red-300"><strong>Error:</strong> {error}</p></div>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h4 className="text-lg font-semibold text-slate-900 dark:text-white">Anodizing Packing Records</h4><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total records: {filteredData.length} {data.length !== filteredData.length && `(of ${data.length})`}</p></div>
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
                  <th colSpan={4} className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-white border-r border-slate-600">Premium</th>
                  <th colSpan={4} className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-white border-r border-slate-600">Premium PCS</th>
                  <th colSpan={4} className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-white border-r border-slate-600">Non-Brand</th>
                  <th colSpan={4} className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-white border-r border-slate-600">Non-Brand PCS</th>
                  <th colSpan={3} className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wider text-white">Weight Bar</th>
                </tr>
                <tr>{["Production Date", "Packing Date", "Length (m)", "Type", "Profile", "Surface", "Pack No", "1 Qty", "Total Bundles", "Total Qty", "Pack No", "1 Qty", "Total Qty", "Avg Wt", "Pack No", "1 Qty", "Total Bundles", "Total Qty", "Pack No", "1 Qty", "Total Qty", "Avg Wt", "Pack No", "Bundle Qty", "Avg Wt"].map((col, idx) => (<th key={idx} className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap border-r border-slate-600">{col}</th>))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredData.map((row, idx) => (<tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.production_date}</td>
                  <td className="px-2 py-2 font-medium text-slate-900 dark:text-white whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.packing_date}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.length}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.production_type}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.profile}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.surface}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.premium_enabled ? (row.premium_pack_no || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.premium_enabled ? (row.premium_one_qty || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.premium_enabled ? (row.premium_total_bundles || "—") : "—"}</td>
                  <td className="px-2 py-2 font-medium text-slate-900 dark:text-white whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.premium_enabled ? (row.premium_total_qty || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.premium_pcs_enabled ? (row.premium_pcs_pack_no || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.premium_pcs_enabled ? (row.premium_pcs_one_qty || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.premium_pcs_enabled ? (row.premium_pcs_total_qty || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.premium_pcs_enabled ? (row.premium_pcs_avg_weight || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.nonbrand_enabled ? (row.nonbrand_pack_no || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.nonbrand_enabled ? (row.nonbrand_one_qty || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.nonbrand_enabled ? (row.nonbrand_total_bundles || "—") : "—"}</td>
                  <td className="px-2 py-2 font-medium text-slate-900 dark:text-white whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.nonbrand_enabled ? (row.nonbrand_total_qty || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.nonbrand_pcs_enabled ? (row.nonbrand_pcs_pack_no || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.nonbrand_pcs_enabled ? (row.nonbrand_pcs_one_qty || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.nonbrand_pcs_enabled ? (row.nonbrand_pcs_total_qty || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.nonbrand_pcs_enabled ? (row.nonbrand_pcs_avg_weight || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.weightbar_enabled ? (row.weightbar_pack_no || "—") : "—"}</td>
                  <td className="px-2 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap border-r border-slate-200 dark:border-slate-700">{row.weightbar_enabled ? (row.weightbar_bundle_qty || "—") : "—"}</td>
                  <td className="px-2 py-2 font-medium text-slate-900 dark:text-white whitespace-nowrap">{row.weightbar_enabled ? (row.weightbar_avg_weight || "—") : "—"}</td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
