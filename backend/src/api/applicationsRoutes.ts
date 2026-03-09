import { Router } from "express";
import { getApplications } from "./applicationsHandler.js";

export const applicationsRouter = Router({ mergeParams: true });

applicationsRouter.get("/", (req, res, next) => {
	getApplications(req, res).catch(next);
});
