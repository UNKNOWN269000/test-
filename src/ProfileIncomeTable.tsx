import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { exportToCSV } from "./csvExport";
import HiTechLoader from "./HiTechLoader";

interface ProfileData {
  ext_date: string;
  shift: string;
  batch_no: string;
  die_status: string;
  profile: string;
  length_365: string | null;
  length_61: string | null;
  length_65: string | null;
  custom_length_value: string | null;
  custom_length_qty: string | null;
  in_weight: string;
  out_weight: string;
  off_cut: string;
  yield_percent: string;
}

interface Props {
  searchTerm?: string;
}

export default function ProfileIncomeTable({ searchTerm = "" }: Props) {
  const [data, setData] = useState<ProfileData[]>([]);
  const [filteredData, setFilteredData] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchProfileIncome();
  }, []);

  useEffect(() => {
    filterData();
  }, [startDate, endDate, data]);

  const fetchProfileIncome = async () => {
    try {
      setLoading(true);
      const { data: profileData, error: fetchError } = await supabase
        .from("profile_income")
        .select("*")
        .order("ext_date", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        console.error("Error fetching data:", fetchError);
      } else {
        setData(profileData || []);
        setFilteredData(profileData || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const filterData = () => {
    let filtered = [...data];

    if (startDate) {
      filtered = filtered.filter((row) => row.ext_date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((row) => row.ext_date <= endDate);
    }

    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const handleExport = () => {
    exportToCSV(filteredData, "profile_income", [
      "ext_date",
      "shift",
      "batch_no",
      "die_status",
      "profile",
      "length_365",
      "length_61",
      "length_65",
      "custom_length_value",
      "custom_length_qty",
      "in_weight",
      "out_weight",
      "off_cut",
      "yield_percent",
    ]);
  };

  if (loading) {
    return <HiTechLoader text="Loading Profile Income Data" />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
        <p className="text-red-800 dark:text-red-300">
          <strong>Error loading data:</strong> {error}
        </p>
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
          Please ensure the table "profile_income" exists in your Supabase database.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
            Profile Income Records
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Total records: {filteredData.length} {data.length !== filteredData.length && `(of ${data.length})`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={fetchProfileIncome}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Export CSV
          </button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            {data.length === 0 ? "No profile income records found. Add some data to get started." : "No records match the selected date range."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-slate-800">
                <tr>
                  {[
                    "Date",
                    "Shift",
                    "Batch No",
                    "Die Status",
                    "Profile",
                    "3.65m",
                    "6.1m",
                    "6.5m",
                    "Custom Length",
                    "Custom Qty",
                    "In (kg)",
                    "Out (kg)",
                    "Off Cut (kg)",
                    "Yield %",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap border-b-2 border-slate-600"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.ext_date}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.shift}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.batch_no}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.die_status === "Good"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        }`}
                      >
                        {row.die_status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.profile}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.length_365 || "—"}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.length_61 || "—"}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.length_65 || "—"}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.custom_length_value || "—"}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.custom_length_qty || "—"}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.in_weight}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.out_weight}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.off_cut}
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {row.yield_percent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
