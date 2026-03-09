import { Router } from "express";
import { postScore } from "./compatibilityHandler.js";

export const compatibilityRouter = Router();

compatibilityRouter.post("/score", (req, res, next) => {
	postScore(req, res).catch(next);
});
