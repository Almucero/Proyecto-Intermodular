import "dotenv/config";

const required = (v: string | undefined, k: string) => {
  if (!v) throw new Error(`Falta variable de entorno: ${k}`);
  return v;
};

export const env = {
  PORT: Number(required(process.env.PORT, "PORT")),
  NODE_ENV: required(process.env.NODE_ENV, "NODE_ENV"),
  JWT_SECRET: required(process.env.JWT_SECRET, "JWT_SECRET"),
  POSTGRES_PRISMA_URL: required(
    process.env.POSTGRES_PRISMA_URL,
    "POSTGRES_PRISMA_URL"
  ),
  BCRYPT_SALT_ROUNDS: Number(
    required(process.env.BCRYPT_SALT_ROUNDS, "BCRYPT_SALT_ROUNDS")
  ),
  CLOUDINARY_CLOUD_NAME: required(
    process.env.CLOUDINARY_CLOUD_NAME,
    "CLOUDINARY_CLOUD_NAME"
  ),
  CLOUDINARY_API_KEY: required(
    process.env.CLOUDINARY_API_KEY,
    "CLOUDINARY_API_KEY"
  ),
  CLOUDINARY_API_SECRET: required(
    process.env.CLOUDINARY_API_SECRET,
    "CLOUDINARY_API_SECRET"
  ),
  GOOGLE_GENERATIVE_AI_API_KEY: required(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    "GOOGLE_GENERATIVE_AI_API_KEY"
  ),
  ADMIN_EMAILS: required(process.env.ADMIN_EMAILS, "ADMIN_EMAILS"),
};
