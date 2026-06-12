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

  // ── Embed font NotoSans (hỗ trợ tiếng Việt) ──────────
  doc.addFileToVFS("NotoSans-normal.ttf", NotoSansFont);
  doc.addFont("NotoSans-normal.ttf", "NotoSans", "normal");

  doc.addFileToVFS("NotoSans-bold.ttf", NotoSansFont); // dùng tạm cùng file cho bold
  doc.addFont("NotoSans-bold.ttf", "NotoSans", "bold");

  doc.setFont("NotoSans");

  // ── Header ──────────────────────────────────────────
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
  doc.text(`Mã sản phẩm: Bộ tole lửng sát nách ${productCode}`, 14, 35);
  doc.text(`Số lượng: ${syncQty} bộ`, 14, 41);

  const grandTotalCompany = items.reduce((sum, i) => sum + i.price_company, 0);
  const grandTotalMarket = items.reduce((sum, i) => sum + i.price_market, 0);

  doc.setFont("NotoSans", "bold");
  doc.text(grandTotalCompany.toLocaleString("vi-VN"), 196, 35, {
    align: "right",
  });
  doc.text(grandTotalMarket.toLocaleString("vi-VN"), 196, 41, {
    align: "right",
  });
  doc.setFont("NotoSans", "normal");

  let currentY = 47;

  // ── Group theo garment type ──────────────────────────
  garmentTypes.forEach((type) => {
    const typeItems = items.filter((i) => i.type_id === type.id);
    if (typeItems.length === 0) return;

    const totalCompany = typeItems.reduce((sum, i) => sum + i.price_company, 0);

    const itemRows = typeItems.map((item, idx) => [
      {
        content: String(idx + 1).padStart(2, "0"),
        styles: { halign: "center" as const },
      },
      { content: item.name },
      {
        content: String(syncQty),
        styles: { halign: "center" as const },
      },
      { content: "" },
      { content: "" },
      {
        content: item.price_company.toLocaleString("vi-VN"),
        styles: { halign: "right" as const },
      },
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          { content: "Stt", styles: { halign: "center", fontStyle: "bold" } },
          { content: "Tên công đoạn", styles: { fontStyle: "bold" } },
          {
            content: "Số lượng\ncắt",
            styles: { halign: "center", fontStyle: "bold" },
          },
          {
            content: "Thợ may",
            styles: { halign: "center", fontStyle: "bold" },
          },
          {
            content: "Ghi chú",
            styles: { halign: "center", fontStyle: "bold" },
          },
          {
            content: "Giá thành",
            styles: { halign: "right", fontStyle: "bold" },
          },
        ],
      ],
      body: [
        [
          {
            content: type.name,
            colSpan: 5,
            styles: {
              fontStyle: "bold",
              fillColor: [200, 200, 200] as [number, number, number],
            },
          },
          {
            content: totalCompany.toLocaleString("vi-VN"),
            styles: {
              halign: "right" as const,
              fontStyle: "bold",
              fillColor: [200, 200, 200] as [number, number, number],
            },
          },
        ],
        ...itemRows,
      ],
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 2,
        font: "NotoSans",
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        font: "NotoSans",
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 70 },
        2: { cellWidth: 20 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 },
        5: { cellWidth: 20 },
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc.lastAutoTable?.finalY ?? currentY) + 4;
  });
  currentY += 10;
  doc.setFontSize(10);
  doc.setFont("NotoSans", "normal");

  doc.save(`quy-trinh-${productCode || "san-xuat"}.pdf`);
}
