import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { login, register, requireAuth, requireRole, googleLogin } from "./auth";
import path from "path";
import multer from "multer";
import fs from "fs";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Servir carpeta uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Multer config (guardar archivos en /uploads)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

// helper: borrar archivo anterior si existe
function removeUploadByUrl(imageUrl?: string | null) {
  if (!imageUrl) return;
  const rel = imageUrl.startsWith("/uploads/") ? imageUrl.slice("/uploads/".length) : null;
  if (!rel) return;
  const filePath = path.join(process.cwd(), "uploads", rel);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch {}
  }
}

// ✅ Auth
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

// ✅ GOOGLE AUTH (POST)  ✅✅✅
app.post("/api/auth/google", googleLogin);

// (Opcional pero útil para que no te confunda al abrirlo en el navegador)
app.get("/api/auth/google", (_req, res) => {
  res.status(405).json({ ok: false, message: "Usa POST /api/auth/google con JSON: { credential }" });
});

// ✅ Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ✅ List components (por defecto solo activos)
app.get("/api/components", async (req, res) => {
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : "active";

  const items = await prisma.component.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { price: "asc" },
  });

  res.json(items);
});

// ✅ Get component by id (para /components/:id en frontend)
app.get("/api/components/:id", async (req, res) => {
  const { id } = req.params;
  const item = await prisma.component.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ ok: false, message: "No encontrado" });
  res.json(item);
});

// ✅ Create component con imagen (admin/worker)
app.post(
  "/api/components",
  requireAuth,
  requireRole(["admin", "worker"]),
  upload.single("image"),
  async (req, res) => {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const created = await prisma.component.create({
      data: {
        type: req.body.type,
        brand: req.body.brand,
        model: req.body.model,
        price: Number(req.body.price),
        scoreGaming: Number(req.body.scoreGaming ?? 0),
        scoreWork: Number(req.body.scoreWork ?? 0),
        watt: req.body.watt ? Number(req.body.watt) : null,
        meta: req.body.meta ? JSON.parse(req.body.meta) : undefined,
        imageUrl,
        stock: req.body.stock !== undefined ? Number(req.body.stock) : undefined,
        status: req.body.status ?? undefined,
      },
    });

    res.json(created);
  }
);

// ✅ Update component con imagen (admin/worker)
app.put(
  "/api/components/:id",
  requireAuth,
  requireRole(["admin", "worker"]),
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const current = await prisma.component.findUnique({ where: { id } });
      if (!current) return res.status(404).json({ ok: false, message: "Componente no encontrado" });

      const newImageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      if (req.file) removeUploadByUrl(current.imageUrl);

      const updated = await prisma.component.update({
        where: { id },
        data: {
          type: req.body.type ?? current.type,
          brand: req.body.brand ?? current.brand,
          model: req.body.model ?? current.model,
          price: req.body.price !== undefined ? Number(req.body.price) : current.price,
          scoreGaming: req.body.scoreGaming !== undefined ? Number(req.body.scoreGaming) : current.scoreGaming,
          scoreWork: req.body.scoreWork !== undefined ? Number(req.body.scoreWork) : current.scoreWork,
          watt: req.body.watt !== undefined ? (req.body.watt === "" ? null : Number(req.body.watt)) : current.watt,
          meta: req.body.meta ? JSON.parse(req.body.meta) : current.meta,
          imageUrl: newImageUrl ?? current.imageUrl,
          stock: req.body.stock !== undefined ? Number(req.body.stock) : current.stock,
          status: req.body.status ?? current.status,
        },
      });

      res.json(updated);
    } catch {
      res.status(500).json({ ok: false, message: "Error al actualizar" });
    }
  }
);

// ✅ Delete component (admin/worker) + borra imagen
app.delete(
  "/api/components/:id",
  requireAuth,
  requireRole(["admin", "worker"]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const current = await prisma.component.findUnique({ where: { id } });
      if (!current) return res.status(404).json({ ok: false, message: "Componente no encontrado" });

      removeUploadByUrl(current.imageUrl);
      await prisma.component.delete({ where: { id } });

      res.json({ ok: true });
    } catch {
      res.status(404).json({ ok: false, message: "Componente no encontrado" });
    }
  }
);

// ✅ PATCH stock (admin/worker)
const StockSchema = z.object({
  delta: z.number().int(),
});

app.patch(
  "/api/components/:id/stock",
  requireAuth,
  requireRole(["admin", "worker"]),
  async (req, res) => {
    const { id } = req.params;
    const parsed = StockSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, message: "Body inválido: { delta: number }" });

    const { delta } = parsed.data;

    try {
      const updated = await prisma.component.update({
        where: { id },
        data: {
          stock: { increment: delta },
        },
      });

      if (updated.stock < 0) {
        const fixed = await prisma.component.update({
          where: { id },
          data: { stock: 0 },
        });
        return res.json(fixed);
      }

      res.json(updated);
    } catch {
      res.status(404).json({ ok: false, message: "Componente no encontrado" });
    }
  }
);

