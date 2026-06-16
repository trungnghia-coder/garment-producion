"use client";

import { useEffect, useState } from "react";
import { X, Eye } from "lucide-react";
import { stageRepo } from "@/lib/firebase/repositories/stage.repo";
import { stagePriceRepo } from "@/lib/firebase/repositories/stage_prices.repo";
import { StagePrice } from "@/types/stage-price";
import { getMaterials } from "@/lib/firebase/materials";
import { GarmentType } from "@/lib/firebase/garment-types";
import { Material } from "@/types/material";
import { StageWithPrice } from "@/types/stage";

interface StageDetailDrawerProps {
  open: boolean;
  stage: StageWithPrice | null;
  onClose: () => void;
  garmentTypes: GarmentType[];
  onUpdated: () => void;
}

const inputClass =
  "px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#8B1A1A] w-full";
const labelClass = "text-sm font-medium text-gray-700 mb-1 block";

export default function StageDetailDrawer({
  open,
  stage,
  onClose,
  garmentTypes,
  onUpdated,
}: StageDetailDrawerProps) {
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [priceCompany, setPriceCompany] = useState("");
  const [priceMarket, setPriceMarket] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stagePrices, setStagePrices] = useState<StagePrice[]>([]);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Load materials một lần
  useEffect(() => {
    getMaterials().then(setMaterials);
  }, []);

  // Mỗi khi stage thay đổi → reset form
  useEffect(() => {
    if (!stage || !open) return;

    setName(stage.name);
    setTypeId(stage.type_id);
    setPriceCompany(String(stage.price_company));
    setPriceMarket(String(stage.price_market));

    // Load tất cả stage_prices của stage này
    setLoadingPrices(true);
    stagePriceRepo
      .getByStage(stage.id)
      .then((prices) => {
        setStagePrices(prices);
        // Chọn sẵn price record khớp với material của stage đang hiển thị
        const matched = prices.find(
          (p) =>
            p.price_company === stage.price_company &&
            p.price_market === stage.price_market,
        );
        setSelectedPriceId(matched?.id ?? prices[0]?.id ?? null);
      })
      .finally(() => setLoadingPrices(false));
  }, [stage, open]);

  // Khi user chọn material khác → cập nhật giá tương ứng
  const handlePriceSelect = (priceId: string) => {
    setSelectedPriceId(priceId);
    const found = stagePrices.find((p) => p.id === priceId);
    if (found) {
      setPriceCompany(String(found.price_company));
      setPriceMarket(String(found.price_market));
    }
  };

  const getMaterialName = (materialId: string) =>
    materials.find((m) => m.id === materialId)?.name ?? materialId;

  const isValid =
    name.trim().length > 0 && typeId && priceCompany !== "" && priceMarket !== "";

  const handleSave = async () => {
    if (!stage || !isValid || saving) return;
    setSaving(true);
    try {
      // Cập nhật thông tin stage
      await stageRepo.update(stage.id, {
        name: name.trim(),
        type_id: typeId,
      });

      // Cập nhật giá nếu đã chọn price record
      if (selectedPriceId) {
        await stagePriceRepo.update(selectedPriceId, {
          price_company: Number(priceCompany),
          price_market: Number(priceMarket),
        });
      }

      onUpdated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-gray-500" />
            <span className="font-semibold text-gray-800 text-sm">
              Chi tiết công đoạn
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div>
            <label className={labelClass}>Tên công đoạn</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Loại công đoạn</label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className={inputClass}
            >
              {garmentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn material để xem/sửa giá tương ứng */}
          <div>
            <label className={labelClass}>Chất liệu</label>
            {loadingPrices ? (
              <p className="text-sm text-gray-400">Đang tải...</p>
            ) : stagePrices.length === 0 ? (
              <p className="text-sm text-gray-400">Chưa có giá nào</p>
            ) : (
              <select
                value={selectedPriceId ?? ""}
                onChange={(e) => handlePriceSelect(e.target.value)}
                className={inputClass}
              >
                {stagePrices.map((p) => (
                  <option key={p.id} value={p.id}>
                    {getMaterialName(p.material_id)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Giá công ty</label>
              <input
                type="number"
                min={0}
                value={priceCompany}
                onChange={(e) => setPriceCompany(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Giá thị trường</label>
              <input
                type="number"
                min={0}
                value={priceMarket}
                onChange={(e) => setPriceMarket(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="w-full py-2.5 text-sm font-medium text-white bg-[#8B1A1A] rounded-lg hover:bg-[#7a1616] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </>
  );
}