// src/routes/shift.ts
import express, { Request, Response } from "express";
import pool from "../db";

const router = express.Router();

// 근무 등록 API
router.post("/", async (req: Request, res: Response) => {
  const { staff_id, date, start_time, end_time } = req.body;

  // 유효성 검사
  if (!staff_id || !date || !start_time || !end_time) {
    return res.status(400).json({ message: "필수 값 누락" });
  }

  try {
    const sql = `
      INSERT INTO Shift (staff_id, date, start_time, end_time)
      VALUES (?, ?, ?, ?,false)
    `;
    const [result] = await pool.query(sql, [staff_id, date, start_time, end_time]);
    const insertResult = result as { insertId: number };

    res.status(201).json({
      message: "근무 일정 등록 완료",
      shift_id: insertResult.insertId,
    });
  } catch (error) {
    console.error("DB 오류:", error);
    res.status(500).json({ message: "서버 내부 오류 발생" });
  }
});

export default router;
