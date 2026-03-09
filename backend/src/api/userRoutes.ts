import { Router } from "express";
import {
	getUsers,
	getUserById,
	postUser,
	patchUser,
	getUserSkills,
	postUserSkill,
} from "./userHandler.js";

export const userRouter = Router();

userRouter.get("/", (req, res, next) => {
	getUsers(req, res).catch(next);
});
userRouter.get("/:id", (req, res, next) => {
	getUserById(req, res).catch(next);
});
userRouter.post("/", (req, res, next) => {
	postUser(req, res).catch(next);
});
userRouter.patch("/:id", (req, res, next) => {
	patchUser(req, res).catch(next);
});
userRouter.get("/:id/skills", (req, res, next) => {
	getUserSkills(req, res).catch(next);
});
userRouter.post("/:id/skills", (req, res, next) => {
	postUserSkill(req, res).catch(next);
});
