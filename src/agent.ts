// src/routes/agent.ts
import "dotenv/config";
import { Agentica, assertHttpController } from "@agentica/core";
import OpenAI from "openai";

// ngrok 주소를 .env에 NGROK_URL로 넣어 두면 편함
const NGROK_URL = process.env.NGROK_URL ?? "https://<너의-ngrok-도메인>";
const SPEC_URL  = `${NGROK_URL}/api-docs.json`;

async function main() {
  // 스펙 로드
  const spec = await fetch(SPEC_URL).then(r => r.json());

  const agent = new Agentica({
    model: "chatgpt",
    vendor: {
      api: new OpenAI({ apiKey: process.env.OPENAI_API_KEY! }),
      model: "gpt-4o-mini",
    },
    controllers: [
      assertHttpController({
        name: "schedule-manager",
        model: "chatgpt",
        document: spec,
        connection: {
          host: NGROK_URL, // servers가 localhost여도 이게 우선됨
          // headers: { Authorization: "Bearer <토큰>" }, // 필요 시
        },
      }),
    ],
  });

  const res = await agent.conversate("직원 1번 2025-08 급여 보여줘");
  console.log(res);
}

main().catch(console.error);

// Node 18 미만이면 fetch가 없을 수 있음 → 아래 두 줄로 대체
// import fetch from "node-fetch";
// (그리고 위 fetch 호출은 그대로 사용)
