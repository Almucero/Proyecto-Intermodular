import type { Request, Response, NextFunction } from "express";
import { processChatStream } from "./chat.service.js";
import { chatInputSchema } from "./chat.schema.js";

export const chatCtrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const input = chatInputSchema.parse(req.body);
    const result = await processChatStream(input);
    result.pipeTextStreamToResponse(res);
  } catch (error) {
    next(error);
  }
};
