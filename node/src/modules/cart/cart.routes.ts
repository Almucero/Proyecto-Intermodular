import type { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as controller from "./cart.controller.js";

export function cartRoutes(router: Router) {
  router.get("/cart", auth, controller.getUserCartCtrl);
  router.post("/cart/:gameId", auth, controller.addToCartCtrl);
  router.delete("/cart/:gameId", auth, controller.removeFromCartCtrl);
  router.patch("/cart/:gameId", auth, controller.updateCartQuantityCtrl);
  router.delete("/cart", auth, controller.clearCartCtrl);
}
