// "use client";

// import { useState, useCallback } from "react";
// import StageList from "@/components/stages/StageList";
// import OrderTable from "@/components/orders/OrderTable";
// import { Stage, OrderItem } from "@/types/stage";
// import { useStages } from "@/hooks/useStage";

// export default function DashboardPage() {
//   const { stages, loading } = useStages();
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
//   const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
//   const [syncQty, setSyncQty] = useState(0);

//   const handleToggle = useCallback((stage: Stage) => {
//   const isSelected = selectedIds.has(stage.id);

//   if (isSelected) {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       next.delete(stage.id);
//       return next;
//     });
//     setOrderItems((items) => items.filter((i) => i.id !== stage.id));
//   } else {
//     setSelectedIds((prev) => new Set(prev).add(stage.id));
//     setOrderItems((items) => [
//       ...items,
//       { ...stage, qty: 0, qtyMay: 0, slMay: 0, slConLai: 0 },
//     ]);
//   }
// }, [selectedIds]);

//   const handleQtyChange = useCallback((id: string, qty: number) => {
//     setOrderItems((items) =>
//       items.map((item) =>
//         item.id === id
//           ? { ...item, qty, slConLai: qty - item.slMay }
//           : item
//       )
//     );
//   }, []);

//   const handleSync = useCallback(() => {
//     const total = orderItems.reduce((sum, i) => sum + i.qty, 0);
//     setSyncQty(total);
//   }, [orderItems]);

//   const handleClear = useCallback(() => {
//     setOrderItems([]);
//     setSelectedIds(new Set())
//     setSyncQty(0);
//   }, []);

//   const handleExport = useCallback(() => {
//     // TODO: integrate xlsx export
//     alert("Tính năng export Excel sẽ được tích hợp với Firebase!");
//   }, []);

//   const handleAdd = useCallback(() => {
//     // TODO: open modal to add new stage
//     alert("Mở modal thêm công đoạn mới!");
//   }, []);

//   if (loading) return <p>Đang tải...</p>;

//   return (
//     <main className="flex-1 flex gap-5 p-5 overflow-hidden">
//       <StageList
//         stages={stages}
//         selectedIds={selectedIds}
//         onToggle={handleToggle}
//         onAdd={handleAdd}
//       />
//       <OrderTable
//         items={orderItems}
//         syncQty={syncQty}
//         onSync={handleSync}
//         onClear={handleClear}
//         onExport={handleExport}
//         onQtyChange={handleQtyChange}
//       />
//     </main>
//   );
// }

import Link from "next/link";
import { Scissors, DollarSign } from "lucide-react";

const modules = [
  {
    title: "Quản lý công đoạn",
    icon: Scissors,
    href: "/stages",
    color: "bg-[#8B1A1A]",
  },
  {
    title: "Quản lý lương",
    icon: DollarSign,
    href: "/salary",
    color: "bg-[#1A4A8B]",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-10">
        NITIMO - Hệ thống quản lý
      </h1>
      <div className="grid grid-cols-2 gap-6">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className="flex flex-col items-center justify-center gap-4 w-44 h-44 rounded-2xl text-white shadow-md hover:scale-105 transition-transform"
              style={{ backgroundColor: mod.color.replace("bg-[", "").replace("]", "") }}
            >
              <Icon size={48} />
              <span className="text-sm font-semibold text-center px-2">
                {mod.title}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}