// 챗봇 응답 함수
function getChatbotResponse(text) {
    const keywords = {
        근무교대: ['근무', '교대', '교환', '스케줄', '시간'],
        급여: ['급여', '월급', '임금', '페이', '돈'],
        일정: ['일정', '스케줄', '달력', '시간표'],
        로그인: ['로그인', '가입', '인증', '계정']
    };

    // 키워드 매칭
    for (const [category, words] of Object.entries(keywords)) {
        if (words.some(word => text.includes(word))) {
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

    return '죄송합니다. 질문을 이해하지 못했습니다. 근무 교대, 급여 확인, 일정 관리 등에 대해 물어보실 수 있습니다.';
}

// 채팅 메시지 추가 함수
function appendMessage(message, type) {
    const messageArea = document.querySelector('.message-area');
    if (!messageArea) return;

    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;
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
    function handleChatInput(inputElement) {
        const text = inputElement.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        inputElement.value = '';

        // 챗봇 응답
        setTimeout(() => {
            const response = getChatbotResponse(text);
            appendMessage(response, 'bot');
        }, 500);
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
        appendMessage('안녕하세요! 근무 관리 도우미입니다. 무엇을 도와드릴까요?', 'bot');
    }, 1000);
    
    // 기존 기능들...
    const screens = document.querySelectorAll('.screen');
    // ... (나머지 코드는 그대로 유지)
});
