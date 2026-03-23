import { Router } from "express";
import { createEvent, getEventDetail, joinEvent, listEvents } from "../controllers/eventController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, listEvents);
router.post("/", requireAuth, createEvent);
router.post("/join", requireAuth, joinEvent);
router.get("/:eventId", requireAuth, getEventDetail);

export default router;
