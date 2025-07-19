import { Request, Response, NextFunction } from "express";
import * as diaryService from "../services/diaryService";

const getUserId = (req: Request) => (req as any).user?.id as string | undefined;

export const createDiary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const diary = await diaryService.createDiaryEntry("", req.body);
    res.status(201).json(diary);
  } catch (err) {
    next(err);
  }
};

export const replaceDiary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const diary = await diaryService.replaceDiaryEntry(req.params.id, req.body);
    res.status(200).json(diary);
  } catch (err) {
    next(err);
  }
};

export const getDiary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const diary = await diaryService.getDiaryById(
      req.params.id,
      getUserId(req)
    );
    res.status(200).json(diary);
  } catch (err) {
    next(err);
  }
};

export const deleteDiary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await diaryService.deleteDiaryEntry(req.params.id, getUserId(req));
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
