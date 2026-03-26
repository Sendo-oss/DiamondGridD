import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";
import crypto from "crypto";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const MAIL_USER = process.env.MAIL_USER || "";
const MAIL_APP_PASSWORD = process.env.MAIL_APP_PASSWORD || "";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

function signToken(payload: { id: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

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

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const transporter =
  MAIL_USER && MAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: MAIL_USER,
          pass: MAIL_APP_PASSWORD,
        },
      })
    : null;

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const PasswordSchema = z
  .string()
  .min(8, "La contrasena debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "La contrasena debe incluir una letra mayuscula")
  .regex(/[0-9]/, "La contrasena debe incluir un numero")
  .regex(/[^A-Za-z0-9]/, "La contrasena debe incluir un simbolo especial");

const RegisterSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(30).optional(),
  email: z.string().email("Correo invalido"),
  phone: z.string().min(7, "El telefono debe tener al menos 7 caracteres").max(20).optional(),
  password: PasswordSchema,
  receiveNews: z.boolean().optional(),
});

export async function register(req: Request, res: Response) {
  try {
    const parsed = RegisterSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        errors: parsed.error.flatten(),
      });
    }

    const { name, username, email, phone, password, receiveNews } = parsed.data;

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return res.status(400).json({
        ok: false,
        message: "El email ya existe",
      });
    }

    if (username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username },
      });

      if (usernameExists) {
        return res.status(400).json({
          ok: false,
          message: "El nombre de usuario ya existe",
        });
      }
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username: username || null,
        email,
        phone: phone || null,
        password: hash,
        role: "user",
        provider: "local",
        receiveNews: Boolean(receiveNews),
      },
      select: USER_SELECT,
    });

    const token = signToken({
      id: user.id,
      role: user.role,
    });

    return res.json({
      ok: true,
      user,
      token,
    });
  } catch (error) {
    console.error("Error en register:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
}

const LoginSchema = z.object({
  email: z.string().email("Correo invalido"),
  password: z.string().min(1, "La contrasena es obligatoria"),
});

export async function login(req: Request, res: Response) {
  try {
    const parsed = LoginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        errors: parsed.error.flatten(),
      });
    }

    const { email, password } = parsed.data;

    const userDb = await prisma.user.findUnique({
      where: { email },
      select: {
        ...USER_SELECT,
        password: true,
      },
    });

    if (!userDb) {
      return res.status(400).json({
        ok: false,
        message: "Credenciales invalidas",
      });
    }

    const okPassword = await bcrypt.compare(password, userDb.password);

    if (!okPassword) {
      return res.status(400).json({
        ok: false,
        message: "Credenciales invalidas",
      });
    }

    const { password: _pw, ...user } = userDb;

    const token = signToken({
      id: user.id,
      role: user.role,
    });

    return res.json({
      ok: true,
      user,
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
}

const ForgotPasswordSchema = z.object({
  email: z.string().email("Correo invalido"),
});

export async function forgotPassword(req: Request, res: Response) {
  try {
    const parsed = ForgotPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        errors: parsed.error.flatten(),
      });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({
        ok: true,
        message: "Si el correo existe, se enviaron instrucciones para recuperar la contrasena",
      });
    }

    if (!transporter) {
      return res.status(500).json({
        ok: false,
        message: "Falta configurar MAIL_USER o MAIL_APP_PASSWORD en el .env",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashResetToken(rawToken);
    const expiry = new Date(Date.now() + 1000 * 60 * 30);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiry,
      },
    });

    const resetUrl = `${CLIENT_URL}/reset-password?token=${rawToken}`;

    await transporter.sendMail({
      from: `"Diamond Grid" <${MAIL_USER}>`,
      to: email,
      subject: "Recuperacion de contrasena - Diamond Grid",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          <h2>Recuperacion de contrasena</h2>
          <p>Hola ${user.name},</p>
          <p>Recibimos una solicitud para restablecer tu contrasena en <b>Diamond Grid</b>.</p>
          <p>Haz clic en el siguiente boton para crear una nueva contrasena:</p>
          <p style="margin: 24px 0;">
            <a
              href="${resetUrl}"
              style="background:#111827;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px;display:inline-block;"
            >
              Restablecer contrasena
            </a>
          </p>
          <p>Tambien puedes copiar y pegar este enlace en tu navegador:</p>
          <p>${resetUrl}</p>
          <p>Este enlace vencera en 30 minutos.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `,
    });

    return res.json({
      ok: true,
      message: "Si el correo existe, se enviaron instrucciones para recuperar la contrasena",
    });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
}

const ResetPasswordSchema = z.object({
  token: z.string().min(10, "Token invalido"),
  newPassword: PasswordSchema,
});

export async function resetPassword(req: Request, res: Response) {
  try {
    const parsed = ResetPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        errors: parsed.error.flatten(),
      });
    }

    const { token, newPassword } = parsed.data;
    const hashedToken = hashResetToken(token);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        ok: false,
        message: "El enlace de recuperacion es invalido o ya expiro",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.json({
      ok: true,
      message: "Contrasena restablecida correctamente",
    });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;

  if (!h?.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      message: "No autorizado",
    });
  }

  const token = h.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };

    (req as any).user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({
      ok: false,
      message: "Token invalido",
    });
  }
}

export function requireRole(roles: Array<"admin" | "worker" | "user">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = (req as any).user;

    if (!u?.role) {
      return res.status(401).json({
        ok: false,
        message: "No autorizado",
      });
    }

    if (!roles.includes(u.role)) {
      return res.status(403).json({
        ok: false,
        message: "Sin permiso",
      });
    }

    next();
  };
}

const GoogleSchema = z.object({
  credential: z.string().min(10),
});

export async function googleLogin(req: Request, res: Response) {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        ok: false,
        message: "Falta GOOGLE_CLIENT_ID en .env del server",
      });
    }

    const parsed = GoogleSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        message: "Falta credential",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({
        ok: false,
        message: "No se pudo leer email de Google",
      });
    }

    const email = payload.email;
    const name = payload.name || email.split("@")[0];
    const googleId = payload.sub;

    const existing = await prisma.user.findUnique({
      where: { email },
      select: USER_SELECT,
    });

    const user =
      existing ??
      (await prisma.user.create({
        data: {
          email,
          name,
          role: "user",
          provider: "google",
          googleId,
          password: await bcrypt.hash(`google_${Date.now()}_${Math.random()}`, 10),
        },
        select: USER_SELECT,
      }));

    const token = signToken({
      id: user.id,
      role: user.role,
    });

    return res.json({
      ok: true,
      user,
      token,
    });
  } catch (error) {
    console.error("Error en googleLogin:", error);
    return res.status(401).json({
      ok: false,
      message: "Google credential invalida",
    });
  }
}
