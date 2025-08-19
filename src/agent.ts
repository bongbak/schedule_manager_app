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

  // 근무 일정 키워드 체크 함수
  const isScheduleRequest = (message: string): boolean => {
    const keywords = ['근무', '스케줄', '일정', '시간'];
    const actionWords = ['등록', '추가', '변경', '수정', '신청'];
    
    return keywords.some(keyword => message.includes(keyword)) &&
           actionWords.some(word => message.includes(word));
  };

  // 메시지 처리 함수
  const handleMessage = async (message: string) => {
    if (isScheduleRequest(message)) {
      // TimeSwap 페이지로 이동하고 메시지 반환
      if (typeof window !== 'undefined') {
        const timeswapScreen = document.getElementById('frame4');
        if (timeswapScreen) {
          document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
          });
          timeswapScreen.classList.add('active');
        }
      }
      return "근무 일정 등록을 위해 TimeSwap 페이지로 이동했습니다. 필요한 정보를 입력해주세요.";
    }

    // 기본 대화 처리
    const res = await agent.conversate(message);
    return res;
  };

  // 이벤트 리스너 등록
  if (typeof window !== 'undefined') {
    window.addEventListener('message', async (event) => {
      if (event.data && event.data.type === 'chat-message') {
        const response = await handleMessage(event.data.message);
        window.postMessage({ type: 'chat-response', message: response }, '*');
      }
    });
  }
}

// Node 18 미만이면 fetch가 없을 수 있음 → 아래 두 줄로 대체
// import fetch from "node-fetch";
// (그리고 위 fetch 호출은 그대로 사용)
