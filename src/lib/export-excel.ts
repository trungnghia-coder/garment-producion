import * as XLSX from "xlsx";
import { OrderItem } from "@/types/stage";
import { GarmentType } from "@/lib/firebase/garment-types";

export type ExcelPriceType = "company" | "market" | "both";

function col(c: number, r: number): string {
  return XLSX.utils.encode_cell({ c, r });
}

function applyStyle(ws: XLSX.WorkSheet, cell: string, style: object) {
  if (!ws[cell]) ws[cell] = { t: "z" };
  ws[cell].s = style;
}

const HEADER_STYLE = {
  font: { bold: true },
  fill: { fgColor: { rgb: "CCCCCC" }, patternType: "solid" },
  alignment: { horizontal: "center" },
};

const TOTAL_LABEL_STYLE = {
  font: { bold: true },
};

const TOTAL_VALUE_STYLE = {
  font: { bold: true },
  numFmt: "#,##0",
};

function getColumns(priceType: ExcelPriceType) {
  const base = [
    { header: "STT", key: "stt", wch: 6 },
    { header: "Loại công đoạn", key: "type", wch: 16 },
    { header: "Tên công đoạn", key: "name", wch: 40 },
    { header: "Số lượng cắt", key: "qty", wch: 14 },
  ];
  if (priceType === "company")
    return [...base, { header: "Giá xưởng", key: "company", wch: 14 }];
  if (priceType === "market")
    return [...base, { header: "Giá ngoài", key: "market", wch: 14 }];
  return [
    ...base,
    { header: "Giá xưởng", key: "company", wch: 14 },
    { header: "Giá ngoài", key: "market", wch: 14 },
  ];
}

export function exportExcel(
  items: OrderItem[],
  garmentTypes: GarmentType[],
  productCode: string,
  syncQty: number,
  priceType: ExcelPriceType,
) {
  const wb = XLSX.utils.book_new();
  const cols = getColumns(priceType);
  const typeMap = new Map(garmentTypes.map((t) => [t.id, t.name]));

  const aoa: (string | number | { f: string })[][] = [];

  // Header row
  aoa.push(cols.map((c) => c.header));
  const headerRowIdx = 0;

  let stt = 1;
  const priceRowIndices: number[] = [];

  items.forEach((item) => {
    const row: (string | number)[] = [
      stt++,
      typeMap.get(item.type_id) ?? "—",
      item.name,
      syncQty,
    ];

    if (priceType === "company") row.push(item.price_company);
    else if (priceType === "market") row.push(item.price_market);
    else row.push(item.price_company, item.price_market);

    priceRowIndices.push(aoa.length);
    aoa.push(row);
  });

  const totalRow: (string | { f: string })[] = ["", "", "TỔNG"];
  const firstDataRow = headerRowIdx + 2;
  const lastDataRow = firstDataRow + items.length - 1;

  const priceColStart = 4;

  if (priceType === "company") {
    const colLetter = XLSX.utils.encode_col(priceColStart);
    totalRow.push({
      f: `SUM(${colLetter}${firstDataRow}:${colLetter}${lastDataRow})`,
    });
  } else if (priceType === "market") {
    const colLetter = XLSX.utils.encode_col(priceColStart);
    totalRow.push({
      f: `SUM(${colLetter}${firstDataRow}:${colLetter}${lastDataRow})`,
    });
  } else {
    const col1 = XLSX.utils.encode_col(priceColStart);
    const col2 = XLSX.utils.encode_col(priceColStart + 1);
    totalRow.push(
      { f: `SUM(D${firstDataRow}:D${lastDataRow})` },
      { f: `SUM(${col1}${firstDataRow}:${col1}${lastDataRow})` },
      { f: `SUM(${col2}${firstDataRow}:${col2}${lastDataRow})` },
    );
  }

  const totalRowIdx = aoa.length;
  aoa.push(totalRow as (string | number | { f: string })[]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws["!cols"] = cols.map((c) => ({ wch: c.wch }));

  cols.forEach((_, ci) => {
    applyStyle(ws, col(ci, headerRowIdx), HEADER_STYLE);
  });

  applyStyle(ws, col(2, totalRowIdx), TOTAL_LABEL_STYLE); // chữ "TỔNG"
  if (priceType === "both") {
    applyStyle(ws, col(priceColStart, totalRowIdx), TOTAL_VALUE_STYLE);
    applyStyle(ws, col(priceColStart + 1, totalRowIdx), TOTAL_VALUE_STYLE);
  } else {
    applyStyle(ws, col(priceColStart, totalRowIdx), TOTAL_VALUE_STYLE);
  }

  XLSX.utils.book_append_sheet(wb, ws, "Công đoạn");

  const metaWs = XLSX.utils.aoa_to_sheet([
    ["Mã sản phẩm", productCode],
    ["Số lượng", syncQty],
  ]);
  XLSX.utils.book_append_sheet(wb, metaWs, "Thông tin");

  XLSX.writeFile(wb, `cong-doan-${productCode || "san-xuat"}.xlsx`);
}
