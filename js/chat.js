// 채팅 메시지를 추가하는 함수
function appendMessage(message, sender) {
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// 사용자 메시지 전송 함수
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message === '') return;
    
    // 사용자 메시지 표시
    appendMessage(message, 'user');
    messageInput.value = '';
    
    // 키워드에 따른 봇 응답
    setTimeout(() => {
        let response;
        
        if (message.includes('안녕') || message.includes('hi') || message.includes('hello')) {
            response = '안녕하세요! 어떤 도움이 필요하신가요?';
        } else if (message.includes('로그인')) {
            response = '로그인 화면으로 이동하겠습니다.';
            setTimeout(() => {
                document.getElementById('signin').classList.add('active');
                document.getElementById('home').classList.remove('active');
            }, 1000);
        } else if (message.includes('회원가입')) {
            response = '회원가입 화면으로 이동하겠습니다.';
            setTimeout(() => {
                document.getElementById('register').classList.add('active');
                document.getElementById('home').classList.remove('active');
            }, 1000);
        } else if (message.includes('근무') || message.includes('일정')) {
            response = '근무 일정과 관련하여 도움이 필요하시군요. 어떤 것을 도와드릴까요?';
        } else {
            response = '근무 일정 관리나 로그인/회원가입을 도와드릴 수 있습니다. 무엇을 도와드릴까요?';
        }
        
        appendMessage(response, 'bot');
    }, 1000);
}

// Enter 키 이벤트 처리
document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // 전송 버튼 이벤트 처리
    const sendIcon = document.querySelector('.send-icon');
    if (sendIcon) {
        sendIcon.addEventListener('click', sendMessage);
    }
});
