import type { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as controller from "./purchases.controller.js";

export function purchasesRoutes(router: Router) {
  router.post("/purchases/checkout", auth, controller.checkoutCtrl);
  router.get("/purchases", auth, controller.getUserPurchasesCtrl);
  router.get("/purchases/:id", auth, controller.getPurchaseCtrl);
  router.post("/purchases/:id/refund", auth, controller.refundPurchaseCtrl);
}
