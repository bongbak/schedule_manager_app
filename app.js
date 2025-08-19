document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    const menuScreen = document.getElementById('menu');
    const menuIcons = document.querySelectorAll('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');
    const inputField = document.getElementById('messageInput');
    const keyboardScreen = document.getElementById('home2');
    const messageArea = document.querySelector('.message-area');
    const sendButton = document.querySelector('.send-icon');
    const postList = document.getElementById('postList');
    const timeswapAddBtn = document.querySelector('.add-icon');
    const backIcons = document.querySelectorAll('.back-icon');
    const posts = document.querySelectorAll('.post');
    const acceptBtn = document.querySelector('.accept-btn');
    const staffIdInput = document.getElementById('staffIdInput');
    const staffIdDropdown = document.getElementById('staffIdDropdown');
    const dateInput = document.getElementById('dateInput');
    const calendarIcon = document.querySelector('.calendar-icon');
    const calendarDropdown = document.getElementById('calendar');
    const registerBtn = document.querySelector('.submit-btn');

    let currentScreenId = 'home';
    let isLoggedIn = false; // 로그인 상태 관리

    // 화면 전환 함수
    function showScreen(id) {
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(id);
        if (targetScreen) {
            targetScreen.classList.add('active');
            currentScreenId = id;
        }
    }

    // 메뉴 열기/닫기
    menuIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            menuScreen.classList.add('active');
            // 로그인 상태에 따라 메뉴 내용 변경
            const loginStateDiv = document.getElementById('loginState');
            if (isLoggedIn) {
                loginStateDiv.innerHTML = `
                    <div class="profile-info">
                        <img src="https://via.placeholder.com/50" alt="profile">
                        <div>
                            <h4>name</h4>
                            <p>email</p>
                        </div>
                    </div>
                `;
            } else {
                loginStateDiv.innerHTML = `
                    <h3 class="signin-text">Sign in</h3>
                    <button class="signin-btn">Sign in</button>
                `;
            }
        });
    });

    closeIcon.addEventListener('click', () => {
        menuScreen.classList.remove('active');
    });

    // 메뉴 항목 클릭 시 화면 이동
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').substring(1);
            showScreen(targetId);
            menuScreen.classList.remove('active');
        });
    });

    // 홈 화면 입력창 클릭 -> 키보드 화면
    inputField.addEventListener('focus', (e) => {
        e.preventDefault();
        showScreen('home2');
    });
    
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
            newMessage.classList.add('message');
            messageArea.appendChild(newMessage);
            document.getElementById('keyboardInput').value = ''; // 입력창 비우기
            showScreen('home'); // 홈 화면으로 돌아가기
        }
    });

    // TimeSwap 게시글 클릭 -> TimeSwap(A)
    posts.forEach(post => {
        post.addEventListener('click', () => {
            showScreen('timeswap-a');
        });
    });

    // TimeSwap(A) 수락 버튼 클릭
    acceptBtn.addEventListener('click', () => {
        // Schedule 프레임의 날짜 텍스트 변경 로직 (현재는 더미 데이터)
        alert('근무자가 변경되었습니다.');
        showScreen('schedule');
    });

    // Frame 4 '등록' 버튼 클릭 -> TimeSwap에 게시글 추가
    registerBtn.addEventListener('click', () => {
        const staffId = staffIdInput.value;
        const date = dateInput.value;
        const text = document.querySelector('#frame4 textarea').value;

        if (staffId && date && text) {
            const newPost = document.createElement('li');
            newPost.classList.add('post');
            newPost.innerHTML = `
                <h3>${staffId} - ${date}</h3>
                <p>${text}</p>
            `;
            postList.prepend(newPost); // 가장 위에 추가
            newPost.addEventListener('click', () => showScreen('timeswap-a')); // 클릭 이벤트 추가
            showScreen('timeswap'); // TimeSwap 화면으로 돌아가기
        } else {
            alert('모든 정보를 입력해주세요.');
        }
    });
    
    // 뒤로 가기 버튼 (<)
    backIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            showScreen('timeswap');
        });
    });

    // Frame 4 Staff Id 드롭다운
    staffIdInput.addEventListener('click', () => {
        staffIdDropdown.classList.toggle('visible');
    });
    staffIdDropdown.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            staffIdInput.value = e.target.getAttribute('data-value');
            staffIdDropdown.classList.remove('visible');
        }
    });

    // Frame 4 Date 달력 드롭다운
    calendarIcon.addEventListener('click', () => {
        calendarDropdown.classList.toggle('visible');
    });
    document.getElementById('daysGrid').addEventListener('click', (e) => {
        if (e.target.tagName === 'DIV' && !e.target.classList.contains('empty')) {
            const day = e.target.textContent;
            const month = '08'; // 현재는 8월 고정
            const year = '2025';
            dateInput.value = `${month}/${day.padStart(2, '0')}/${year}`;
            calendarDropdown.classList.remove('visible');
        }
    });
});