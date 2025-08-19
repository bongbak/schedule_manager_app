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

  // 근무 일정 등록 처리기 구현
  const handleScheduleRegistration = async (message: string) => {
    try {
      // POST 요청으로 근무 일정 등록
      const response = await fetch(`${NGROK_URL}/api/shifts/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const result = await response.json();
      
      if (response.ok) {
        return `근무 일정이 성공적으로 등록되었습니다.
        - 직원 ID: ${result.schedule.staff_id}
        - 날짜: ${result.schedule.date}
        - 시작 시간: ${result.schedule.start_time}
        - 종료 시간: ${result.schedule.end_time}`;
      } else {
        return result.message + (result.example ? `\n${result.example}` : '');
      }
    } catch (error) {
      console.error('Schedule registration error:', error);
      return '근무 일정 등록 중 오류가 발생했습니다. 다시 시도해 주세요.';
    }
  };

  const res = await agent.conversate("직원 1번 2025-08 급여 보여줘");
  console.log(res);
}

main().catch(console.error);

main().catch(console.error);

// Node 18 미만이면 fetch가 없을 수 있음 → 아래 두 줄로 대체
// import fetch from "node-fetch";
// (그리고 위 fetch 호출은 그대로 사용)
