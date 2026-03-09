import express from "express";
import cors from "cors";
import { PrismaClient, OrderStatus, PaymentMethod } from "@prisma/client";
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

// ✅ Multer config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

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

function makeOrderNumber(id: string) {
  const short = id.slice(-6).toUpperCase();
  const year = new Date().getFullYear();
  return `DG-${year}-${short}`;
}

// ✅ Auth
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

app.get("/api/auth/google/client-id", (_req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  res.json({ ok: true, clientId });
});

app.post("/api/auth/google", googleLogin);

app.get("/api/auth/google", (_req, res) => {
  res.status(405).json({ ok: false, message: "Usa POST /api/auth/google con JSON: { credential }" });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// =============================
// PERFIL
// =============================
app.get("/api/me", requireAuth, async (req, res) => {
  const userId = (req as any).user?.id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      nickname: true,
      phone: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
  res.json({ ok: true, user });
});

const UpdateMeSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  nickname: z.string().min(2).max(30).optional(),
  phone: z.string().min(7).max(20).optional(),
  bio: z.string().max(220).optional(),
});

app.put("/api/me", requireAuth, async (req, res) => {
  const userId = (req as any).user?.id as string;

  const parsed = UpdateMeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, errors: parsed.error.flatten() });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.nickname !== undefined ? { nickname: parsed.data.nickname } : {}),
      ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone } : {}),
      ...(parsed.data.bio !== undefined ? { bio: parsed.data.bio } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      nickname: true,
      phone: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  res.json({ ok: true, user: updated });
});

app.post("/api/me/avatar", requireAuth, upload.single("avatar"), async (req, res) => {
  const userId = (req as any).user?.id as string;

  if (!req.file) return res.status(400).json({ ok: false, message: "Falta archivo avatar" });

  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });

  if (current?.avatarUrl) removeUploadByUrl(current.avatarUrl);

  const avatarUrl = `/uploads/${req.file.filename}`;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      nickname: true,
      phone: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  res.json({ ok: true, user: updated });
});

// =============================
// COMPONENTES
// =============================
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

app.get("/api/components/:id", async (req, res) => {
  const { id } = req.params;

  const item = await prisma.component.findUnique({
    where: { id },
    include: {
      images: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!item) return res.status(404).json({ ok: false, message: "No encontrado" });
  res.json(item);
});

app.get("/api/components/:id/images", async (req, res) => {
  const { id } = req.params;
  const images = await prisma.componentImage.findMany({
    where: { componentId: id },
    orderBy: { createdAt: "asc" },
  });
  res.json(images);
});

app.post(
  "/api/components/:id/images",
  requireAuth,
  requireRole(["admin", "worker"]),
  upload.array("images", 8),
  async (req, res) => {
    const { id } = req.params;

    const comp = await prisma.component.findUnique({ where: { id } });
    if (!comp) return res.status(404).json({ ok: false, message: "Componente no encontrado" });

    const files = (req.files as Express.Multer.File[]) ?? [];
    if (!files.length) return res.status(400).json({ ok: false, message: "Faltan archivos (images)" });

    const rows = files.map((f) => ({ componentId: id, url: `/uploads/${f.filename}` }));

    await prisma.componentImage.createMany({ data: rows });

    const images = await prisma.componentImage.findMany({
      where: { componentId: id },
      orderBy: { createdAt: "asc" },
    });

    res.json({ ok: true, images });
  }
);

app.delete(
  "/api/components/:id/images/:imageId",
  requireAuth,
  requireRole(["admin", "worker"]),
  async (req, res) => {
    const { id, imageId } = req.params;

    const img = await prisma.componentImage.findFirst({
      where: { id: imageId, componentId: id },
    });

    if (!img) return res.status(404).json({ ok: false, message: "Imagen no encontrada" });

    removeUploadByUrl(img.url);
    await prisma.componentImage.delete({ where: { id: imageId } });

    const images = await prisma.componentImage.findMany({
      where: { componentId: id },
      orderBy: { createdAt: "asc" },
    });

    res.json({ ok: true, images });
  }
);

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

app.delete(
  "/api/components/:id",
  requireAuth,
  requireRole(["admin", "worker"]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const current = await prisma.component.findUnique({
        where: { id },
        include: { images: true },
      });
      if (!current) return res.status(404).json({ ok: false, message: "Componente no encontrado" });

      removeUploadByUrl(current.imageUrl);
      for (const img of current.images) removeUploadByUrl(img.url);

      await prisma.component.delete({ where: { id } });
      res.json({ ok: true });
    } catch {
      res.status(404).json({ ok: false, message: "Componente no encontrado" });
    }
  }
);

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
        data: { stock: { increment: delta } },
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

app.get("/api/admin/components/export", requireAuth, requireRole(["admin", "worker"]), async (_req, res) => {
  const items = await prisma.component.findMany({ orderBy: { type: "asc" } });

  const header = ["id", "type", "brand", "model", "price", "stock", "status", "imageUrl"].join(",");
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

app.delete("/api/admin/components/reset", requireAuth, requireRole(["admin"]), async (_req, res) => {
  await prisma.component.deleteMany();
  res.json({ ok: true });
});

// =============================
// ÓRDENES / PAGOS
// =============================
const CreateOrderSchema = z.object({
  method: z.enum(["BANK_TRANSFER", "DEPOSIT"]).default("BANK_TRANSFER"),
  bank: z.string().min(2),
  reference: z.string().optional(),
  holderName: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      qty: z.number().int().min(1),
    })
  ).min(1),
});

