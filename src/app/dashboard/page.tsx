"use client";

import { useState, useCallback } from "react";
import StageList from "@/components/stages/StageList";
import OrderTable from "@/components/orders/OrderTable";
import { Stage, OrderItem } from "@/types/stage";
import { MOCK_STAGES } from "@/lib/mock-data";

export default function DashboardPage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [syncQty, setSyncQty] = useState(0);

  const handleToggle = useCallback((stage: Stage) => {
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
      { ...stage, qty: 0, qtyMay: 0, slMay: 0, slConLai: 0 },
    ]);
  }
}, [selectedIds]);

  const handleQtyChange = useCallback((id: string, qty: number) => {
    setOrderItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, qty, slConLai: qty - item.slMay }
          : item
      )
    );
  }, []);

  const handleSync = useCallback(() => {
    const total = orderItems.reduce((sum, i) => sum + i.qty, 0);
    setSyncQty(total);
  }, [orderItems]);

  const handleClear = useCallback(() => {
    setOrderItems([]);
    setSelectedIds(new Set())
    setSyncQty(0);
  }, []);

  const handleExport = useCallback(() => {
    // TODO: integrate xlsx export
    alert("Tính năng export Excel sẽ được tích hợp với Firebase!");
  }, []);

  const handleAdd = useCallback(() => {
    // TODO: open modal to add new stage
    alert("Mở modal thêm công đoạn mới!");
  }, []);

  return (
    <main className="flex-1 flex gap-5 p-5 overflow-hidden">
      <StageList
        stages={MOCK_STAGES}
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
      />
    </main>
  );
}