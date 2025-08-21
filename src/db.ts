// src/db.ts
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs"; // (SSL 쓸 때만 필요)
dotenv.config();

console.log(
  `[db] host=${process.env.DB_HOST}:${process.env.DB_PORT} user=${process.env.DB_USER} db=${process.env.DB_NAME}`
);

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "dmsco0923*",
  database: process.env.DB_NAME || "userdb",
  port: Number(process.env.DB_PORT || 3306),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 10_000,     // 10초 안에 못 붙으면 바로 에러
  enableKeepAlive: true,       // 장시간 연결 안정화
});
export default pool;

// 옵션) RDS 같은 데 SSL 요구하면 .env에 DB_SSL_CA 경로 넣고 아래처럼:
// ssl: process.env.DB_SSL_CA ? { ca: fs.readFileSync(process.env.DB_SSL_CA, "utf8") } : undefined,
