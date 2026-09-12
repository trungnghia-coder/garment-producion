import * as XLSX from "xlsx-js-style";
import { OrderItem } from "@/types/stage";
import { GarmentType } from "@/lib/firebase/garment-types";

export type ExcelPriceType = "company" | "market" | "both";

// ── Constants ─────────────────────────────────────────────
const BORDER = {
  top: { style: "thin" as const, color: { rgb: "000000" } },
  bottom: { style: "thin" as const, color: { rgb: "000000" } },
  left: { style: "thin" as const, color: { rgb: "000000" } },
  right: { style: "thin" as const, color: { rgb: "000000" } },
};
const GRAY_BG = { fgColor: { rgb: "B4B4B4" }, patternType: "solid" as const };
const SZ = 12;

const S = {
  headerCenter: {
    font: { bold: true, sz: SZ },
    fill: GRAY_BG,
    alignment: {
      horizontal: "center" as const,
      vertical: "center" as const,
      wrapText: true,
    },
    border: BORDER,
  },
  headerRight: {
    font: { bold: true, sz: SZ },
    fill: GRAY_BG,
    alignment: { horizontal: "right" as const, vertical: "center" as const },
    border: BORDER,
  },
  headerEmpty: { font: { sz: SZ }, fill: GRAY_BG, border: BORDER },
  groupCenter: {
    font: { bold: true, sz: SZ },
    fill: GRAY_BG,
    alignment: { horizontal: "center" as const },
    border: BORDER,
  },
  groupRight: {
    font: { bold: true, sz: SZ },
    fill: GRAY_BG,
    alignment: { horizontal: "right" as const },
    border: BORDER,
  },
  groupEmpty: { font: { sz: SZ }, fill: GRAY_BG, border: BORDER },
  normal: {
    font: { sz: SZ },
    alignment: { vertical: "center" as const },
    border: BORDER,
  },
  center: {
    font: { sz: SZ },
    alignment: { horizontal: "center" as const },
    border: BORDER,
  },
  right: {
    font: { sz: SZ },
    alignment: { horizontal: "right" as const },
    border: BORDER,
  },
};

// ── Helpers ───────────────────────────────────────────────
function cell(v: string | number | { f: string }, s: object): XLSX.CellObject {
  if (typeof v === "object" && "f" in v)
    return { t: "n", f: v.f, s } as XLSX.CellObject;
  return { t: typeof v === "number" ? "n" : "s", v, s } as XLSX.CellObject;
}

function encCol(c: number) {
  return XLSX.utils.encode_col(c);
}

// Điền border cho tất cả ô trong vùng merge (để viền đều)
function fillMergeBorder(
  ws: XLSX.WorkSheet,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  s: object,
) {
  for (let ri = r1; ri <= r2; ri++) {
    for (let ci = c1; ci <= c2; ci++) {
      const addr = XLSX.utils.encode_cell({ r: ri, c: ci });
      if (!ws[addr]) ws[addr] = { t: "z", s } as XLSX.CellObject;
      else ws[addr].s = s;
    }
  }
}

function getPriceCols(priceType: ExcelPriceType) {
  if (priceType === "company")
    return [{ label: "Giá xưởng", key: "company" as const }];
  if (priceType === "market")
    return [{ label: "Giá ngoài", key: "market" as const }];
  return [
    { label: "Giá xưởng", key: "company" as const },
    { label: "Giá ngoài", key: "market" as const },
  ];
}

function priceOf(item: OrderItem, key: "company" | "market") {
  return key === "company" ? item.price_company : item.price_market;
}

