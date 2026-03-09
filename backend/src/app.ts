import express from "express";
import { compatibilityRouter } from "./api/compatibilityRoutes.js";
import { userRouter } from "./api/userRoutes.js";
import { jobFiltersRouter } from "./api/jobFiltersRoutes.js";
import { applicationsRouter } from "./api/applicationsRoutes.js";
import { missingFieldsRouter } from "./api/missingFieldsRoutes.js";
import { applyRouter } from "./api/applyRoutes.js";

export function createApp(): express.Express {
	const app = express();
	app.use(express.json());
	app.use("/compatibility", compatibilityRouter);
	app.use("/users", userRouter);
	app.use("/users/:id/job-filters", jobFiltersRouter);
	app.use("/users/:id/applications", applicationsRouter);
	app.use("/applications", missingFieldsRouter);
	app.use("/apply", applyRouter);
	return app;
}
