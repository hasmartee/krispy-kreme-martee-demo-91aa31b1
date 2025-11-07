// Category badge utility aligned with Martee AI palette

export const getCategoryBadgeClass = (category: string): string => {
  const colors: Record<string, string> = {
    // Donut categories using Martee palette
    "Glazed": "bg-[#f8b29c] hover:bg-[#f6a389] text-[#3e5c39] border-0 shadow-sm",
    "Iced": "bg-[#7ea058] hover:bg-[#6d9148] text-white border-0 shadow-sm",
    "Filled": "bg-[#3e5c39] hover:bg-[#2d4329] text-[#f8f8f0] border-0 shadow-sm",
    "Cake": "bg-[#ffd580] hover:bg-[#ffc966] text-[#3e5c39] border-0 shadow-sm",
    "Specialty": "bg-[#ff914d] hover:bg-[#ff7e33] text-white border-0 shadow-sm",
  };
  
  return colors[category] || "bg-[#e8e8d8] hover:bg-[#d8d8c8] text-[#3e5c39] border-0 shadow-sm";
};