// ✅ PATCH status (admin/worker)
const StatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

app.patch(
  "/api/components/:id/status",
  requireAuth,
  requireRole(["admin", "worker"]),
  async (req, res) => {
    const { id } = req.params;
    const parsed = StatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, message: "Body inválido: { status: 'active'|'inactive' }" });

    try {
      const updated = await prisma.component.update({
        where: { id },
        data: { status: parsed.data.status },
      });
      res.json(updated);
    } catch {
      res.status(404).json({ ok: false, message: "Componente no encontrado" });
    }
  }
);

// ✅ Seed
app.post("/api/seed", async (_req, res) => {
  const count = await prisma.component.count();
  if (count > 0) return res.json({ ok: true, message: "Already seeded" });

  await prisma.component.createMany({
    data: [
      { type: "CPU", brand: "AMD", model: "Ryzen 5 5600", price: 145, scoreGaming: 75, scoreWork: 70, watt: 65, meta: { socket: "AM4" }, stock: 5, status: "active" },
      { type: "CPU", brand: "Intel", model: "Core i5-12400F", price: 165, scoreGaming: 78, scoreWork: 72, watt: 65, meta: { socket: "LGA1700" }, stock: 5, status: "active" },
      { type: "GPU", brand: "NVIDIA", model: "RTX 4060", price: 320, scoreGaming: 85, scoreWork: 70, watt: 115, meta: { vram: "8GB" }, stock: 3, status: "active" },
      { type: "GPU", brand: "AMD", model: "RX 7600", price: 280, scoreGaming: 82, scoreWork: 65, watt: 165, meta: { vram: "8GB" }, stock: 3, status: "active" },
      { type: "RAM", brand: "Corsair", model: "16GB DDR4 3200", price: 45, scoreGaming: 40, scoreWork: 40, meta: { gb: 16, ddr: "DDR4" }, stock: 20, status: "active" },
      { type: "SSD", brand: "Kingston", model: "NVMe 1TB", price: 60, scoreGaming: 30, scoreWork: 45, meta: { gb: 1000, kind: "NVMe" }, stock: 15, status: "active" },
      { type: "PSU", brand: "EVGA", model: "650W Bronze", price: 70, scoreGaming: 20, scoreWork: 20, watt: 650, stock: 10, status: "active" },
    ],
  });

  res.json({ ok: true, message: "Seeded" });
});

// ✅ Recommend (chatbot)
const RecommendSchema = z.object({
  budget: z.number().min(100),
  purpose: z.enum(["gaming", "office", "design", "programming"]),
  preference: z.enum(["balanced", "performance", "cheap"]).default("balanced"),
});

function pickBest(items: any[], key: "scoreGaming" | "scoreWork", budget: number) {
  const scored = items
    .filter((x) => x.price <= budget)
    .map((x) => ({ ...x, value: (x[key] || 0) * 1.2 - x.price * 0.3 }))
    .sort((a, b) => b.value - a.value);
  return scored[0] ?? null;
}

app.post("/api/recommend", async (req, res) => {
  const parsed = RecommendSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, errors: parsed.error.flatten() });

  const { budget, purpose } = parsed.data;

  const split =
    purpose === "gaming"
      ? { cpu: 0.22, gpu: 0.45, ram: 0.08, ssd: 0.10, psu: 0.10 }
      : { cpu: 0.28, gpu: 0.18, ram: 0.10, ssd: 0.15, psu: 0.12 };

  const [cpus, gpus, rams, ssds, psus] = await Promise.all([
    prisma.component.findMany({ where: { type: "CPU", status: "active" } }),
    prisma.component.findMany({ where: { type: "GPU", status: "active" } }),
    prisma.component.findMany({ where: { type: "RAM", status: "active" } }),
    prisma.component.findMany({ where: { type: "SSD", status: "active" } }),
    prisma.component.findMany({ where: { type: "PSU", status: "active" } }),
  ]);

  const key = purpose === "gaming" ? "scoreGaming" : "scoreWork";

  const cpu = pickBest(cpus, key, budget * split.cpu);
  const gpu = pickBest(gpus, key, budget * split.gpu);
  const ram = pickBest(rams, key, budget * split.ram);
  const ssd = pickBest(ssds, key, budget * split.ssd);
  const psu = pickBest(psus, key, budget * split.psu);

  const parts = { cpu, gpu, ram, ssd, psu };
  const total = Object.values(parts).reduce((sum, p: any) => sum + (p?.price ?? 0), 0);

  const message =
    total <= budget
      ? `Listo ✅ Armé una configuración para ${purpose} por aprox. $${total.toFixed(2)}.`
      : `Te recomiendo subir un poco el presupuesto: la selección queda en $${total.toFixed(2)}.`;

  res.json({ ok: true, message, parts, total, budget });
});

