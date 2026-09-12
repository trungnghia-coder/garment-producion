import jsPDF from "jspdf";
import autoTable, { ColumnInput, RowInput, Styles } from "jspdf-autotable";
import { OrderItem } from "@/types/stage";
import { GarmentType } from "./firebase/garment-types";
import { NotoSansFont } from "@/fonts/NotoSans-normal";
import { PriceType } from "@/components/orders/PrintDialog";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

// ── Constants ────────────────────────────────────────────
const GRAY: [number, number, number] = [180, 180, 180];
const BLACK: [number, number, number] = [0, 0, 0];

// ── Shared table config —
const BASE_TABLE_STYLES: Partial<Styles> = {
  fontSize: 8,
  cellPadding: 1.5,
  font: "NotoSans",
  textColor: BLACK,
  lineColor: BLACK,
  lineWidth: 0.2,
};

const HEAD_STYLES: Partial<Styles> = {
  font: "NotoSans",
  textColor: BLACK,
  lineColor: BLACK,
  lineWidth: 0.2,
  minCellHeight: 6,
};

const GRAY_CELL = { fillColor: GRAY, textColor: BLACK };
const GRAY_BOLD = { ...GRAY_CELL, fontStyle: "bold" as const };
const CENTER_MIDDLE = { halign: "center" as const, valign: "middle" as const };
const RIGHT = { halign: "right" as const };

// ── Column widths ─────────────────────────────────────────
const COL = {
  stt: 9,
  slCat: 9,
  price: 12,
  priceCompact: 15,
  xuongMay: 52,
  ngoaiMay: 52,
  xuongMayNarrow: 48,
  ngoaiMayNarrow: 48,
  tenSingle: 71,
  tenBoth: 53,
};

// ── Helpers ───────────────────────────────────────────────
function setupDoc(): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.addFileToVFS("NotoSans-normal.ttf", NotoSansFont);
  doc.addFont("NotoSans-normal.ttf", "NotoSans", "normal");
  doc.addFileToVFS("NotoSans-bold.ttf", NotoSansFont);
  doc.addFont("NotoSans-bold.ttf", "NotoSans", "bold");
  doc.setFont("NotoSans");
  return doc;
}

