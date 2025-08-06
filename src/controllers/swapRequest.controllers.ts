import { Request, Response } from "express";

export const create = (req: Request, res: Response) => {
  res.send("create swap request");
};
export const list = (req: Request, res: Response) => {
  res.send("list swap requests");
};
export const accept = (req: Request, res: Response) => {
  res.send("accept swap request");
};
