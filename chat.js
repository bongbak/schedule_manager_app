// API 서버와 통신하는 챗봇 응답 함수
async function getChatbotResponse(text) {
    try {
        console.log('챗봇 요청:', text);
        
        // API 서버에 채팅 요청
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({ message: text })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('챗봇 응답:', data);

        if (data.success) {
            // TimeSwap 자동 생성 처리
            if (data.timeswapCreated) {
                appendMessage(`✅ TimeSwap 게시글이 자동으로 생성되었습니다!`, 'system');
                // TimeSwap 데이터 새로고침
                if (typeof loadTimeSwapPosts === 'function') {
                    loadTimeSwapPosts();
                }
            }

            // Schedule 자동 생성 처리
            if (data.scheduleCreated) {
                appendMessage(`✅ 스케줄이 자동으로 생성되었습니다!`, 'system');
                // Schedule 데이터 새로고침
                if (typeof loadSchedules === 'function') {
                    loadSchedules();
                }
            }

            return data.response;
        } else {
            throw new Error(data.error || '서버 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('챗봇 API 오류:', error);
        
        // 서버 연결 실패 시 로컬 응답 사용
        return getLocalChatbotResponse(text);
    }
}

// 로컬 챗봇 응답 함수 (API 서버 연결 실패 시 백업)
function getLocalChatbotResponse(text) {
    const keywords = {
        근무교대: ['근무', '교대', '교환', '스케줄', '시간', 'timeswap'],
        급여: ['급여', '월급', '임금', '페이', '돈', 'payroll'],
        일정: ['일정', '스케줄', '달력', '시간표', 'schedule'],
        로그인: ['로그인', '가입', '인증', '계정', 'login']
    };

    // 키워드 매칭
    for (const [category, words] of Object.entries(keywords)) {
        if (words.some(word => text.toLowerCase().includes(word))) {
            switch(category) {
                case '근무교대':
                    return '근무 교대를 원하시나요? TimeSwap 메뉴에서 근무 시간 교환을 신청할 수 있습니다.';
                case '급여':
                    return '급여 관련 정보는 Payroll 메뉴에서 확인하실 수 있습니다. 월별 급여 조회와 계산이 가능합니다.';
                case '일정':
                    return 'Schedule 메뉴에서 근무 일정을 확인하고 관리하실 수 있습니다.';
                case '로그인':
                    return '로그인이나 회원가입은 메뉴의 Sign in 버튼을 통해 진행할 수 있습니다.';
            }
        }
    }

    return '죄송합니다. 서버에 연결할 수 없습니다. 근무 교대, 급여 확인, 일정 관리 등에 대해 물어보실 수 있습니다.';
}

// 채팅 메시지 추가 함수
function appendMessage(message, type) {
    const messageArea = document.querySelector('.message-area');
    if (!messageArea) return;

    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;
    
    // 메시지 타입에 따른 스타일링
    if (type === 'system') {
        messageElement.style.backgroundColor = '#e8f5e8';
        messageElement.style.color = '#2d6a2d';
        messageElement.style.fontWeight = 'bold';
        messageElement.style.border = '1px solid #4caf50';
    }
    
    messageElement.textContent = message;
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

// 로그인 상태 관리
function checkLoginState() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    const menuPreLogin = document.getElementById('menuPreLogin');
    const menuPostLogin = document.getElementById('menuPostLogin');
    const userIdDisplay = document.getElementById('userIdDisplay');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (token && userId) {
        if (menuPreLogin) menuPreLogin.style.display = 'none';
        if (menuPostLogin) menuPostLogin.style.display = 'block';
        if (userIdDisplay) userIdDisplay.textContent = userId;
        if (userNameDisplay) userNameDisplay.textContent = localStorage.getItem('userName') || userId;
        return true;
    } else {
        if (menuPreLogin) menuPreLogin.style.display = 'block';
        if (menuPostLogin) menuPostLogin.style.display = 'none';
        return false;
    }
}

// DOM 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    // 초기 로그인 상태 확인 및 업데이트
    checkLoginState();

    // 채팅 기능 초기화
    const messageInput = document.getElementById('messageInput');
    const keyboardInput = document.getElementById('keyboardInput');
    const sendButton = document.querySelector('.send-icon');

    // 채팅 입력 처리
    async function handleChatInput(inputElement) {
        const text = inputElement.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        inputElement.value = '';

        // 로딩 메시지 표시
        const loadingMessage = appendMessage('응답 중...', 'bot');
        
        try {
            // 챗봇 응답 (비동기)
            const response = await getChatbotResponse(text);
            
            // 로딩 메시지 제거
            const messageArea = document.querySelector('.message-area');
            if (messageArea && loadingMessage) {
                messageArea.removeChild(loadingMessage);
            }
            
            appendMessage(response, 'bot');
        } catch (error) {
            console.error('채팅 처리 오류:', error);
            
            // 로딩 메시지 제거
            const messageArea = document.querySelector('.message-area');
            if (messageArea && loadingMessage) {
                messageArea.removeChild(loadingMessage);
            }
            
            appendMessage('죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.', 'bot');
        }
    }

    // 채팅 이벤트 리스너 설정
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChatInput(messageInput);
        });
    }

    if (keyboardInput) {
        keyboardInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChatInput(keyboardInput);
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', () => {
            const input = document.getElementById('keyboardInput') || document.getElementById('messageInput');
            if (input) handleChatInput(input);
        });
    }

    // 웰컴 메시지
    setTimeout(() => {
        const isLoggedIn = localStorage.getItem('token');
        const userName = localStorage.getItem('userName');
        
        if (isLoggedIn && userName) {
            appendMessage(`안녕하세요 ${userName}님! 근무 관리 도우미입니다. 무엇을 도와드릴까요?`, 'bot');
            appendMessage('💡 예시: "내일 오후 근무 바꿔줘", "이번 주 급여 알려줘", "스케줄 확인해줘"', 'system');
        } else {
            appendMessage('안녕하세요! 근무 관리 도우미입니다. 로그인 후 더 많은 기능을 이용할 수 있습니다.', 'bot');
        }
    }, 1000);
    
    // 기존 기능들...
    const screens = document.querySelectorAll('.screen');
    // ... (나머지 코드는 그대로 유지)
});
