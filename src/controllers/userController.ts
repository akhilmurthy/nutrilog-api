import { Request, RequestHandler } from "express";
import * as userService from "../services/userService";
import { AuthenticatedRequest } from "../middleware/auth";

const getUserId = (req: Request) => (req as AuthenticatedRequest).userId;

export const createUser: RequestHandler = async (req, res, next) => {
  try {
    const doc = await userService.createUser(getUserId(req), req.body || {});
    res.status(201).json(doc);
  } catch (err: any) {
    if (err?.code === "USER_EXISTS") {
      res.status(409).json({ error: "User already exists" });
      return;
    }
    next(err);
  }
};

export const getMyUser: RequestHandler = async (req, res, next) => {
  try {
    const doc = await userService.getUserById(getUserId(req));
    if (!doc) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

export const updateMyUser: RequestHandler = async (req, res, next) => {
  try {
    const updated = await userService.updateUser(
      getUserId(req),
      req.body || {}
    );
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteMyUser: RequestHandler = async (req, res, next) => {
  try {
    const ok = await userService.deleteUser(getUserId(req));
    if (!ok) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
