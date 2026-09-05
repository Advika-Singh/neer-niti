import { Router } from "express";
import { STATIC_NEWS } from "../lib/newsData.js";

export const newsRouter = Router();

newsRouter.get("/", (_req, res) => {
  res.json(STATIC_NEWS);
});
