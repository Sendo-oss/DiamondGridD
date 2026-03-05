import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

function signToken(payload: { id: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// ✅ Select único para devolver siempre el mismo shape de user
const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  nickname: true,
  phone: true,
  bio: true,
  avatarUrl: true,
} as const;

// -------------------
// REGISTER / LOGIN
// -------------------
const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(req: Request, res: Response) {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, errors: parsed.error.flatten() });

  const { name, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ ok: false, message: "El email ya existe" });

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hash, role: "user" },
    select: USER_SELECT,
  });

  const token = signToken({ id: user.id, role: user.role });
  return res.json({ ok: true, user, token });
}

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(req: Request, res: Response) {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, errors: parsed.error.flatten() });

  const { email, password } = parsed.data;

  // ✅ Traemos el usuario con password para validar, pero devolvemos el SELECT pro
  const userDb = await prisma.user.findUnique({
    where: { email },
    select: { ...USER_SELECT, password: true },
  });

  if (!userDb) return res.status(400).json({ ok: false, message: "Credenciales inválidas" });

  const ok = await bcrypt.compare(password, userDb.password);
  if (!ok) return res.status(400).json({ ok: false, message: "Credenciales inválidas" });

  // ✅ Quitamos password del response
  const { password: _pw, ...user } = userDb;

  const token = signToken({ id: user.id, role: user.role });
  return res.json({ ok: true, user, token });
}

// -------------------
// AUTH MIDDLEWARE
// -------------------
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ ok: false, message: "No autorizado" });

  const token = h.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ ok: false, message: "Token inválido" });
  }
}

export function requireRole(roles: Array<"admin" | "worker" | "user">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = (req as any).user;
    if (!u?.role) return res.status(401).json({ ok: false, message: "No autorizado" });
    if (!roles.includes(u.role)) return res.status(403).json({ ok: false, message: "Sin permiso" });
    next();
  };
}

// -------------------
// GOOGLE LOGIN
// -------------------
const GoogleSchema = z.object({
  credential: z.string().min(10),
});

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function googleLogin(req: Request, res: Response) {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ ok: false, message: "Falta GOOGLE_CLIENT_ID en .env del server" });
  }

  const parsed = GoogleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: "Falta credential" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(400).json({ ok: false, message: "No se pudo leer email de Google" });

    const email = payload.email;
    const name = payload.name || email.split("@")[0];

    // Si no existe, lo creamos. Como tu schema exige password, guardamos uno random hasheado.
    const existing = await prisma.user.findUnique({ where: { email }, select: USER_SELECT });

    const user =
      existing ??
      (await prisma.user.create({
        data: {
          email,
          name,
          role: "user",
          password: await bcrypt.hash(`google_${Date.now()}_${Math.random()}`, 10),
        },
        select: USER_SELECT,
      }));

    const token = signToken({ id: user.id, role: user.role });
    return res.json({ ok: true, user, token });
  } catch {
    return res.status(401).json({ ok: false, message: "Google credential inválida" });
  }
}