// ✅ Export CSV (admin/worker)
app.get("/api/admin/components/export", requireAuth, requireRole(["admin","worker"]), async (_req, res) => {
  const items = await prisma.component.findMany({ orderBy: { type: "asc" } });

  const header = ["id","type","brand","model","price","stock","status","imageUrl"].join(",");
  const rows = items.map((c) =>
    [c.id, c.type, c.brand, c.model, c.price, c.stock, c.status, c.imageUrl ?? ""]
      .map((x) => `"${String(x).replaceAll('"', '""')}"`)
      .join(",")
  );

  const csv = [header, ...rows].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="diamond-grid-components.csv"`);
  res.send(csv);
});

// ✅ Reset components (solo admin)
app.delete("/api/admin/components/reset", requireAuth, requireRole(["admin"]), async (_req, res) => {
  await prisma.component.deleteMany();
  res.json({ ok: true });
});

// -----------------------------
// ✅ CHECKOUT REAL (Orders/Payment)
// -----------------------------
const CreateOrderSchema = z.object({
  items: z.array(
    z.object({
      componentId: z.string().min(1),
      qty: z.number().int().min(1),
    })
  ).min(1),
  notes: z.string().max(500).optional(),
});

app.post("/api/orders", requireAuth, async (req, res) => {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, errors: parsed.error.flatten() });

  const userId = (req as any).user?.id as string;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const ids = parsed.data.items.map((i) => i.componentId);
      const comps = await tx.component.findMany({ where: { id: { in: ids } } });

      for (const it of parsed.data.items) {
        const c = comps.find((x) => x.id === it.componentId);
        if (!c) throw new Error("Componente no existe");
        if (c.status !== "active") throw new Error(`Componente inactivo: ${c.brand} ${c.model}`);
        if (c.stock < it.qty) throw new Error(`Sin stock: ${c.brand} ${c.model}`);
      }

      let subtotal = 0;
      for (const it of parsed.data.items) {
        const c = comps.find((x) => x.id === it.componentId)!;
        subtotal += c.price * it.qty;
      }
      const shipping = 0;
      const total = subtotal + shipping;

      const created = await tx.order.create({
        data: {
          userId,
          subtotal,
          shipping,
          total,
          notes: parsed.data.notes,
          items: {
            create: parsed.data.items.map((it) => {
              const c = comps.find((x) => x.id === it.componentId)!;
              return {
                componentId: c.id,
                type: c.type,
                brand: c.brand,
                model: c.model,
                price: c.price,
                qty: it.qty,
                imageUrl: c.imageUrl ?? null,
              };
            }),
          },
        },
        include: { items: true, payment: true },
      });

      for (const it of parsed.data.items) {
        await tx.component.update({
          where: { id: it.componentId },
          data: { stock: { decrement: it.qty } },
        });
      }

      return created;
    });

    res.json({ ok: true, order });
  } catch (e: any) {
    res.status(400).json({ ok: false, message: e?.message || "No se pudo crear la orden" });
  }
});

// Mis órdenes
app.get("/api/me/orders", requireAuth, async (req, res) => {
  const userId = (req as any).user?.id as string;
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

app.get("/api/me/orders/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user?.id as string;
  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: { items: true, payment: true },
  });

  if (!order) return res.status(404).json({ ok: false, message: "Orden no encontrada" });
  res.json(order);
});

// Subir pago (comprobante) - usuario
const PaymentSchema = z.object({
  method: z.enum(["BANK_TRANSFER", "DEPOSIT"]).default("BANK_TRANSFER"),
  bank: z.string().min(2).max(40),
  reference: z.string().max(60).optional(),
  holderName: z.string().max(80).optional(),
});

app.post(
  "/api/orders/:id/payment",
  requireAuth,
  upload.single("receipt"),
  async (req, res) => {
    const userId = (req as any).user?.id as string;
    const { id } = req.params;

    const order = await prisma.order.findFirst({ where: { id, userId } });
    if (!order) return res.status(404).json({ ok: false, message: "Orden no encontrada" });

    const parsed = PaymentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, errors: parsed.error.flatten() });

    const receiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const payment = await prisma.payment.upsert({
      where: { orderId: id },
      update: {
        method: parsed.data.method,
        bank: parsed.data.bank,
        reference: parsed.data.reference,
        holderName: parsed.data.holderName,
        receiptUrl: receiptUrl ?? undefined,
      },
      create: {
        orderId: id,
        method: parsed.data.method,
        bank: parsed.data.bank,
        reference: parsed.data.reference,
        holderName: parsed.data.holderName,
        receiptUrl,
      },
    });

    await prisma.order.update({
      where: { id },
      data: { status: "PENDING_PAYMENT" },
    });

    res.json({ ok: true, payment });
  }
);

// Admin/Worker: ver órdenes
app.get("/api/admin/orders", requireAuth, requireRole(["admin","worker"]), async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: true, payment: true, user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

app.listen(4000, () => {
  console.log("API running on http://localhost:4000");
});