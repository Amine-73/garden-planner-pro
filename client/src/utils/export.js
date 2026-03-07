// src/utils/export.js
export const downloadGardenCSV = (savedGardens) => {
  const headers = ["Date", "Plants", "Total Yield (lbs)", "Total Savings ($)"];
  const rows = savedGardens.map(garden => {
    const date = new Date(garden.createdAt).toLocaleDateString();
    const plants = garden.items.map(i => `${i.quantity}x ${i.plantId?.name}`).join(' | ');
    const yieldLbs = garden.items.reduce((sum, i) => sum + (i.quantity * (i.plantId?.yieldPerPlantLbs || 0)), 0).toFixed(1);
    const savings = garden.totalEstimatedSavings.toFixed(2);
    return [date, `"${plants}"`, yieldLbs, savings].join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
  const link = document.createElement("a");
  link.href = encodeURI(csvContent);
  link.download = "my_garden_history.csv";
  link.click();
};