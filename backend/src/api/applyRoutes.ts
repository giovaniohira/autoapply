import { Router } from "express";
import { postApply } from "./applyHandler.js";

export const applyRouter = Router();

applyRouter.post("/", (req, res, next) => {
	postApply(req, res).catch(next);
});
