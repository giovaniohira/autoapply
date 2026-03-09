import express from "express";
import { compatibilityRouter } from "./api/compatibilityRoutes";

export function createApp(): express.Express {
	const app = express();
	app.use(express.json());
	app.use("/compatibility", compatibilityRouter);
	return app;
}
