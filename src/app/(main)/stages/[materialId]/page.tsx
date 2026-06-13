"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import StageList from "@/components/stages/StageList";
import OrderTable from "@/components/orders/OrderTable";
import { StageWithPrice, OrderItem } from "@/types/stage";
import { useStages } from "@/hooks/useStage";
import { getGarmentTypes, GarmentType } from "@/lib/firebase/garment-types";
import PriceSummary from "@/components/orders/PriceSummary";
import OrderHistoryDrawer from "@/components/orders/OrderHistoryDrawer";
import { printPDF } from "@/lib/print-pdf";
import { saveOrder } from "@/lib/firebase/order";
import { Order } from "@/lib/firebase/order";

export default function StagesByMaterialPage() {
  const { materialId } = useParams<{ materialId: string }>();
  const router = useRouter();
  const { stages, loading } = useStages(materialId);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [syncQty, setSyncQty] = useState(0);
  const [productCode, setProductCode] = useState("");
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  
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

  const handleExport = useCallback(async () => {
    if (orderItems.length === 0) {
      alert("Chưa có công đoạn nào trong bảng!");
      return;
    }
    printPDF(orderItems, garmentTypes, productCode, syncQty);

    if (productCode && orderItems.length > 0) {
      await saveOrder(productCode, orderItems, syncQty);
    }
  }, [orderItems, garmentTypes, productCode, syncQty]);

  const handleAdd = useCallback(() => {
    alert("Mở modal thêm công đoạn mới!");
  }, []);

  const handleLoadOrder = (order: Order) => {
    setProductCode(order.productCode);
    setSyncQty(order.syncQty);
    setOrderItems(order.stages.map((s) => ({ ...s, qty: order.syncQty })));
    setSelectedIds(new Set(order.stages.map((s) => s.id)));
  };

  const handleCloned = (newCode: string) => {
    setProductCode(newCode);
  };

  useEffect(() => {
    getGarmentTypes().then(setGarmentTypes);
  }, []);

  useEffect(() => {
  const pinnedIds: string[] = JSON.parse(localStorage.getItem("pinned_stage_ids") ?? "[]");
  if (pinnedIds.length === 0 || stages.length === 0) return;

    setOrderItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.id));
      const toAdd = stages
        .filter((s) => pinnedIds.includes(s.id) && !existingIds.has(s.id))
        .map((s) => ({ ...s, qty: 0 })) as OrderItem[];
      return [...prev, ...toAdd];
    });
  }, [stages]);

  if (loading) return <p className="p-5">Đang tải...</p>;

  const handleRemove = (id: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

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
          onRemove={handleRemove}
          onSyncQtyChange={handleSyncQtyChange}
          productCode={productCode}
          onProductCodeChange={setProductCode}
          garmentTypes={garmentTypes}
          onHistory={() => setHistoryOpen(true)}
        />
        <OrderHistoryDrawer
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          onLoad={handleLoadOrder}
          onCloned={handleCloned}
        />
      </main>
      <div className="px-5 pb-5">
        <PriceSummary items={orderItems} garmentTypes={garmentTypes} />
      </div>
    </div>
  );
}