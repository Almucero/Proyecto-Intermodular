import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { createUser, findUserByEmail } from "../users/users.service.js";

export async function register(email: string, name: string, password: string) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("Email ya registrado");
  }

  const hash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const user = await createUser(email, name, hash);
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      isAdmin: (user as any).isAdmin ?? false,
    },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return { user, token };
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      isAdmin: (user as any).isAdmin ?? false,
    },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    user: {
      id: user.id,
      accountId: (user as any).accountId,
      accountAt: (user as any).accountAt,
      nickname: (user as any).nickname,
      email: user.email,
      name: user.name,
      surname: (user as any).surname,
      balance: (user as any).balance,
      points: (user as any).points,
      isAdmin: (user as any).isAdmin ?? false,
      addressLine1: (user as any).addressLine1,
      addressLine2: (user as any).addressLine2,
      city: (user as any).city,
      region: (user as any).region,
      postalCode: (user as any).postalCode,
      country: (user as any).country,
    },
    token,
  };
}
