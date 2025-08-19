document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    const menuScreen = document.getElementById('menu');
    const menuIcons = document.querySelectorAll('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');
    const messageInput = document.getElementById('messageInput');
    const keyboardScreen = document.getElementById('home2');
    const messageArea = document.querySelector('.message-area');
    const sendButton = document.querySelector('.send-icon');
    const postList = document.getElementById('postList');
    const timeswapAddBtn = document.querySelector('.add-icon');
    const backIcons = document.querySelectorAll('.back-icon');
    const acceptBtn = document.querySelector('.accept-btn');
    const staffIdInput = document.getElementById('staffIdInput');
    const staffIdDropdown = document.getElementById('staffIdDropdown');
    const dateInput = document.getElementById('dateInput');
    const calendarIcon = document.querySelector('.calendar-icon');
    const calendarDropdown = document.getElementById('calendar-dropdown');
    const registerPostBtn = document.querySelector('.submit-btn');
    const payrollViewBtn = document.getElementById('viewPayrollButton');
    const payrollCalcBtn = document.getElementById('calculatePayrollButton');
    const staffIdSearchInput = document.getElementById('staffIdSearchInput');
    const monthSearchInput = document.getElementById('monthSearchInput');
    const staffIdCalcInput = document.getElementById('staffIdCalcInput');
    const monthCalcInput = document.getElementById('monthCalcInput');
    const hourlyRateInput = document.getElementById('hourlyRateInput');
    const hourInput = document.getElementById('hourInput');
    const payrollResultText = document.getElementById('payrollResultText');
    const payrollCalcResultText = document.getElementById('payrollCalcResultText');
    const scheduleDaysGrid = document.getElementById('scheduleDaysGrid');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');
    const popupOverlay = document.getElementById('schedule-popup');
    const closePopupBtn = document.querySelector('.close-popup');
    const okCalendarBtn = document.querySelector('.calendar-dropdown .ok-btn');
    const menuSignInBtn = document.getElementById('menuSignInBtn');
    const menuRegisterBtn = document.getElementById('menuRegisterBtn');
    const commentInput = document.getElementById('commentInput');
    const addCommentBtn = document.getElementById('addCommentBtn');
    const commentList = document.getElementById('commentList');

    // 로그인 및 회원가입 관련 요소들
    const signinBackBtn = document.getElementById('signinBackBtn');
    const registerBackBtn = document.getElementById('registerBackBtn');
    const loginIdInput = document.getElementById('loginId');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    const switchToRegisterBtn = document.getElementById('switchToRegister');
    const registerNameInput = document.getElementById('registerName');
    const registerIdInput = document.getElementById('registerId');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerEmailInput = document.getElementById('registerEmail');
    const registerCompanyInput = document.getElementById('registerCompany');
    const registerBtn = document.getElementById('registerBtn');
    const userIdDisplay = document.getElementById('userIdDisplay');
    const userNameDisplay = document.getElementById('userNameDisplay');

    let selectedDate = null;
    let isLoggedIn = false;
    let loggedInUser = null;
    let today = new Date();
    let currentScheduleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let currentDropdownMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let currentPostId = null;
    let sourceScreen = 'home'; // Register 화면으로 이동하기 직전의 화면을 저장하는 변수

    // 임시 데이터베이스 (실제로는 서버와 연동)
    const usersDB = [
        { id: 'admin', password: 'password', name: '사장님', company: 'ABC 기업', isAdmin: true },
        { id: 'user1', password: 'password', name: '김철수', company: 'ABC 기업', isAdmin: false }
    ];
    let schedulesDB = [
        // 스케줄 데이터 예시
    ];
    const postsDB = [
        {
            id: 1,
            date: '08/17/2025',
            author: 'No.1',
            body: '근무 시간 교환을 희망합니다.',
            comments: [
                { id: 1, author: '김철수', text: '몇 시 근무를 희망하시나요?' },
                { id: 2, author: 'No.1', text: '오전 9시입니다.' }
            ]
        }
    ];

    function showScreen(id) {
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(id);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    function updateMenuState() {
        if (isLoggedIn) {
            document.getElementById('menu').classList.add('logged-in');
            userIdDisplay.textContent = loggedInUser.id;
            userNameDisplay.textContent = loggedInUser.name;
        } else {
            document.getElementById('menu').classList.remove('logged-in');
        }
    }

    // 초기 화면 설정
    showScreen('home');
    updateMenuState();
    renderPosts();

    menuIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            menuScreen.classList.add('active');
        });
    });

    closeIcon.addEventListener('click', () => {
        menuScreen.classList.remove('active');
    });

    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').substring(1);
            showScreen(targetId);
            menuScreen.classList.remove('active');
        });
    });

    // 로그인 프레임 기능
    loginBtn.addEventListener('click', () => {
        const id = loginIdInput.value;
        const password = loginPasswordInput.value;

        if (!id || !password) {
            alert('ID와 Password를 모두 입력해주세요.');
            return;
        }

        const user = usersDB.find(u => u.id === id && u.password === password);
        if (user) {
            isLoggedIn = true;
            loggedInUser = user;
            updateMenuState();
            showScreen('home');
        } else {
            alert('ID 또는 비밀번호가 올바르지 않습니다.');
        }
    });

    switchToRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sourceScreen = 'signin';
        showScreen('register');
    });

    signinBackBtn.addEventListener('click', () => showScreen('home'));

    // 회원가입 프레임 기능
    registerBtn.addEventListener('click', () => {
        const name = registerNameInput.value;
        const id = registerIdInput.value;
        const password = registerPasswordInput.value;
        const email = registerEmailInput.value;
        const company = registerCompanyInput.value;

        if (!name || !id || !password || !email || !company) {
            alert('모든 정보를 입력해주세요.');
            return;
        }

        if (usersDB.some(u => u.id === id)) {
            alert('이미 존재하는 ID입니다.');
            return;
        }

        const newUser = { id, password, name, email, company, isAdmin: false };
        usersDB.push(newUser);
        alert('회원가입이 완료되었습니다.');
        showScreen('signin');
    });

    registerBackBtn.addEventListener('click', () => {
        showScreen(sourceScreen);
        sourceScreen = 'home'; // 초기값으로 재설정
    });

    // 메뉴 버튼 기능 (로그인/회원가입 화면으로 이동)
    menuSignInBtn.addEventListener('click', () => {
        sourceScreen = 'home';
        showScreen('signin');
    });
    
    menuRegisterBtn.addEventListener('click', () => {
        sourceScreen = 'home';
        showScreen('register');
    });

    // 챗봇 기능 연동
    messageInput.addEventListener('focus', () => showScreen('home2'));
    
    keyboardScreen.addEventListener('click', (e) => {
        if (e.target === keyboardScreen) {
            showScreen('home');
        }
    });

    sendButton.addEventListener('click', () => {
        const text = document.getElementById('keyboardInput').value;
        if (text) {
            const newMessage = document.createElement('div');
            newMessage.textContent = text;
            newMessage.classList.add('message', 'my-message');
            messageArea.appendChild(newMessage);
            document.getElementById('keyboardInput').value = '';

            // 챗봇 기능 (사장님 계정만)
            if (loggedInUser && loggedInUser.isAdmin) {
                if (text.includes('근무자') && text.includes('근무 요일') && text.includes('근무 시간')) {
                    setTimeout(() => {
                        const botMessage = document.createElement('div');
                        botMessage.textContent = '근무자 스케줄이 등록되었습니다.';
                        botMessage.classList.add('message', 'other-message');
                        messageArea.appendChild(botMessage);
                        messageArea.scrollTop = messageArea.scrollHeight;
                        renderScheduleCalendar();
                    }, 500);

                    const workerName = text.match(/근무자\s*([A-Za-z가-힣]+)/);
                    const scheduleInfo = text.match(/([월화수목금토일]+)\s*(.*)/);

                    if (workerName && scheduleInfo) {
                        const days = scheduleInfo[1].split('');
                        const time = scheduleInfo[2].trim();
                        
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);

                        for (let i = 0; i < 30; i++) {
                            const date = new Date(tomorrow);
                            date.setDate(tomorrow.getDate() + i);
                            
                            const dayOfWeek = date.getDay();
                            const dayMap = ['일', '월', '화', '수', '목', '금', '토'];

                            if (days.includes(dayMap[dayOfWeek])) {
                                schedulesDB.push({
                                    date: date.toISOString().slice(0, 10),
                                    worker: workerName[1],
                                    time: time,
                                    color: Math.random() > 0.5 ? 'purple' : 'orange'
                                });
                            }
                        }
                    }
                }
            }
            showScreen('home');
            messageArea.scrollTop = messageArea.scrollHeight;
        }
    });
    
    // 게시글 목록 렌더링
    function renderPosts() {
        postList.innerHTML = '';
        postsDB.forEach(post => {
            const newPost = document.createElement('li');
            newPost.classList.add('post');
            newPost.setAttribute('data-post-id', post.id);
            newPost.innerHTML = `
                <h3>${post.date}</h3>
                <p class="author">by ${post.author}</p>
                <p class="body-text">${post.body}</p>
            `;
            postList.appendChild(newPost);
        });
    }

    // 게시글 클릭 시 상세 페이지 이동
    postList.addEventListener('click', (e) => {
        const postElement = e.target.closest('.post');
        if (postElement) {
            const postId = parseInt(postElement.dataset.postId);
            const post = postsDB.find(p => p.id === postId);
            if (post) {
                currentPostId = postId;
                document.getElementById('detailDate').textContent = post.date;
                document.getElementById('detailAuthor').textContent = `by ${post.author}`;
                document.getElementById('detailBody').textContent = post.body;
                renderComments(post.comments);
                showScreen('timeswap-a');
            }
        }
    });

    // 댓글 렌더링
    function renderComments(comments) {
        commentList.innerHTML = '';
        comments.forEach(comment => {
            const commentItem = document.createElement('li');
            commentItem.classList.add('comment-item');
            commentItem.innerHTML = `
                <p class="comment-author">${comment.author}</p>
                <p class="comment-text">${comment.text}</p>
            `;
            commentList.appendChild(commentItem);
        });
    }

    // 댓글 등록
    addCommentBtn.addEventListener('click', () => {
        if (!isLoggedIn) {
            alert('로그인 후 댓글을 작성할 수 있습니다.');
            return;
        }
        const text = commentInput.value.trim();
        if (text && currentPostId) {
            const post = postsDB.find(p => p.id === currentPostId);
            if (post) {
                const newComment = {
                    id: post.comments.length + 1,
                    author: loggedInUser.name,
                    text: text
                };
                post.comments.push(newComment);
                renderComments(post.comments);
                commentInput.value = '';
            }
        }
    });

    acceptBtn.addEventListener('click', () => {
        alert('근무자가 변경되었습니다.');
        showScreen('schedule');
    });

    timeswapAddBtn.addEventListener('click', () => showScreen('frame4'));

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

    registerPostBtn.addEventListener('click', () => {
        const staffId = staffIdInput.value;
        const date = dateInput.value;
        const text = document.getElementById('postBodyText').value;

        if (staffId && date && text) {
            const newPost = {
                id: postsDB.length + 1,
                date: date,
                author: staffId,
                body: text,
                comments: []
            };
            postsDB.unshift(newPost);
            renderPosts();
            showScreen('timeswap');
        } else {
            alert('모든 정보를 입력해주세요.');
        }
    });
    
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

            const dateISO = new Date(year, month, i).toISOString().slice(0, 10);
            const scheduleItem = schedulesDB.find(s => s.date === dateISO);
            
            if (scheduleItem) {
                const item = document.createElement('span');
                item.classList.add('schedule-item', scheduleItem.color);
                item.textContent = `근무자 ${scheduleItem.worker}`;
                dayCell.appendChild(item);

                dayCell.addEventListener('click', () => {
                    document.getElementById('popup-detail').innerHTML = `
                        <h3>${year}년 ${month + 1}월 ${i}일</h3>
                        <p><strong>근무자:</strong> ${scheduleItem.worker}</p>
                        <p><strong>근무 시간:</strong> ${scheduleItem.time}</p>
                    `;
                    showScreen('schedule-popup');
                });
            }
            targetGrid.appendChild(dayCell);
        }
    }

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

    closePopupBtn.addEventListener('click', () => showScreen('schedule'));

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
            selectedDate = `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
            document.querySelectorAll('.days-grid div').forEach(d => d.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });
    okCalendarBtn.addEventListener('click', () => {
        if (selectedDate) {
            dateInput.value = selectedDate;
            calendarDropdown.classList.remove('visible');
        } else {
            alert('날짜를 선택해주세요.');
        }
    });

    payrollViewBtn.addEventListener('click', () => showScreen('payroll-search1'));
    payrollCalcBtn.addEventListener('click', () => showScreen('payroll-calc1'));

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

    document.querySelector('#payroll-calc1 .search-icon').addEventListener('click', () => {
        const staffId = staffIdCalcInput.value;
        const month = monthCalcInput.value;
        const hourlyRate = parseInt(hourlyRateInput.value);
        const hour = parseInt(hourInput.value);

        if (staffId && month && hourlyRate && hour) {
            const baseSalary = hour * hourlyRate;
            const weeklyAllowance = Math.floor((hour / 40) * 8 * hourlyRate);
            const totalBeforeTax = baseSalary + weeklyAllowance;
            const taxRate = 0.033;
            const taxAmount = Math.floor(totalBeforeTax * taxRate);
            const finalSalary = totalBeforeTax - taxAmount;

            payrollCalcResultText.textContent = `
Staff ID: ${staffId}
Month: ${month}
Hourly Rate: ${hourlyRate.toLocaleString()}원
Total Hours: ${hour}
--------------------
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