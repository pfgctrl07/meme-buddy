import { Router } from "express";
import { getDiscover } from "../controllers/discoverController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getDiscover);

export default router;
