import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middleware/error.js";
import { generalLimiter, authLimiter } from "./middleware/rateLimiter.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { responseSerializer } from "./middleware/serialize.js";
import { env } from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import gamesRoutes from "./modules/games/games.routes.js";
import developersRoutes from "./modules/developers/developers.routes.js";
import publishersRoutes from "./modules/publishers/publishers.routes.js";
import genresRoutes from "./modules/genres/genres.routes.js";
import platformsRoutes from "./modules/platforms/platforms.routes.js";
import mediaRoutes from "./modules/media/media.routes.js";
import favoritesRoutes from "./modules/favorites/favorites.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import purchasesRoutes from "./modules/purchases/purchases.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(requestLogger);
app.use(responseSerializer);

if (env.NODE_ENV === "production") {
  app.use(generalLimiter);
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", (req, res, next) => {
  const host = req.get("host") || "";
  const protocol =
    req.headers["x-forwarded-proto"] || (req.secure ? "https" : "http");

  const dynamicSpec = JSON.parse(JSON.stringify(swaggerSpec));

  if (dynamicSpec.servers) {
    if (env.NODE_ENV === "production") {
      dynamicSpec.servers = [
        {
          url: `${protocol}://${host}`,
          description: "Servidor de producción (Vercel)",
        },
      ];
    } else {
      dynamicSpec.servers = [
        {
          url: `http://localhost:${env.PORT}`,
          description: "Servidor de desarrollo",
        },
      ];
    }
  }

  return swaggerUi.setup(dynamicSpec, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })(req, res, next);
});

if (env.NODE_ENV !== "test") {
  app.use("/api/auth", authLimiter, authRoutes);
} else {
  app.use("/api/auth", authRoutes);
}

app.use("/api/users", usersRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/developers", developersRoutes);
app.use("/api/publishers", publishersRoutes);
app.use("/api/genres", genresRoutes);
app.use("/api/platforms", platformsRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/purchases", purchasesRoutes);

app.use(errorHandler);

export default app;
