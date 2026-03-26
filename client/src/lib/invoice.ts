import { jsPDF } from "jspdf";

type InvoiceItem = {
  id?: string;
  type?: string;
  brand?: string;
  model?: string;
  price?: number;
  qty?: number;
};

type InvoicePayment = {
  bank?: string | null;
  method?: string | null;
  reference?: string | null;
  holderName?: string | null;
};

type InvoiceOrder = {
  id: string;
  orderNumber?: string;
  createdAt?: string;
  status?: string;
  subtotal?: number;
  shipping?: number;
  total?: number;
  notes?: string | null;
  items?: InvoiceItem[];
  payment?: InvoicePayment | null;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

type InvoiceOptions = {
  customerName?: string;
  customerEmail?: string;
};

type CatalogItem = {
  id?: string;
  type?: string;
  brand?: string;
  model?: string;
  price?: number;
  stock?: number;
  status?: string;
};

async function loadImageAsDataUrl(src: string) {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error("No se pudo cargar el logo.");
  }

  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer el logo."));
    reader.readAsDataURL(blob);
  });
}

function money(value: unknown) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function formatDate(value?: string) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleString();
}

function paymentMethodLabel(method?: string | null) {
  switch (method) {
    case "BANK_TRANSFER":
      return "Transferencia bancaria";
    case "DEPOSIT":
      return "Deposito";
    default:
      return method || "-";
  }
}

function statusLabel(status?: string) {
  switch (status) {
    case "PAID":
      return "Pagado";
    case "REJECTED":
      return "Rechazado";
    case "CANCELLED":
      return "Cancelado";
    case "PENDING_PAYMENT":
      return "Pendiente";
    default:
      return status || "Pendiente";
  }
}

function drawLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(label.toUpperCase(), x, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const lines = doc.splitTextToSize(value || "-", width);
  doc.text(lines, x, y + 6);
}

