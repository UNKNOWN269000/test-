import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { exportToCSV } from "./csvExport";
import HiTechLoader from "./HiTechLoader";

interface Props { searchTerm?: string; }
interface PowderCoatData { extrusion_date: string; powder_coat_date: string; bucket_no: string; billet_no: string; die_no: string; profile: string; type: string; length: string; quantity: string; colour: string; is_damage: boolean | null; damage_quantity: string | null; }

export default function PowdercoatProductionTable({ searchTerm = "" }: Props) {
  const [data, setData] = useState<PowderCoatData[]>([]);
  const [filteredData, setFilteredData] = useState<PowderCoatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => { fetchPowderCoatProduction(); }, []);
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

  const fetchPowderCoatProduction = async () => {
    try {
      setLoading(true);
      const { data: pcData, error: fetchError } = await supabase.from("powder_coat_production").select("*").order("powder_coat_date", { ascending: false });
      if (fetchError) { setError(fetchError.message); } else { setData(pcData || []); setFilteredData(pcData || []); }
    } catch (err) { setError(err instanceof Error ? err.message : "An error occurred"); } finally { setLoading(false); }
  };

  const filterData = () => {
    let filtered = [...data];
    if (startDate) filtered = filtered.filter((row) => row.powder_coat_date >= startDate);
    if (endDate) filtered = filtered.filter((row) => row.powder_coat_date <= endDate);
    setFilteredData(filtered);
  };

  const clearFilters = () => { setStartDate(""); setEndDate(""); };

  const handleExport = () => {
    exportToCSV(filteredData, "powder_coat_production", ["extrusion_date", "powder_coat_date", "bucket_no", "billet_no", "die_no", "profile", "type", "length", "quantity", "colour", "is_damage", "damage_quantity"]);
  };

  if (loading) return <HiTechLoader text="Loading Powder Coat Production" />;
  if (error) return (<div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4"><p className="text-red-800 dark:text-red-300"><strong>Error loading data:</strong> {error}</p></div>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h4 className="text-lg font-semibold text-slate-900 dark:text-white">Powder Coat Production Records</h4><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total records: {filteredData.length} {data.length !== filteredData.length && `(of ${data.length})`}</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2"><label className="text-xs font-medium text-slate-600 dark:text-slate-400">From:</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex items-center gap-2"><label className="text-xs font-medium text-slate-600 dark:text-slate-400">To:</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          {(startDate || endDate) && <button onClick={clearFilters} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Clear</button>}
          <button onClick={fetchPowderCoatProduction} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors">Refresh</button>
          <button onClick={handleExport} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Export CSV</button>
        </div>
      </div>
      {filteredData.length === 0 ? (<div className="rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center"><p className="text-slate-500 dark:text-slate-400">{data.length === 0 ? "No powder coat production records found." : "No records match the selected date range."}</p></div>) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-slate-800">
                <tr>{["Extrusion Date", "Powder Coat Date", "Bucket No", "Billet No", "Die No", "Profile", "Type", "Length (m)", "Quantity", "Colour", "Damage", "Damage Qty"].map((col) => (<th key={col} className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap border-b-2 border-slate-600">{col}</th>))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredData.map((row, idx) => (<tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.extrusion_date}</td>
                  <td className="px-3 py-3 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">{row.powder_coat_date}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.bucket_no}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.billet_no}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.die_no}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.profile}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.type}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.length}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.quantity}</td>
                  <td className="px-3 py-3 text-sm whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${row.colour}20`, color: row.colour, border: `1px solid ${row.colour}40` }}>{row.colour}</span></td>
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
