import { Router } from "express";
import { getJobFilters, postJobFilters } from "./jobFiltersHandler.js";

export const jobFiltersRouter = Router({ mergeParams: true });

jobFiltersRouter.get("/", (req, res, next) => {
	getJobFilters(req, res).catch(next);
});
jobFiltersRouter.post("/", (req, res, next) => {
	postJobFilters(req, res).catch(next);
});