export async function openInvoiceWindow(order: InvoiceOrder, options: InvoiceOptions = {}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const logoDataUrl = await loadImageAsDataUrl("/logo.png");

  const customerName = options.customerName || order.user?.name || "Cliente";
  const customerEmail = options.customerEmail || order.user?.email || "-";
  const orderNumber = order.orderNumber || order.id;
  const createdAt = formatDate(order.createdAt);
  const subtotal = Number(order.subtotal ?? order.total ?? 0);
  const shipping = Number(order.shipping ?? 0);
  const total = Number(order.total ?? subtotal + shipping);

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 38, "F");
  doc.addImage(logoDataUrl, "PNG", margin, 8, 18, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("FACTURA", margin + 24, 16);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Diamond Grid", margin + 24, 24);
  doc.text(`Pedido: ${orderNumber}`, pageWidth - margin, 16, { align: "right" });
  doc.text(`Fecha: ${createdAt}`, pageWidth - margin, 24, { align: "right" });
  doc.text(`Estado: ${statusLabel(order.status)}`, pageWidth - margin, 31, { align: "right" });

  let y = 48;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, 87, 30, 4, 4, "FD");
  doc.roundedRect(pageWidth - margin - 87, y, 87, 30, 4, 4, "FD");

  drawLabelValue(doc, "Cliente", customerName, margin + 4, y + 6, 79);
  drawLabelValue(doc, "Correo", customerEmail, margin + 4, y + 18, 79);

  drawLabelValue(doc, "Metodo", paymentMethodLabel(order.payment?.method), pageWidth - margin - 83, y + 6, 79);
  drawLabelValue(doc, "Banco", order.payment?.bank || "-", pageWidth - margin - 83, y + 18, 79);

  y += 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Detalle del pedido", margin, y);
  y += 6;

  const colX = [margin, 28, 110, 138, 156, 178];
  const headers = ["#", "Producto", "Tipo", "Cant.", "Precio", "Total"];

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  headers.forEach((header, index) => {
    const align = index >= 3 ? "right" : "left";
    doc.text(header, colX[index], y + 6, { align: align as "left" | "right" });
  });

  y += 13;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const items = order.items || [];
  if (items.length === 0) {
    doc.text("Sin items registrados.", margin, y);
    y += 8;
  } else {
    items.forEach((item, index) => {
      const qty = Number(item.qty ?? 0);
      const price = Number(item.price ?? 0);
      const lineTotal = qty * price;
      const productName = `${item.brand || ""} ${item.model || ""}`.trim() || `Producto ${index + 1}`;
      const productLines = doc.splitTextToSize(productName, 78);
      const typeLines = doc.splitTextToSize(item.type || "-", 24);
      const rowHeight = Math.max(productLines.length, typeLines.length) * 5 + 3;

      if (y + rowHeight > pageHeight - 45) {
        doc.addPage();
        y = margin;
        pageHeight = doc.internal.pageSize.getHeight();
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y - 3, pageWidth - margin, y - 3);
      doc.text(String(index + 1), colX[0], y);
      doc.text(productLines, colX[1], y);
      doc.text(typeLines, colX[2], y);
      doc.text(String(qty), colX[3], y, { align: "right" });
      doc.text(money(price), colX[4], y, { align: "right" });
      doc.text(money(lineTotal), colX[5], y, { align: "right" });
      y += rowHeight;
    });
  }

  y += 6;
  const summaryX = 135;
  const summaryWidth = pageWidth - summaryX - margin;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryX, y, summaryWidth, 28, 4, 4, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Subtotal", summaryX + 4, y + 8);
  doc.text(money(subtotal), summaryX + summaryWidth - 4, y + 8, { align: "right" });
  doc.text("Envio", summaryX + 4, y + 16);
  doc.text(money(shipping), summaryX + summaryWidth - 4, y + 16, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(8, 145, 178);
  doc.text("Total", summaryX + 4, y + 24);
  doc.text(money(total), summaryX + summaryWidth - 4, y + 24, { align: "right" });

  y += 38;
  if (y > pageHeight - 35) {
    doc.addPage();
    y = margin;
  }

  doc.setFillColor(252, 252, 253);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 4, 4, "FD");
  drawLabelValue(doc, "Referencia", order.payment?.reference || "-", margin + 4, y + 6, 80);
  drawLabelValue(doc, "Titular", order.payment?.holderName || "-", 100, y + 6, 80);

  y += 32;
  if (y > pageHeight - 30) {
    doc.addPage();
    y = margin;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text("Notas", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const noteLines = doc.splitTextToSize(order.notes || "Sin notas adicionales.", pageWidth - margin * 2);
  doc.text(noteLines, margin, y + 7);

  const fileName = `factura-${orderNumber.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
  doc.save(fileName);
  return true;
}

export async function downloadCatalogPdf(
  items: CatalogItem[],
  options: { title?: string; filename?: string } = {}
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const logoDataUrl = await loadImageAsDataUrl("/logo.png");
  const title = options.title || "Catalogo de componentes";
  const filename = options.filename || "diamond-grid-components.pdf";
  const generatedAt = new Date().toLocaleString();
  const totalStock = items.reduce((sum, item) => sum + Number(item.stock ?? 0), 0);
  const totalValue = items.reduce((sum, item) => sum + Number(item.stock ?? 0) * Number(item.price ?? 0), 0);
  const activeCount = items.filter((item) => item.status !== "inactive").length;
  const inactiveCount = items.length - activeCount;
  const cols = [margin, 30, 105, 138, 160, 182];
  const headers = ["#", "Producto", "Tipo", "Stock", "Estado", "Precio"];

  function drawPageHeader(pageNumber: number, totalPages?: number) {
    const currentPageHeight = doc.internal.pageSize.getHeight();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 34, "F");
    doc.addImage(logoDataUrl, "PNG", margin, 8, 16, 16);

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, margin + 22, 17);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generado: ${generatedAt}`, pageWidth - margin, 17, { align: "right" });
    doc.text(`Pagina ${pageNumber}${totalPages ? ` / ${totalPages}` : ""}`, pageWidth - margin, 24, { align: "right" });

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Diamond Grid", margin, currentPageHeight - 8);
    doc.text(`Catalogo exportado: ${items.length} registros`, pageWidth - margin, currentPageHeight - 8, { align: "right" });
  }

  function drawSummaryCards(startY: number) {
    const cardWidth = (pageWidth - margin * 2 - 12) / 3;
    const cards = [
      { label: "Registros", value: String(items.length), color: [34, 211, 238] as const },
      { label: "Stock total", value: String(totalStock), color: [94, 234, 212] as const },
      { label: "Inventario", value: money(totalValue), color: [251, 191, 36] as const },
    ];

    cards.forEach((card, index) => {
      const x = margin + index * (cardWidth + 6);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, startY, cardWidth, 18, 4, 4, "FD");
      doc.setFillColor(card.color[0], card.color[1], card.color[2]);
      doc.roundedRect(x + 3, startY + 3, 2.5, 12, 2, 2, "F");
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(card.label.toUpperCase(), x + 9, startY + 7);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.text(card.value, x + 9, startY + 13);
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Activos: ${activeCount}  |  Inactivos: ${inactiveCount}`, margin, startY + 25);
  }

  function drawTableHeader(startY: number) {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, startY, pageWidth - margin * 2, 9, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    headers.forEach((header, index) => {
      const align = index >= 3 ? "right" : "left";
      doc.text(header, cols[index], startY + 6, { align: align as "left" | "right" });
    });
  }

  drawPageHeader(1);
  drawSummaryCards(42);

  let y = 75;
  drawTableHeader(y);

  y += 13;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (items.length === 0) {
    doc.text("No hay componentes para exportar.", margin, y);
    doc.save(filename);
    return true;
  }

  items.forEach((item, index) => {
    const productName = `${item.brand || ""} ${item.model || ""}`.trim() || `Producto ${index + 1}`;
    const productLines = doc.splitTextToSize(productName, 70);
    const typeLines = doc.splitTextToSize(item.type || "-", 26);
    const status = item.status === "inactive" ? "Inactivo" : "Activo";
    const rowHeight = Math.max(productLines.length, typeLines.length) * 5 + 3;
    const currentPageHeight = doc.internal.pageSize.getHeight();

    if (y + rowHeight > currentPageHeight - 18) {
      doc.addPage();
      drawPageHeader(doc.getNumberOfPages());
      y = 24;
      drawTableHeader(y);
      y += 13;
    }

    if (index % 2 === 0) {
      doc.setFillColor(250, 251, 252);
      doc.rect(margin, y - 4, pageWidth - margin * 2, rowHeight + 1, "F");
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y - 3, pageWidth - margin, y - 3);
    doc.text(String(index + 1), cols[0], y);
    doc.text(productLines, cols[1], y);
    doc.text(typeLines, cols[2], y);
    doc.text(String(Number(item.stock ?? 0)), cols[3], y, { align: "right" });
    doc.text(status, cols[4], y, { align: "right" });
    doc.text(money(item.price), cols[5], y, { align: "right" });
    y += rowHeight;
  });

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    drawPageHeader(page, totalPages);
  }

  doc.save(filename);
  return true;
}
