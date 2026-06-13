import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { OrderItem } from "@/types/stage";
import { GarmentType } from "./firebase/garment-types";
import { NotoSansFont } from "@/fonts/NotoSans-normal";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

export function printPDF(
  items: OrderItem[],
  garmentTypes: GarmentType[],
  productCode: string,
  syncQty: number,
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.addFileToVFS("NotoSans-normal.ttf", NotoSansFont);
  doc.addFont("NotoSans-normal.ttf", "NotoSans", "normal");
  doc.addFileToVFS("NotoSans-bold.ttf", NotoSansFont);
  doc.addFont("NotoSans-bold.ttf", "NotoSans", "bold");
  doc.setFont("NotoSans");

  // ── Tiêu đề ─────────────────────────────────────────
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
  doc.text(`Mã sản phẩm: ${productCode}`, 14, 35);
  doc.text(`Số lượng: ${syncQty} bộ`, 14, 41);

  // ── Tính tổng ────────────────────────────────────────
  const grandTotalCompany = items.reduce((sum, i) => sum + i.price_company, 0);

  const firstType = garmentTypes.find((t) =>
    items.some((i) => i.type_id === t.id),
  );
  const firstTypeTotal = firstType
    ? items
        .filter((i) => i.type_id === firstType.id)
        .reduce((sum, i) => sum + i.price_company, 0)
    : 0;

  const GRAY: [number, number, number] = [180, 180, 180];
  const BLACK: [number, number, number] = [0, 0, 0];

  // ── Body rows (6 cột) ────────────────────────────────
  const allRows: object[][] = [];
  let isFirst = true;

  garmentTypes.forEach((type) => {
    const typeItems = items.filter((i) => i.type_id === type.id);
    if (typeItems.length === 0) return;

    const totalCompany = typeItems.reduce((sum, i) => sum + i.price_company, 0);

    if (!isFirst) {
      allRows.push([
        { content: "", styles: { fillColor: GRAY } },
        {
          content: type.name,
          colSpan: 1,
          styles: { fillColor: GRAY, fontStyle: "bold", halign: "center" },
        },
        {
          content: totalCompany.toLocaleString("vi-VN"),
          colSpan: 4,
          styles: { halign: "right", fillColor: GRAY, fontStyle: "bold" },
        },
      ]);
    }
    isFirst = false;

    typeItems.forEach((item, idx) => {
      allRows.push([
        {
          content: String(idx + 1).padStart(2, "0"),
          styles: { halign: "center" },
        },
        { content: item.name },
        { content: String(syncQty), styles: { halign: "center" } },
        { content: "" },
        { content: "" },
        {
          content: item.price_company.toLocaleString("vi-VN"),
          styles: { halign: "right" },
        },
      ]);
    });
  });

  autoTable(doc, {
    startY: 47,
    head: [
      // Dòng 1
      [
        {
          content: "Stt",
          rowSpan: 3,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: GRAY,
            textColor: BLACK,
            valign: "middle",
          },
        },
        {
          content: "Tên công đoạn",
          rowSpan: 2,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: GRAY,
            textColor: BLACK,
            valign: "middle",
          },
        },
        {
          content: "Số lượng\ncắt",
          rowSpan: 3,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: GRAY,
            textColor: BLACK,
            valign: "middle",
          },
        },
        {
          content: "Thợ may",
          rowSpan: 3,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: GRAY,
            textColor: BLACK,
            valign: "middle",
          },
        },
        {
          content: "Ghi chú",
          rowSpan: 3,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: GRAY,
            textColor: BLACK,
            valign: "middle",
          },
        },
        {
          content: "Giá thành",
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: GRAY,
            textColor: BLACK,
          },
        },
      ],
      // Dòng 2: tổng đơn ở cột Giá thành
      [
        {
          content: grandTotalCompany.toLocaleString("vi-VN"),
          styles: {
            halign: "right",
            fontStyle: "bold",
            fillColor: GRAY,
            textColor: BLACK,
          },
        },
      ],
      // Dòng 3: tên loại đầu + tổng loại đầu ở cột Giá thành
      [
        {
          content: firstType?.name ?? "",
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: GRAY,
            textColor: BLACK,
          },
        },
        {
          content: firstTypeTotal.toLocaleString("vi-VN"),
          styles: {
            halign: "right",
            fontStyle: "bold",
            fillColor: GRAY,
            textColor: BLACK,
          },
        },
      ],
    ],
    body: allRows,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 2,
      font: "NotoSans",
      textColor: BLACK,
      lineColor: BLACK,
      lineWidth: 0.2,
    },
    headStyles: {
      font: "NotoSans",
      textColor: BLACK,
      lineColor: BLACK,
      lineWidth: 0.2,
      minCellHeight: 6,
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 67 },
      2: { cellWidth: 18 },
      3: { cellWidth: 33 },
      4: { cellWidth: 28 },
      5: { cellWidth: 25 },
    },
    margin: { left: 14, right: 14 },
  });

  doc.setFontSize(10);
  doc.setFont("NotoSans", "normal");

  doc.save(`quy-trinh-${productCode || "san-xuat"}.pdf`);
}
