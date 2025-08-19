const API_BASE_URL = 'http://localhost:3000/api';

// 인증 관련 함수들
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

async function getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/user/info`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        return data.success ? data.user : null;
    } catch (error) {
        console.error('Get user info error:', error);
        return null;
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// 전역 변수들
let currentScreen = 'home';
let screens, menuScreen, menuIcons, closeIcon;

// 화면 전환 함수
function showScreen(id) {
    console.log('화면 전환:', currentScreen, '->', id);
    
    if (screens) {
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
    }
    
    const targetScreen = document.getElementById(id);
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = id;
        console.log('화면 전환 완료:', id);
        
        // 화면별 데이터 로딩
        if (id === 'timeswap') {
            loadTimeSwapPosts();
        } else if (id === 'schedule') {
            loadSchedules();
        }
    } else {
        console.error('화면을 찾을 수 없음:', id);
    }
}

// 메뉴 토글 함수
function toggleMenu() {
    console.log('메뉴 토글 호출됨');
    if (menuScreen) {
        const isActive = menuScreen.classList.contains('active');
        if (isActive) {
            menuScreen.classList.remove('active');
            console.log('메뉴 닫힘');
        } else {
            menuScreen.classList.add('active');
            console.log('메뉴 열림');
            
            // 사용자 정보 업데이트
            const userId = localStorage.getItem('userId');
            const userName = localStorage.getItem('userName');
            
            if (userId && userName) {
                const userIdDisplay = document.getElementById('userIdDisplay');
                const userNameDisplay = document.getElementById('userNameDisplay');
                
                if (userIdDisplay) userIdDisplay.textContent = userId;
                if (userNameDisplay) userNameDisplay.textContent = userName;
                
                // 로그인 상태 메뉴 표시
                const menuPreLogin = document.getElementById('menuPreLogin');
                const menuPostLogin = document.getElementById('menuPostLogin');
                
                if (menuPreLogin) menuPreLogin.style.display = 'none';
                if (menuPostLogin) menuPostLogin.style.display = 'block';
            }
        }
    } else {
        console.error('메뉴 화면을 찾을 수 없음');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로딩 완료 - app.js 초기화 시작');
    
    // DOM 요소들 초기화
    screens = document.querySelectorAll('.screen');
    menuScreen = document.getElementById('menu');
    menuIcons = document.querySelectorAll('.menu-icon');
    closeIcon = document.querySelector('.close-icon');
    
    console.log('찾은 요소들:');
    console.log('- screens:', screens.length);
    console.log('- menuScreen:', !!menuScreen);
    console.log('- menuIcons:', menuIcons.length);
    console.log('- closeIcon:', !!closeIcon);
    
    // 초기 화면 설정
    showScreen('home');
    
    // 메뉴 아이콘 클릭 이벤트 (모든 메뉴 아이콘에 적용)
    menuIcons.forEach((icon, index) => {
        console.log(`메뉴 아이콘 ${index} 이벤트 등록`);
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`메뉴 아이콘 ${index} 클릭됨!`);
            toggleMenu();
        });
    });
    
    // 메뉴 닫기 버튼
    if (closeIcon) {
        closeIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('메뉴 닫기 버튼 클릭됨');
            if (menuScreen) {
                menuScreen.classList.remove('active');
            }
        });
        console.log('메뉴 닫기 이벤트 등록됨');
    }
    
    // 메뉴 항목 클릭 이벤트
    const menuItems = document.querySelectorAll('.menu-item');
    console.log('메뉴 항목 개수:', menuItems.length);
    
    menuItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const href = item.getAttribute('href');
            if (href) {
                const targetId = href.substring(1); // # 제거
                console.log(`메뉴 항목 ${index} 클릭: ${targetId}`);
                
                if (targetId === 'logout') {
                    logout();
                    return;
                }
                
                showScreen(targetId);
                
                // 메뉴 닫기
                if (menuScreen) {
                    menuScreen.classList.remove('active');
                }
            }
        });
    });
    
    // 메뉴 배경 클릭 시 닫기
    if (menuScreen) {
        menuScreen.addEventListener('click', (e) => {
            if (e.target === menuScreen) {
                menuScreen.classList.remove('active');
            }
        });
    }
    
    console.log('모든 메뉴 이벤트 등록 완료');
    
    // 기타 이벤트들 등록
    setupOtherEvents();
});

function setupOtherEvents() {
    // TimeSwap 관련 이벤트
    const timeswapAddBtn = document.querySelector('.add-icon');
    const postList = document.getElementById('postList');
    const acceptBtn = document.querySelector('.accept-btn');
    
    if (timeswapAddBtn) {
        timeswapAddBtn.addEventListener('click', () => {
            console.log('TimeSwap 추가 버튼 클릭');
            showScreen('frame4');
        });
    }
    
    if (postList) {
        postList.addEventListener('click', (e) => {
            const post = e.target.closest('.post');
            if (post) {
                console.log('게시글 클릭됨');
                const detailDate = document.getElementById('detailDate');
                const detailAuthor = document.getElementById('detailAuthor');
                const detailBody = document.getElementById('detailBody');
                
                if (detailDate) detailDate.textContent = post.querySelector('h3')?.textContent || '';
                if (detailAuthor) detailAuthor.textContent = post.querySelector('.author')?.textContent || '';
                if (detailBody) detailBody.textContent = post.querySelector('.body-text')?.textContent || '';
                
                showScreen('timeswap-a');
            }
        });
    }
    
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            alert('근무자가 변경되었습니다.');
            showScreen('schedule');
        });
    }
    
    // 뒤로가기 버튼들
    const backIcons = document.querySelectorAll('.back-icon');
    backIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            console.log('뒤로가기 버튼 클릭');
            if (currentScreen === 'timeswap-a' || currentScreen === 'frame4') {
                showScreen('timeswap');
            } else if (currentScreen.startsWith('payroll-')) {
                if (currentScreen === 'payroll-search1' || currentScreen === 'payroll-calc1') {
                    showScreen('payroll-main');
                } else {
                    showScreen(currentScreen.replace('2', '1'));
                }
            } else {
                showScreen('home');
            }
        });
    });
    
    // 메시지 입력 관련
    const messageInput = document.getElementById('messageInput');
    const keyboardScreen = document.getElementById('home2');
    
    if (messageInput) {
        messageInput.addEventListener('focus', () => {
            console.log('메시지 입력창 포커스');
            showScreen('home2');
        });
    }
    
    if (keyboardScreen) {
        keyboardScreen.addEventListener('click', (e) => {
            if (e.target === keyboardScreen) {
                showScreen('home');
            }
        });
    }
    
    // Payroll 버튼들
    const payrollViewBtn = document.getElementById('viewPayrollButton');
    const payrollCalcBtn = document.getElementById('calculatePayrollButton');
    
    if (payrollViewBtn) {
        payrollViewBtn.addEventListener('click', () => showScreen('payroll-search1'));
    }
    
    if (payrollCalcBtn) {
        payrollCalcBtn.addEventListener('click', () => showScreen('payroll-calc1'));
    }
    
    console.log('기타 이벤트 등록 완료');
}

// API 함수들
async function loadTimeSwapPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const postList = document.getElementById('postList');
            if (postList) {
                postList.innerHTML = '';
                data.posts.forEach(post => {
                    const li = document.createElement('li');
                    li.className = 'post';
                    li.innerHTML = `
                        <h3>${post.date}</h3>
                        <p class="author">by ${post.authorId}</p>
                        <p class="body-text">${post.body}</p>
                    `;
                    postList.appendChild(li);
                });
                console.log('TimeSwap 게시글 로딩 완료');
            }
        }
    } catch (error) {
        console.error('TimeSwap 로딩 오류:', error);
    }
}

async function loadSchedules() {
    try {
        const response = await fetch(`${API_BASE_URL}/schedules`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            window.scheduleData = data.schedules;
            console.log('스케줄 데이터 로딩 완료:', data.schedules);
        }
    } catch (error) {
        console.error('스케줄 로딩 오류:', error);
    }
}

// 전역에서 접근 가능하도록
window.showScreen = showScreen;
window.toggleMenu = toggleMenu;

console.log('app.js 로딩 완료');
