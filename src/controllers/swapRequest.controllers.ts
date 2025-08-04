import express from "express";
import * as controller from "../controllers/swapRequest.controller";

const router = express.Router();

router.post("/", controller.create); // 교대 요청 등록
router.get("/", controller.list);    // 교대 요청 목록 조회
router.post("/:id/accept", controller.accept); // 특정 교대 요청 수락

export default router;

