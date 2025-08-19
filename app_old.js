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

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM 로딩 완료');
    
    // 로그인 확인 (임시로 비활성화)
    // if (!isAuthenticated()) {
    //     window.location.href = 'login.html';
    //     return;
    // }
    // DOM 요소들 가져오기
    const screens = document.querySelectorAll('.screen');
    const menuScreen = document.getElementById('menu');
    const menuIcons = document.querySelectorAll('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');
    
    console.log('메뉴 아이콘 개수:', menuIcons.length);
    console.log('메뉴 화면:', menuScreen);

    // 화면 전환 함수
    function showScreen(id) {
        console.log('화면 전환:', id);
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(id);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    // 초기 화면을 home으로 설정
    showScreen('home');

    // 메뉴 아이콘 클릭 이벤트
    menuIcons.forEach((icon, index) => {
        console.log(`메뉴 아이콘 ${index} 이벤트 리스너 추가`);
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('메뉴 아이콘 클릭됨!');
            if (menuScreen) {
                menuScreen.classList.add('active');
                console.log('메뉴 화면 활성화됨');
            } else {
                console.error('메뉴 화면을 찾을 수 없음');
            }
        });
    });

    // 메뉴 닫기 이벤트
    if (closeIcon) {
        closeIcon.addEventListener('click', () => {
            console.log('메뉴 닫기 클릭됨');
            menuScreen.classList.remove('active');
        });
    }

    // 메뉴 항목 클릭 이벤트
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').substring(1);
            console.log('메뉴 항목 클릭:', targetId);
            
            if (targetId === 'logout') {
                logout();
                return;
            }
            
            showScreen(targetId);
            menuScreen.classList.remove('active');
        });
    });

    // 나머지 DOM 요소들
    const messageInput = document.getElementById('messageInput');
    const keyboardScreen = document.getElementById('home2');
    const messageArea = document.querySelector('.message-area');
    const sendButton = document.querySelector('.send-icon');
    const postList = document.getElementById('postList');
    const timeswapAddBtn = document.querySelector('.add-icon');
    const backIcons = document.querySelectorAll('.back-icon');
    const acceptBtn = document.querySelector('.accept-btn');

    // 기본 이벤트들
    if (messageInput) {
        messageInput.addEventListener('focus', () => showScreen('home2'));
    }

    if (keyboardScreen) {
        keyboardScreen.addEventListener('click', (e) => {
            if (e.target === keyboardScreen) {
                showScreen('home');
            }
        });
    }

    if (timeswapAddBtn) {
        timeswapAddBtn.addEventListener('click', () => showScreen('frame4'));
    }

    if (postList) {
        postList.addEventListener('click', (e) => {
            const post = e.target.closest('.post');
            if (post) {
                const detailDate = document.getElementById('detailDate');
                const detailAuthor = document.getElementById('detailAuthor');
                const detailBody = document.getElementById('detailBody');
                
                if (detailDate) detailDate.textContent = post.querySelector('h3').textContent;
                if (detailAuthor) detailAuthor.textContent = post.querySelector('.author').textContent;
                if (detailBody) detailBody.textContent = post.querySelector('.body-text').textContent;
                
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
    backIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const currentScreenId = document.querySelector('.screen.active').id;
            if (currentScreenId === 'timeswap-a' || currentScreenId === 'frame4') {
                showScreen('timeswap');
            } else if (currentScreenId.startsWith('payroll-')) {
                if (currentScreenId === 'payroll-search1' || currentScreenId === 'payroll-calc1') {
                    showScreen('payroll-main');
                } else {
                    showScreen(currentScreenId.replace('2', '1'));
                }
            } else {
                showScreen('home');
            }
        });
    });

    console.log('모든 이벤트 리스너 등록 완료');

    // API 함수들
    async function loadTimeSwapPosts() {
        try {
            const response = await fetch(`${API_BASE_URL}/posts`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            
            if (data.success && postList) {
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
                // 스케줄 데이터를 전역 변수에 저장
                window.scheduleData = data.schedules;
                console.log('스케줄 데이터 로딩됨:', data.schedules);
                // 달력 새로고침
                if (typeof renderScheduleCalendar === 'function') {
                    renderScheduleCalendar();
                }
            }
        } catch (error) {
            console.error('스케줄 로딩 오류:', error);
        }
    }

    // 페이지 로드 시 데이터 불러오기
    loadTimeSwapPosts();
    loadSchedules();

    // 페이지 변경 시 데이터 새로고침
    const originalShowScreen = showScreen;
    function showScreen(id) {
        originalShowScreen(id);
        
        if (id === 'timeswap') {
            loadTimeSwapPosts();
        } else if (id === 'schedule') {
            loadSchedules();
        }
    }

    // showScreen 함수를 전역으로 노출
    window.showScreen = showScreen;

    // 홈 화면 입력창 클릭 -> 키보드 화면
    messageInput.addEventListener('focus', () => showScreen('home2'));
    
    // 키보드 화면 여백 클릭 -> 홈 화면
    keyboardScreen.addEventListener('click', (e) => {
        if (e.target === keyboardScreen) {
            showScreen('home');
        }
    });

    // 키보드 입력 후 메시지 출력
    sendButton.addEventListener('click', () => {
        const text = document.getElementById('keyboardInput').value;
        if (text) {
            const newMessage = document.createElement('div');
            newMessage.textContent = text;
            newMessage.classList.add('message', 'my-message');
            messageArea.appendChild(newMessage);
            document.getElementById('keyboardInput').value = '';
            showScreen('home');
            messageArea.scrollTop = messageArea.scrollHeight;
        }
    });

    // TimeSwap 게시글 클릭 -> TimeSwap(A)
    postList.addEventListener('click', (e) => {
        const post = e.target.closest('.post');
        if (post) {
            document.getElementById('detailDate').textContent = post.querySelector('h3').textContent;
            document.getElementById('detailAuthor').textContent = post.querySelector('.author').textContent;
            document.getElementById('detailBody').textContent = post.querySelector('.body-text').textContent;
            showScreen('timeswap-a');
        }
    });

    // TimeSwap(A) 수락 버튼 클릭 -> Schedule 화면 이동 (임시)
    acceptBtn.addEventListener('click', () => {
        alert('근무자가 변경되었습니다.');
        showScreen('schedule');
    });

    // TimeSwap `+` 버튼 -> Frame 4
    timeswapAddBtn.addEventListener('click', () => showScreen('frame4'));

    // 뒤로 가기 버튼 (`<`)
    backIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            // 현재 화면에 따라 동적으로 뒤로가기
            const currentScreenId = document.querySelector('.screen.active').id;
            if (currentScreenId === 'timeswap-a' || currentScreenId === 'frame4') {
                showScreen('timeswap');
            } else if (currentScreenId.startsWith('payroll-')) {
                // Payroll 화면별 뒤로가기
                if (currentScreenId === 'payroll-search1' || currentScreenId === 'payroll-calc1') {
                    showScreen('payroll-main');
                } else {
                    showScreen(currentScreenId.replace('2', '1'));
                }
            } else {
                showScreen('home');
            }
        });
    });

    // Frame 4 '등록' 버튼 클릭 -> TimeSwap에 게시글 추가
    registerBtn.addEventListener('click', () => {
        const staffId = staffIdInput.value;
        const date = dateInput.value;
        const text = document.getElementById('postBodyText').value;

        if (staffId && date && text) {
            const newPost = document.createElement('li');
            newPost.classList.add('post');
            newPost.innerHTML = `
                <h3>${date}</h3>
                <p class="author">by ${staffId}</p>
                <p class="body-text">${text}</p>
            `;
            postList.prepend(newPost);
            showScreen('timeswap');
        } else {
            alert('모든 정보를 입력해주세요.');
        }
    });
    
    // Frame 4 Staff Id 드롭다운
    const staffIds = ['No.1', 'No.2', 'No.3', 'No.4', 'No.5', 'No.6', 'No.7', 'No.8', 'No.9'];
    staffIds.forEach(id => {
        const li = document.createElement('li');
        li.textContent = id;
        li.setAttribute('data-value', id);
        staffIdDropdown.appendChild(li);
    });

    staffIdInput.addEventListener('click', () => {
        staffIdDropdown.classList.toggle('visible');
    });
    staffIdDropdown.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            staffIdInput.value = e.target.getAttribute('data-value');
            staffIdDropdown.classList.remove('visible');
        }
    });

    // 달력 날짜 생성 함수 (Schedule, Frame 4 공통 사용)
    function generateCalendar(date, targetGrid) {
        targetGrid.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day-cell', 'empty');
            targetGrid.appendChild(emptyCell);
        }

        for (let i = 1; i <= lastDate; i++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day-cell');
            dayCell.textContent = i;
            if (targetGrid.id === 'scheduleDaysGrid') {
                // 더미 데이터로 근무자 일정 추가
                if (i === 2 || i === 20) {
                    const item = document.createElement('span');
                    item.classList.add('schedule-item', 'purple');
                    item.textContent = '근무자 A';
                    dayCell.appendChild(item);
                    dayCell.addEventListener('click', () => {
                        document.getElementById('popup-detail').innerHTML = `
                            <h3>${year}년 ${month + 1}월 ${i}일</h3>
                            <p><strong>근무자:</strong> 근무자 A</p>
                            <p><strong>근무 시간:</strong> 09:00 - 18:00</p>
                        `;
                        showScreen('schedule-popup');
                    });
                } else if (i === 3) {
                    const item = document.createElement('span');
                    item.classList.add('schedule-item', 'orange');
                    item.textContent = '근무자 B';
                    dayCell.appendChild(item);
                    dayCell.addEventListener('click', () => {
                        document.getElementById('popup-detail').innerHTML = `
                            <h3>${year}년 ${month + 1}월 ${i}일</h3>
                            <p><strong>근무자:</strong> 근무자 B</p>
                            <p><strong>근무 시간:</strong> 10:00 - 19:00</p>
                        `;
                        showScreen('schedule-popup');
                    });
                }
            }
            targetGrid.appendChild(dayCell);
        }
    }

    // Schedule 달력 초기화 및 이벤트
    function renderScheduleCalendar() {
        const monthYear = currentScheduleMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
        currentMonthYear.textContent = monthYear;
        generateCalendar(currentScheduleMonth, scheduleDaysGrid);
    }
    prevMonthBtn.addEventListener('click', () => {
        currentScheduleMonth.setMonth(currentScheduleMonth.getMonth() - 1);
        renderScheduleCalendar();
    });
    nextMonthBtn.addEventListener('click', () => {
        currentScheduleMonth.setMonth(currentScheduleMonth.getMonth() + 1);
        renderScheduleCalendar();
    });
    renderScheduleCalendar();

    // Schedule 팝업 닫기
    closePopupBtn.addEventListener('click', () => showScreen('schedule'));

    // Frame 4 달력 초기화 및 이벤트
    function renderDropdownCalendar() {
        const monthYear = currentDropdownMonth.toLocaleString('default', { month: 'short', year: 'numeric' });
        document.getElementById('dropdownCurrentMonthYear').textContent = monthYear;
        generateCalendar(currentDropdownMonth, document.getElementById('dropdownDaysGrid'));
    }
    calendarIcon.addEventListener('click', () => {
        calendarDropdown.classList.toggle('visible');
        renderDropdownCalendar();
    });
    document.querySelector('#calendar-dropdown .month-nav:first-child').addEventListener('click', () => {
        currentDropdownMonth.setMonth(currentDropdownMonth.getMonth() - 1);
        renderDropdownCalendar();
    });
    document.querySelector('#calendar-dropdown .month-nav:last-child').addEventListener('click', () => {
        currentDropdownMonth.setMonth(currentDropdownMonth.getMonth() + 1);
        renderDropdownCalendar();
    });
    document.getElementById('dropdownDaysGrid').addEventListener('click', (e) => {
        if (e.target.tagName === 'DIV' && !e.target.classList.contains('empty')) {
            const day = e.target.textContent;
            const month = currentDropdownMonth.getMonth() + 1;
            const year = currentDropdownMonth.getFullYear();
            dateInput.value = `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
        }
    });

    // 페이롤 버튼 이벤트
    payrollViewBtn.addEventListener('click', () => showScreen('payroll-search1'));
    payrollCalcBtn.addEventListener('click', () => showScreen('payroll-calc1'));

    // 페이롤 조회 기능
    document.querySelector('#payroll-search1 .search-icon').addEventListener('click', () => {
        const staffId = staffIdSearchInput.value;
        const month = monthSearchInput.value;
        if (staffId && month) {
            payrollResultText.textContent = `
Staff ID: ${staffId}
Month: ${month}
--------------------
총 급여: 3,500,000원
시급: 10,000원
근무시간: 200시간
주휴수당: 150,000원
세금: 120,000원
            `;
            showScreen('payroll-search2');
        } else {
            alert('Staff ID와 월을 모두 입력해주세요.');
        }
    });

    // 페이롤 계산 기능
    document.querySelector('#payroll-calc1 .search-icon').addEventListener('click', () => {
        const staffId = staffIdCalcInput.value;
        const month = monthCalcInput.value;
        const hour = parseInt(hourInput.value);
        if (staffId && month && hour) {
            const hourlyRate = 10000;
            const baseSalary = hour * hourlyRate;
            const weeklyAllowance = Math.floor((hour / 40) * 8 * hourlyRate);
            const totalBeforeTax = baseSalary + weeklyAllowance;
            const taxRate = 0.033;
            const taxAmount = Math.floor(totalBeforeTax * taxRate);
            const finalSalary = totalBeforeTax - taxAmount;

            payrollCalcResultText.textContent = `
Staff ID: ${staffId}
Month: ${month}
Total Hours: ${hour}

기본급: ${baseSalary.toLocaleString()}원
주휴수당: ${weeklyAllowance.toLocaleString()}원
세금: ${taxAmount.toLocaleString()}원
최종 급여: ${finalSalary.toLocaleString()}원
            `;
            showScreen('payroll-calc2');
        } else {
            alert('모든 정보를 입력해주세요.');
        }
    });
});