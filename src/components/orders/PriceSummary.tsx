"use client";

import { OrderItem } from "@/types/stage";
import { GarmentType } from "@/lib/firebase/garment-types";

interface PriceSummaryProps {
  items: OrderItem[];
  garmentTypes: GarmentType[];
}

export default function PriceSummary({ items, garmentTypes }: PriceSummaryProps) {
  if (items.length === 0) return null;

  // Group theo type_id
  const groups = garmentTypes.map((type) => {
    const typeItems = items.filter((i) => i.type_id === type.id);
    if (typeItems.length === 0) return null;

    const totalCompany = typeItems.reduce((sum, i) => sum + i.price_company, 0);
    const totalMarket = typeItems.reduce((sum, i) => sum + i.price_market, 0);

    return { type, totalCompany, totalMarket };
  }).filter(Boolean) as { type: GarmentType; totalCompany: number; totalMarket: number }[];

  const grandCompany = groups.reduce((sum, g) => sum + g.totalCompany, 0);
  const grandMarket = groups.reduce((sum, g) => sum + g.totalMarket, 0);

  return (
    <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-700">Tổng giá thành</span>
      </div>
      <div className="divide-y divide-gray-100">
        {groups.map(({ type, totalCompany, totalMarket }) => (
          <div key={type.id} className="flex items-center px-4 py-2.5 gap-4">
            <span className="text-sm font-medium text-gray-700 w-16">{type.name}</span>
            <span className="text-sm text-gray-500">
              Công ty: <span className="font-semibold text-gray-800">{totalCompany.toLocaleString("vi-VN")}đ</span>
            </span>
            <span className="text-sm text-gray-500">
              Thị trường: <span className="font-semibold text-gray-800">{totalMarket.toLocaleString("vi-VN")}đ</span>
            </span>
          </div>
        ))}
        {groups.length > 1 && (
          <div className="flex items-center px-4 py-2.5 gap-4 bg-gray-50">
            <span className="text-sm font-semibold text-gray-700 w-16">Tổng</span>
            <span className="text-sm text-gray-500">
              Công ty: <span className="font-semibold text-[#8B1A1A]">{grandCompany.toLocaleString("vi-VN")}đ</span>
            </span>
            <span className="text-sm text-gray-500">
              Thị trường: <span className="font-semibold text-[#8B1A1A]">{grandMarket.toLocaleString("vi-VN")}đ</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}