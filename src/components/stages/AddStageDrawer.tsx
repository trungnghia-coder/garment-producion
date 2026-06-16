"use client";

import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import { stageRepo } from "@/lib/firebase/repositories/stage.repo";
import { stagePriceRepo } from "@/lib/firebase/repositories/stage_prices.repo";
import { getMaterials } from "@/lib/firebase/materials";
import { GarmentType } from "@/lib/firebase/garment-types";
import { Material } from "@/types/material";
import SimilarNamesDialog from "./SimilarNamesDialog";

interface AddStageDrawerProps {
  open: boolean;
  onClose: () => void;
  garmentTypes: GarmentType[];
  defaultMaterialId: string;
  onCreated: () => void;
}

const inputClass =
  "px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#8B1A1A] w-full";
const labelClass = "text-sm font-medium text-gray-700 mb-1 block";

export default function AddStageDrawer({
  open,
  onClose,
  garmentTypes,
  defaultMaterialId,
  onCreated,
}: AddStageDrawerProps) {
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [materialId, setMaterialId] = useState(defaultMaterialId);
  const [priceCompany, setPriceCompany] = useState("");
  const [priceMarket, setPriceMarket] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [saving, setSaving] = useState(false);

  const [similarNames, setSimilarNames] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Reset form mỗi khi mở drawer
  useEffect(() => {
    if (!open) return;
    setName("");
    setTypeId(garmentTypes[0]?.id ?? "");
    setMaterialId(defaultMaterialId);
    setPriceCompany("");
    setPriceMarket("");
  }, [open, garmentTypes, defaultMaterialId]);

  useEffect(() => {
    getMaterials().then(setMaterials);
  }, []);

  const isValid =
    name.trim().length > 0 &&
    typeId &&
    materialId &&
    priceCompany !== "" &&
    priceMarket !== "";

  const persist = async () => {
    setSaving(true);
    try {
      const stageId = await stageRepo.create({
        name: name.trim(),
        type_id: typeId,
        isActive: true,
      });

      await stagePriceRepo.create({
        stage_id: stageId,
        material_id: materialId,
        price_company: Number(priceCompany),
        price_market: Number(priceMarket),
      });

      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!isValid || saving) return;

    const similar = await stageRepo.findSimilarNames(name.trim());
    if (similar.length > 0) {
      setSimilarNames(similar);
      setConfirmOpen(true);
      return;
    }

    await persist();
  };

  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-gray-500" />
            <span className="font-semibold text-gray-800 text-sm">
              Thêm công đoạn
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
              placeholder="VD: Cắt cổ áo thun"
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

          <div>
            <label className={labelClass}>Loại chất liệu</label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className={inputClass}
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Giá công ty</label>
              <input
                type="number"
                min={0}
                value={priceCompany}
                onChange={(e) => setPriceCompany(e.target.value)}
                placeholder="0"
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
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={!isValid || saving}
            className="w-full py-2.5 text-sm font-medium text-white bg-[#8B1A1A] rounded-lg hover:bg-[#7a1616] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Đang thêm..." : "Thêm công đoạn"}
          </button>
        </div>
      </div>

      {/* Similar names confirm dialog */}
      <SimilarNamesDialog
        open={confirmOpen}
        newName={name.trim()}
        similarNames={similarNames}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          await persist();
        }}
      />
    </>
  );
}