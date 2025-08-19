// DOM 요소들
const loginForm = {
    id: document.getElementById('loginId'),
    password: document.getElementById('loginPassword'),
    button: document.getElementById('loginBtn')
};

const registerForm = {
    name: document.getElementById('registerName'),
    id: document.getElementById('registerId'),
    password: document.getElementById('registerPassword'),
    email: document.getElementById('registerEmail'),
    button: document.getElementById('registerBtn')
};

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// 로그인 처리
loginForm.button.addEventListener('click', async () => {
    try {
        const response = await api.login(
            loginForm.id.value,
            loginForm.password.value
        );
        
        // 토큰 저장
        auth.setToken(response.token);
        
        // 사용자 정보 저장
        localStorage.setItem('userid', loginForm.id.value);
        
        // 메인 화면으로 이동
        showScreen('home');
        
    } catch (error) {
        alert(error.message);
    }
});

// 회원가입 처리
registerForm.button.addEventListener('click', async () => {
    try {
        const userData = {
            username: registerForm.name.value,
            userid: registerForm.id.value,
            password: registerForm.password.value,
            email: registerForm.email.value
        };
        
        await api.register(userData);
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        showScreen('signin');
        
    } catch (error) {
        alert(error.message);
    }
});

// 화면 전환 이벤트
document.getElementById('switchToRegister').addEventListener('click', (e) => {
    e.preventDefault();
    showScreen('register');
});

document.getElementById('signinBackBtn').addEventListener('click', () => {
    showScreen('home');
});

document.getElementById('registerBackBtn').addEventListener('click', () => {
    showScreen('signin');
});
