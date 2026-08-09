export function exportToCSV(data: any[], filename: string, columns?: string[]) {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get columns from data if not provided
  const cols = columns || Object.keys(data[0]);

  // Create CSV header
  const header = cols.map((col) => `"${col}"`).join(",");

  // Create CSV rows
  const rows = data.map((row) => {
    return cols
      .map((col) => {
        const value = row[col];
        // Handle null/undefined
        if (value === null || value === undefined) return '""';
        // Convert to string and escape quotes
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(",");
  });

  // Combine header and rows
  const csv = [header, ...rows].join("\n");

  // Add BOM for Excel compatibility with special characters
  const BOM = "\uFEFF";
  const csvWithBOM = BOM + csv;

  // Create blob and download
  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
