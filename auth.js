// 로그인 상태 관리
let isLoggedIn = false;
let currentUser = null;

// 로그인 함수
async function login(userid, password) {
    try {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userid, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('userid', userid);
            localStorage.setItem('username', data.username);
            isLoggedIn = true;
            currentUser = data;
            return true;
        } else {
            const error = await response.json();
            throw new Error(error.message || '로그인 실패');
        }
    } catch (error) {
        console.error('로그인 에러:', error);
        throw error;
    }
}

// 회원가입 함수
async function register(userData) {
    try {
        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            return await response.json();
        } else {
            const error = await response.json();
            throw new Error(error.message || '회원가입 실패');
        }
    } catch (error) {
        console.error('회원가입 에러:', error);
        throw error;
    }
}

// 로그아웃 함수
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userid');
    localStorage.removeItem('username');
    isLoggedIn = false;
    currentUser = null;
    window.location.href = 'login.html';
}

// 인증 상태 확인
function checkAuth() {
    const token = localStorage.getItem('token');
    const userid = localStorage.getItem('userid');
    if (!token || !userid) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// 현재 로그인한 사용자 정보 가져오기
function getCurrentUser() {
    return {
        userid: localStorage.getItem('userid'),
        username: localStorage.getItem('username')
    };
}
