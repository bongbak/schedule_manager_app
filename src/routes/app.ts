// src/routes/app.ts
import express from "express";
import path from "path";
import fs from "fs";
import swaggerUi from "swagger-ui-express";

import pool from "../db";
import authrouter from "./auth";
import shiftRouter from "./shift";
import payrollRouter from "./payroll";
// import swapRouter from "./swap"; // 필요하면 주석 해제

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// Swagger
const specPath = path.resolve(process.cwd(), "openapi_schedule_manager_app.json");
const spec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
app.get("/api-docs.json", (_req, res) => res.json(spec));
app.get("/", (_req, res) => res.send("ok"));

// 라우터
app.use("/auth", authrouter);
app.use("/api/shifts", shiftRouter);
app.use("/payroll", payrollRouter);
// app.use("/api/swaps", swapRouter);

// 헬스체크
app.get("/", async (_req, res) => {
  try {
    const [rows]: any = await pool.query("SELECT NOW() AS now");
    res.send("MySQL OK / NOW: " + rows[0].now);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB 연결 실패");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