// ── Main export ───────────────────────────────────────────
export function exportExcel(
  items: OrderItem[],
  garmentTypes: GarmentType[],
  productCode: string,
  syncQty: number,
  priceType: ExcelPriceType,
) {
  const wb = XLSX.utils.book_new();
  const priceCols = getPriceCols(priceType);
  const PRICE_START = 5;
  const TOTAL_COLS = PRICE_START + priceCols.length;

  const ws: XLSX.WorkSheet = {};
  const merges: XLSX.Range[] = [];
  let r = 0;

  // ── Info rows ─────────────────────────────────────────────
  // Chỉ "QUI TRÌNH..." căn giữa, còn lại căn trái
  const infoRows: [string, boolean, number, "center" | "left"][] = [
    ["CÔNG TY CỔ PHẦN THỜI TRANG HALEN VIỆT NAM", true, 12, "left"],
    ["PHÒNG KỸ THUẬT", false, 12, "left"],
    ["QUI TRÌNH CÔNG ĐOẠN SẢN XUẤT", true, 13, "center"],
    [`Mã sản phẩm: ${productCode}`, false, 12, "left"],
    [`Số lượng: ${syncQty} bộ`, false, 12, "left"],
  ];

  infoRows.forEach(([text, bold, sz, align]) => {
    ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(text, {
      font: { bold, sz },
      alignment: { horizontal: align },
    });
    merges.push({ s: { r, c: 0 }, e: { r, c: TOTAL_COLS - 1 } });
    r++;
  });
  r++; // dòng trống

  // ── Table header (3 dòng) ─────────────────────────────────
  const headerStartRow = r;
  const grandTotalRow = r + 1;
  const firstGroupHeaderRow = r + 2;

  // Dòng 1: label cột
  ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell("Stt", S.headerCenter);
  ws[XLSX.utils.encode_cell({ r, c: 1 })] = cell(
    "Tên công đoạn",
    S.headerCenter,
  );
  ws[XLSX.utils.encode_cell({ r, c: 2 })] = cell("SL\ncắt", S.headerCenter);
  ws[XLSX.utils.encode_cell({ r, c: 3 })] = cell("Xưởng may", S.headerCenter);
  ws[XLSX.utils.encode_cell({ r, c: 4 })] = cell("Ngoài may", S.headerCenter);
  priceCols.forEach((pc, ci) => {
    ws[XLSX.utils.encode_cell({ r, c: PRICE_START + ci })] = cell(
      pc.label,
      S.headerCenter,
    );
  });
  r++;

  // Dòng 2: grand total — phải set tất cả ô để border đều
  ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell("", S.headerEmpty);
  ws[XLSX.utils.encode_cell({ r, c: 1 })] = cell("", S.headerEmpty);
  ws[XLSX.utils.encode_cell({ r, c: 2 })] = cell("", S.headerEmpty);
  ws[XLSX.utils.encode_cell({ r, c: 3 })] = cell("", S.headerEmpty);
  ws[XLSX.utils.encode_cell({ r, c: 4 })] = cell("", S.headerEmpty);
  priceCols.forEach((_, ci) => {
    ws[XLSX.utils.encode_cell({ r, c: PRICE_START + ci })] = cell(
      "",
      S.headerRight,
    );
  });
  r++;

  // Dòng 3: nhóm đầu
  const firstType = garmentTypes.find((t) =>
    items.some((i) => i.type_id === t.id),
  );
  ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell("", S.headerEmpty);
  ws[XLSX.utils.encode_cell({ r, c: 1 })] = cell(
    firstType?.name ?? "",
    S.groupCenter,
  );
  ws[XLSX.utils.encode_cell({ r, c: 2 })] = cell("", S.groupEmpty);
  ws[XLSX.utils.encode_cell({ r, c: 3 })] = cell("", S.headerEmpty);
  ws[XLSX.utils.encode_cell({ r, c: 4 })] = cell("", S.headerEmpty);
  priceCols.forEach((_, ci) => {
    ws[XLSX.utils.encode_cell({ r, c: PRICE_START + ci })] = cell(
      "",
      S.groupRight,
    );
  });
  r++;

  // Merges
  merges.push({
    s: { r: headerStartRow, c: 0 },
    e: { r: headerStartRow + 2, c: 0 },
  }); // STT rowSpan 3
  merges.push({
    s: { r: headerStartRow, c: 1 },
    e: { r: headerStartRow + 1, c: 1 },
  }); // Tên rowSpan 2
  merges.push({
    s: { r: headerStartRow, c: 2 },
    e: { r: headerStartRow + 1, c: 2 },
  }); // SL rowSpan 2
  fillMergeBorder(ws, headerStartRow, 2, headerStartRow + 1, 2, S.headerCenter); // SL
  merges.push({
    s: { r: headerStartRow, c: 3 },
    e: { r: headerStartRow + 2, c: 3 },
  }); // Xưởng rowSpan 3
  merges.push({
    s: { r: headerStartRow, c: 4 },
    e: { r: headerStartRow + 2, c: 4 },
  }); // Ngoài rowSpan 3
  merges.push({
    s: { r: firstGroupHeaderRow, c: 1 },
    e: { r: firstGroupHeaderRow, c: 2 },
  }); // Áo + SL

  // Fill border tất cả ô trong vùng merge
  fillMergeBorder(ws, headerStartRow, 0, headerStartRow + 2, 0, S.headerCenter); // STT
  fillMergeBorder(ws, headerStartRow, 1, headerStartRow + 1, 1, S.headerCenter); // Tên
  fillMergeBorder(ws, headerStartRow, 2, headerStartRow + 1, 2, S.headerCenter);
  fillMergeBorder(ws, headerStartRow, 3, headerStartRow + 2, 3, S.headerCenter); // Xưởng
  fillMergeBorder(ws, headerStartRow, 4, headerStartRow + 2, 4, S.headerCenter); // Ngoài
  fillMergeBorder(
    ws,
    firstGroupHeaderRow,
    1,
    firstGroupHeaderRow,
    2,
    S.groupCenter,
  ); // Áo + SL

  // ── Data rows ─────────────────────────────────────────────
  let globalStt = 1;
  let isFirst = true;

  type GroupRange = {
    typeId: string;
    startRow: number;
    endRow: number;
    groupHeaderRow: number;
  };
  const groupRanges: GroupRange[] = [];

  garmentTypes.forEach((type) => {
    const typeItems = items.filter((i) => i.type_id === type.id);
    if (typeItems.length === 0) return;

    let groupHeaderRow = -1;
    if (!isFirst) {
      groupHeaderRow = r;
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell("", S.groupEmpty);
      ws[XLSX.utils.encode_cell({ r, c: 1 })] = cell(type.name, S.groupCenter);
      ws[XLSX.utils.encode_cell({ r, c: 2 })] = cell("", S.groupEmpty);
      ws[XLSX.utils.encode_cell({ r, c: 3 })] = cell("", S.groupEmpty);
      ws[XLSX.utils.encode_cell({ r, c: 4 })] = cell("", S.groupEmpty);
      priceCols.forEach((_, ci) => {
        ws[XLSX.utils.encode_cell({ r, c: PRICE_START + ci })] = cell(
          "",
          S.groupRight,
        );
      });
      r++;
    }
    isFirst = false;

    const dataStart = r;
    typeItems.forEach((item) => {
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(
        String(globalStt++).padStart(2, "0"),
        S.center,
      );
      ws[XLSX.utils.encode_cell({ r, c: 1 })] = cell(item.name, S.normal);
      ws[XLSX.utils.encode_cell({ r, c: 2 })] = cell(syncQty, S.center);
      ws[XLSX.utils.encode_cell({ r, c: 3 })] = cell("", S.normal);
      ws[XLSX.utils.encode_cell({ r, c: 4 })] = cell("", S.normal);
      priceCols.forEach((pc, ci) => {
        ws[XLSX.utils.encode_cell({ r, c: PRICE_START + ci })] = cell(
          priceOf(item, pc.key),
          S.right,
        );
      });
      r++;
    });

    groupRanges.push({
      typeId: type.id,
      startRow: dataStart,
      endRow: r - 1,
      groupHeaderRow,
    });
  });

  // ── SUM formulas ──────────────────────────────────────────
  // Tổng SL cắt của từng nhóm → dùng SUM data rows (không bao gồm group header)
  const slCol = encCol(2); // cột SL cắt

  groupRanges.forEach((g, gi) => {
    const exStart = g.startRow + 1; // Excel 1-based
    const exEnd = g.endRow + 1;

    priceCols.forEach((_, ci) => {
      const colL = encCol(PRICE_START + ci);
      const formula = `SUM(${colL}${exStart}:${colL}${exEnd})`;
      const targetRow = gi === 0 ? firstGroupHeaderRow : g.groupHeaderRow;
      ws[XLSX.utils.encode_cell({ r: targetRow, c: PRICE_START + ci })] = cell(
        { f: formula },
        S.groupRight,
      );
    });
  });

  // Grand total = SUM của các ô group total (không phải SUM toàn range)
  // → dùng SUM(group1Total, group2Total, ...) để tránh cộng trùng
  priceCols.forEach((_, ci) => {
    const colL = encCol(PRICE_START + ci);
    const groupTotalRefs = groupRanges.map((g, gi) => {
      const targetRow =
        gi === 0 ? firstGroupHeaderRow + 1 : g.groupHeaderRow + 1; // Excel 1-based
      return `${colL}${targetRow}`;
    });
    const formula = groupTotalRefs.join("+");
    ws[XLSX.utils.encode_cell({ r: grandTotalRow, c: PRICE_START + ci })] =
      cell({ f: formula }, S.headerRight);
  });

  // Tổng SL cắt = SUM tất cả data rows (chỉ data, không lấy group header)
  {
    const allDataRefs = groupRanges.map((g) => {
      const exStart = g.startRow + 1;
      const exEnd = g.endRow + 1;
      return `SUM(${slCol}${exStart}:${slCol}${exEnd})`;
    });
    // Đặt tổng SL vào dòng grand total, cột SL
    ws[XLSX.utils.encode_cell({ r: grandTotalRow, c: 2 })] = cell(
      { f: allDataRefs.join("+") },
      S.headerRight,
    );
  }

  // ── Finalize ──────────────────────────────────────────────
  ws["!merges"] = merges;
  ws["!cols"] = [
    { wch: 6 },
    { wch: 38 },
    { wch: 6 },
    { wch: 40 },
    { wch: 40 },
    ...priceCols.map(() => ({ wch: 6 })),
  ];
  ws["!rows"] = [
    { hpt: 16 },
    { hpt: 14 },
    { hpt: 18 },
    { hpt: 14 },
    { hpt: 14 },
    { hpt: 6 },
    { hpt: 30 },
    { hpt: 14 },
    { hpt: 14 },
  ];
  ws["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: r - 1, c: TOTAL_COLS - 1 },
  });

  XLSX.utils.book_append_sheet(wb, ws, "Công đoạn");

  const metaWs = XLSX.utils.aoa_to_sheet([
    ["Mã sản phẩm", productCode],
    ["Số lượng", syncQty],
  ]);
  XLSX.utils.book_append_sheet(wb, metaWs, "Thông tin");

  XLSX.writeFile(wb, `cong-doan-${productCode || "san-xuat"}.xlsx`);
}