app.post("/api/orders", requireAuth, async (req, res) => {
  const userId = (req as any).user?.id as string;

  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, errors: parsed.error.flatten() });
  }

  const { method, bank, reference, holderName, notes, items } = parsed.data;

  const ids = items.map((x) => x.id);
  const components = await prisma.component.findMany({
    where: {
      id: { in: ids },
      status: "active",
    },
  });

  if (components.length !== ids.length) {
    return res.status(400).json({ ok: false, message: "Uno o más componentes no están disponibles." });
  }

  const map = new Map(components.map((c) => [c.id, c]));
  for (const row of items) {
    const comp = map.get(row.id);
    if (!comp) continue;
    if (comp.stock < row.qty) {
      return res.status(400).json({
        ok: false,
        message: `Stock insuficiente para ${comp.brand} ${comp.model}. Disponible: ${comp.stock}`,
      });
    }
  }

  const subtotal = items.reduce((acc, row) => {
    const comp = map.get(row.id)!;
    return acc + Number(comp.price) * row.qty;
  }, 0);

  const shipping = 0;
  const total = subtotal + shipping;

  try {
    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          subtotal,
          shipping,
          total,
          notes: notes || null,
          items: {
            create: items.map((row) => {
              const comp = map.get(row.id)!;
              return {
                componentId: comp.id,
                type: comp.type,
                brand: comp.brand,
                model: comp.model,
                price: comp.price,
                qty: row.qty,
                imageUrl: comp.imageUrl ?? null,
              };
            }),
          },
          payment: {
            create: {
              method: method as PaymentMethod,
              bank,
              reference: reference || null,
              holderName: holderName || null,
            },
          },
        },
        include: {
          items: true,
          payment: true,
        },
      });

      await Promise.all(
        items.map((row) =>
          tx.component.update({
            where: { id: row.id },
            data: {
              stock: { decrement: row.qty },
            },
          })
        )
      );

      return order;
    });

    return res.json({
      ok: true,
      order: {
        ...created,
        orderNumber: makeOrderNumber(created.id),
      },
    });
  } catch {
    return res.status(500).json({ ok: false, message: "No se pudo crear la orden." });
  }
});

app.post(
  "/api/orders/:id/receipt",
  requireAuth,
  upload.single("receipt"),
  async (req, res) => {
    const userId = (req as any).user?.id as string;
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ ok: false, message: "Falta el comprobante." });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({ ok: false, message: "Orden no encontrada." });
    }

    const receiptUrl = `/uploads/${req.file.filename}`;

    if (order.payment?.receiptUrl) {
      removeUploadByUrl(order.payment.receiptUrl);
    }

    const payment = await prisma.payment.update({
      where: { orderId: id },
      data: {
        receiptUrl,
      },
    });

    res.json({ ok: true, payment });
  }
);

app.get("/api/orders/me", requireAuth, async (req, res) => {
  const userId = (req as any).user?.id as string;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = orders.map((o) => ({
    ...o,
    orderNumber: makeOrderNumber(o.id),
  }));

  res.json({ ok: true, orders: mapped });
});

app.get("/api/admin/orders", requireAuth, requireRole(["admin", "worker"]), async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      items: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = orders.map((o) => ({
    ...o,
    orderNumber: makeOrderNumber(o.id),
  }));

  res.json({ ok: true, orders: mapped });
});

const UpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

app.patch("/api/admin/orders/:id/status", requireAuth, requireRole(["admin", "worker"]), async (req, res) => {
  const { id } = req.params;
  const parsed = UpdateOrderStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: "Estado inválido." });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
    include: {
      items: true,
      payment: true,
    },
  });

  res.json({
    ok: true,
    order: {
      ...updated,
      orderNumber: makeOrderNumber(updated.id),
    },
  });
});

// =============================
// SEED
// =============================
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

// =============================
// RECOMMEND
// =============================
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

app.listen(4000, () => {
  console.log("API running on http://localhost:4000");
});