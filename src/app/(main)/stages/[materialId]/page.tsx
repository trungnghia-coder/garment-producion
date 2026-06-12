"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import StageList from "@/components/stages/StageList";
import OrderTable from "@/components/orders/OrderTable";
import { StageWithPrice, OrderItem } from "@/types/stage";
import { useStages } from "@/hooks/useStage";

export default function StagesByMaterialPage() {
  const { materialId } = useParams<{ materialId: string }>();
  const router = useRouter();
  const { stages, loading } = useStages(materialId);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [syncQty, setSyncQty] = useState(0);

  const handleToggle = useCallback((stage: StageWithPrice) => {
    const isSelected = selectedIds.has(stage.id);
    if (isSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(stage.id);
        return next;
      });
      setOrderItems((items) => items.filter((i) => i.id !== stage.id));
    } else {
      setSelectedIds((prev) => new Set(prev).add(stage.id));
      setOrderItems((items) => [
        ...items,
        { ...stage, qty: 0 },
      ]);
    }
  }, [selectedIds]);

  const handleSyncQtyChange = useCallback((qty: number) => {
    setSyncQty(qty);
  }, []);

  const handleQtyChange = useCallback((id: string, qty: number) => {
    setOrderItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, qty }
          : item
      )
    );
  }, []);

  const handleSync = useCallback(() => {
    setOrderItems((items) => items.map((item) => ({ ...item, qty: syncQty })));
  }, [syncQty]);

  const handleClear = useCallback(() => {
    if (window.confirm("Bạn chắc chắn muốn xóa tất cả công đoạn đã thêm?")) {
      setOrderItems([]);
      setSelectedIds(new Set());
      setSyncQty(0);
    }
  }, []);

  const handleExport = useCallback(() => {
    alert("Tính năng export Excel sẽ được tích hợp!");
  }, []);

  const handleAdd = useCallback(() => {
    alert("Mở modal thêm công đoạn mới!");
  }, []);

  if (loading) return <p className="p-5">Đang tải...</p>;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="px-5 pt-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
      </div>
      <main className="flex-1 flex gap-5 p-5 overflow-hidden">
        <StageList
          stages={stages as StageWithPrice[]}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          onAdd={handleAdd}
        />
        <OrderTable
          items={orderItems}
          syncQty={syncQty}
          onSync={handleSync}
          onClear={handleClear}
          onExport={handleExport}
          onQtyChange={handleQtyChange}
          onSyncQtyChange={handleSyncQtyChange}
        />
      </main>
    </div>
  );
}