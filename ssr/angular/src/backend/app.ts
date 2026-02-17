import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middleware/error";
import { generalLimiter, authLimiter } from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/requestLogger";
import { responseSerializer } from "./middleware/serialize";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import gamesRoutes from "./modules/games/games.routes";
import developersRoutes from "./modules/developers/developers.routes";
import publishersRoutes from "./modules/publishers/publishers.routes";
import genresRoutes from "./modules/genres/genres.routes";
import platformsRoutes from "./modules/platforms/platforms.routes";
import mediaRoutes from "./modules/media/media.routes";
import favoritesRoutes from "./modules/favorites/favorites.routes";
import cartRoutes from "./modules/cart/cart.routes";
import purchasesRoutes from "./modules/purchases/purchases.routes";
import chatRoutes from "./modules/chat/chat.routes";

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

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/diagnostic", (_req, res) => res.json({ ok: true, msg: "Backend is alive" }));

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
          url: `${protocol}://${host}/`,
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
    customCssUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.js",
    ],
    customCss:
      ".swagger-ui .topbar { display: none } .swagger-ui .scheme-container .schemes { display: flex; justify-content: space-between !important; }",
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
app.use("/api/chat", chatRoutes);

app.use(errorHandler);

export default app;
