import { Router } from "express";
import { postMissingFields } from "./missingFieldsHandler.js";

export const missingFieldsRouter = Router();

missingFieldsRouter.post("/:id/missing-fields", postMissingFields);