function printHeader(doc: jsPDF, productCode: string, syncQty: number) {
  doc.setFontSize(11);
  doc.setFont("NotoSans", "bold");
  doc.text("CÔNG TY CỔ PHẦN THỜI TRANG HALEN VIỆT NAM", 105, 14, {
    align: "center",
  });
  doc.setFontSize(10);
  doc.setFont("NotoSans", "normal");
  doc.text("PHÒNG KỸ THUẬT", 105, 19, { align: "center" });
  doc.setFontSize(13);
  doc.setFont("NotoSans", "bold");
  doc.text("QUI TRÌNH CÔNG ĐOẠN SẢN XUẤT", 105, 27, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("NotoSans", "normal");
  doc.text(`Mã sản phẩm: ${productCode}`, 5, 35);
  doc.text(`Số lượng: ${syncQty} bộ`, 5, 41);
}

function fmt(n: number) {
  return n.toLocaleString("vi-VN");
}

function grayGroupRow(
  typeName: string,
  syncQty: number,
  prices: string[],
  colSpanName = 2,
): RowInput {
  return [
    { content: "", styles: GRAY_BOLD },
    {
      content: typeName,
      colSpan: colSpanName,
      styles: { ...GRAY_BOLD, halign: "center" },
    },
    // empty cells for may columns — filled by caller
    ...prices.map((p) => ({ content: p, styles: { ...GRAY_BOLD, ...RIGHT } })),
  ];
}

function itemRow(
  item: OrderItem,
  idx: number,
  syncQty: number,
  prices: string[],
): RowInput {
  return [
    { content: String(idx + 1).padStart(2, "0"), styles: { halign: "center" } },
    { content: item.name },
    { content: String(syncQty), styles: { halign: "center" } },
    { content: "" }, // Xưởng may
    { content: "" }, // Ngoài may
    ...prices.map((p) => ({ content: p, styles: RIGHT })),
  ];
}

function buildRows(
  items: OrderItem[],
  garmentTypes: GarmentType[],
  syncQty: number,
  getPrices: (item: OrderItem) => string[],
  getGroupTotals: (typeItems: OrderItem[]) => string[],
  skipFirst = true,
): RowInput[] {
  const rows: RowInput[] = [];
  let isFirst = true;
  let globalIdx = 0;

  garmentTypes.forEach((type) => {
    const typeItems = items.filter((i) => i.type_id === type.id);
    if (typeItems.length === 0) return;

    if (!isFirst || !skipFirst) {
      const totals = getGroupTotals(typeItems);
      rows.push([
        { content: "", styles: GRAY_BOLD },
        {
          content: type.name,
          colSpan: 2,
          styles: { ...GRAY_BOLD, halign: "center" },
        },
        { content: "", styles: GRAY_BOLD },
        { content: "", styles: GRAY_BOLD },
        ...totals.map((t) => ({
          content: t,
          styles: { ...GRAY_BOLD, ...RIGHT },
        })),
      ]);
    }
    isFirst = false;

    typeItems.forEach((item) => {
      rows.push(itemRow(item, globalIdx, syncQty, getPrices(item)));
      globalIdx++;
    });
  });

  return rows;
}

function buildSinglePricePDF(
  doc: jsPDF,
  items: OrderItem[],
  garmentTypes: GarmentType[],
  productCode: string,
  syncQty: number,
  priceType: "company" | "market",
) {
  printHeader(doc, productCode, syncQty);

  const getPrice = (i: OrderItem) =>
    priceType === "company" ? i.price_company : i.price_market;

  const grandTotal = fmt(items.reduce((sum, i) => sum + getPrice(i), 0));
  const firstType = garmentTypes.find((t) =>
    items.some((i) => i.type_id === t.id),
  );
  const firstTypeTotal = fmt(
    firstType
      ? items
          .filter((i) => i.type_id === firstType.id)
          .reduce((sum, i) => sum + getPrice(i), 0)
      : 0,
  );
  const priceLabel = priceType === "company" ? "Giá xưởng" : "Giá ngoài";

  autoTable(doc, {
    startY: 47,
    head: [
      [
        {
          content: "Stt",
          rowSpan: 3,
          styles: { ...GRAY_BOLD, ...CENTER_MIDDLE },
        },
        {
          content: "Tên công đoạn",
          rowSpan: 2,
          styles: { ...GRAY_BOLD, ...CENTER_MIDDLE },
        },
        {
          content: "SL\ncắt",
          rowSpan: 3,
          styles: { ...GRAY_BOLD, ...CENTER_MIDDLE },
        },
        {
          content: "Xưởng may",
          rowSpan: 3,
          styles: { ...GRAY_BOLD, ...CENTER_MIDDLE },
        },
        {
          content: "Ngoài may",
          rowSpan: 3,
          styles: { ...GRAY_BOLD, ...CENTER_MIDDLE },
        },
        { content: priceLabel, styles: { ...GRAY_BOLD, halign: "center" } },
      ],
      [{ content: grandTotal, styles: { ...GRAY_BOLD, ...RIGHT } }],
      [
        {
          content: firstType?.name ?? "",
          styles: { ...GRAY_BOLD, halign: "center" },
        },
        { content: firstTypeTotal, styles: { ...GRAY_BOLD, ...RIGHT } },
      ],
    ],
    body: buildRows(
      items,
      garmentTypes,
      syncQty,
      (i) => [fmt(getPrice(i))],
      (typeItems) => [fmt(typeItems.reduce((sum, i) => sum + getPrice(i), 0))],
    ),
    theme: "grid",
    styles: BASE_TABLE_STYLES,
    headStyles: HEAD_STYLES,
    columnStyles: {
      0: { cellWidth: COL.stt },
      1: { cellWidth: COL.tenSingle },
      2: { cellWidth: COL.slCat },
      3: { cellWidth: COL.xuongMayNarrow },
      4: { cellWidth: COL.ngoaiMayNarrow },
      5: { cellWidth: COL.priceCompact },
    },
    margin: { left: 5, right: 5 },
  });
}

// ── Both prices ───────────────────────────────────────────
function buildBothPricePDF(
  doc: jsPDF,
  items: OrderItem[],
  garmentTypes: GarmentType[],
  productCode: string,
  syncQty: number,
) {
  printHeader(doc, productCode, syncQty);

  const grandTotalCompany = fmt(
    items.reduce((sum, i) => sum + i.price_company, 0),
  );
  const grandTotalMarket = fmt(
    items.reduce((sum, i) => sum + i.price_market, 0),
  );
  const firstType = garmentTypes.find((t) =>
    items.some((i) => i.type_id === t.id),
  );
  const firstTypeCompany = fmt(
    firstType
      ? items
          .filter((i) => i.type_id === firstType.id)
          .reduce((sum, i) => sum + i.price_company, 0)
      : 0,
  );
  const firstTypeMarket = fmt(
    firstType
      ? items
          .filter((i) => i.type_id === firstType.id)
          .reduce((sum, i) => sum + i.price_market, 0)
      : 0,
  );

  autoTable(doc, {
    startY: 47,
    head: [
      [
        {
          content: "Stt",
          rowSpan: 3,
          styles: { ...GRAY_BOLD, ...CENTER_MIDDLE },
        },
        {
          content: "Tên công đoạn",
          rowSpan: 2,
          styles: { ...GRAY_BOLD, ...CENTER_MIDDLE },
        },
        {
          content: "SL\ncắt",
          rowSpan: 3,
          styles: { ...GRAY_BOLD, ...CENTER_MIDDLE },
        },
        {
          content: "Xưởng may",
          rowSpan: 3,
          styles: { ...GRAY_BOLD, ...CENTER_MIDDLE },
        },
        {
          content: "Ngoài may",
          rowSpan: 3,
          styles: { ...GRAY_BOLD, ...CENTER_MIDDLE },
        },
        { content: "Giá xưởng", styles: { ...GRAY_BOLD, halign: "center" } },
        { content: "Giá ngoài", styles: { ...GRAY_BOLD, halign: "center" } },
      ],
      [
        { content: grandTotalCompany, styles: { ...GRAY_BOLD, ...RIGHT } },
        { content: grandTotalMarket, styles: { ...GRAY_BOLD, ...RIGHT } },
      ],
      [
        {
          content: firstType?.name ?? "",
          styles: { ...GRAY_BOLD, halign: "center" },
        },
        { content: firstTypeCompany, styles: { ...GRAY_BOLD, ...RIGHT } },
        { content: firstTypeMarket, styles: { ...GRAY_BOLD, ...RIGHT } },
      ],
    ],
    body: buildRows(
      items,
      garmentTypes,
      syncQty,
      (i) => [fmt(i.price_company), fmt(i.price_market)],
      (typeItems) => [
        fmt(typeItems.reduce((sum, i) => sum + i.price_company, 0)),
        fmt(typeItems.reduce((sum, i) => sum + i.price_market, 0)),
      ],
    ),
    theme: "grid",
    styles: BASE_TABLE_STYLES,
    headStyles: HEAD_STYLES,
    columnStyles: {
      0: { cellWidth: COL.stt },
      1: { cellWidth: COL.tenBoth },
      2: { cellWidth: COL.slCat },
      3: { cellWidth: COL.xuongMay },
      4: { cellWidth: COL.ngoaiMay },
      5: { cellWidth: COL.price, fontSize: 7 },
      6: { cellWidth: COL.price, fontSize: 7 },
    },
    margin: { left: 5, right: 5 },
  });
}

// ── Export chính ─────────────────────────────────────────
export function printPDF(
  items: OrderItem[],
  garmentTypes: GarmentType[],
  productCode: string,
  syncQty: number,
  priceType: PriceType,
) {
  const doc = setupDoc();

  if (priceType === "both") {
    buildBothPricePDF(doc, items, garmentTypes, productCode, syncQty);
  } else {
    buildSinglePricePDF(
      doc,
      items,
      garmentTypes,
      productCode,
      syncQty,
      priceType,
    );
  }

  doc.save(`quy-trinh-${productCode || "san-xuat"}.pdf`);
}
