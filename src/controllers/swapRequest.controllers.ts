// src/controllers/swapRequest.controller.ts
import { Request, Response } from "express";

export const create = (req: Request, res: Response) => {
  // 교대 요청 등록 로직
  res.send("create swap request");
};

export const list = (req: Request, res: Response) => {
  // 교대 요청 목록 조회 로직
  res.send("list swap requests");
};

export const accept = (req: Request, res: Response) => {
  // 특정 교대 요청 수락 로직
  res.send("accept swap request");
};
