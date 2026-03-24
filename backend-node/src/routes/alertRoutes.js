import { Router } from "express";
import { sendCoinAlertEmail } from "../controllers/alertController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/email", requireAuth, sendCoinAlertEmail);

export default router;
