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
    const updated = await userService.updateUser(getUserId(req), req.body || {});
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

export const getMyDiaryByDate: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { date } = req.params;

    const diary = await userService.getDiaryByDate(userId, date);
    res.status(200).json(diary);
  } catch (err) {
    next(err);
  }
};

// Weight tracking controllers
export const addWeightEntry: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { weight, unit, date } = req.body;

    if (!weight || typeof weight !== 'number') {
      res.status(400).json({ error: "Weight is required and must be a number" });
      return;
    }

    const validUnit = unit === 'lb' ? 'lb' : 'kg';
    const entryDate = date ? new Date(date) : undefined;

    const entry = await userService.addWeightEntry(userId, weight, validUnit, entryDate);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

export const getWeightHistory: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await userService.getWeightHistory(userId, limit, offset);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateWeightEntry: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { entryId } = req.params;
    const { weight, unit } = req.body;

    if (!weight || typeof weight !== 'number') {
      res.status(400).json({ error: "Weight is required and must be a number" });
      return;
    }

    const validUnit = unit === 'lb' ? 'lb' : 'kg';
    const updated = await userService.updateWeightEntry(userId, entryId, weight, validUnit);

    if (!updated) {
      res.status(404).json({ error: "Weight entry not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteWeightEntry: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { entryId } = req.params;

    const deleted = await userService.deleteWeightEntry(userId, entryId);
    if (!deleted) {
      res.status(404).json({ error: "Weight entry not found" });
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
