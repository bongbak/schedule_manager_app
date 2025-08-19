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
    // const posts = document.querySelectorAll('.post'); // API 연동으로 필요 없어짐
    const acceptBtn = document.querySelector('.accept-btn');
    const staffIdInput = document.getElementById('staffIdInput');
    const staffIdDropdown = document.getElementById('staffIdDropdown');
    const dateInput = document.getElementById('dateInput');
    const calendarIcon = document.querySelector('.calendar-icon');
    const calendarDropdown = document.getElementById('calendar');
    const registerBtn = document.querySelector('.submit-btn');

    let currentScreenId = 'home';
    let isLoggedIn = false; // 로그인 상태 관리
    let currentRequestId = null; // 선택된 교대 요청 ID를 저장

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

        // timeswap 화면으로 전환될 때 API 호출
     if (id === 'timeswap') {
            fetch('http://localhost:3000/swap-requests')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('네트워크 응답이 올바르지 않습니다.');
                    }
                    return response.json();
                })
                .then(data => {
                    const postList = document.getElementById('postList');
                    postList.innerHTML = ''; // 기존 목록 초기화
                    if (data.length === 0) {
                        postList.innerHTML = '<p style="text-align: center; color: #888;">게시글이 없습니다.</p>';
                    } else {
                        data.forEach(request => {
                            const postItem = document.createElement('li');
                            postItem.className = 'post';
                            postItem.dataset.requestId = request.swap_request_id;
                            postItem.innerHTML = `
                                <h3>${request.title}</h3>
                                <p>${request.description}</p>
                            `;
                            postList.appendChild(postItem);
                        });
                    }
                })
                .catch(error => {
                    console.error('교대 요청 목록을 불러오는 중 에러 발생:', error);
                    alert('교대 요청 목록을 불러오는 데 실패했습니다.');
                });
        }
    }


    // 메뉴 열기/닫기
    menuIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        menuScreen.classList.add('active');
        const loginStateDiv = document.getElementById('loginState');
        const menuItemsDiv = document.querySelector('.menu-items');

        // 로그인 상태에 따라 로그인 영역 내용 변경
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
            // 로그인 후 보이는 메뉴들
            menuItemsDiv.innerHTML = `
                <a href="#home" class="menu-item"><i class="fas fa-home"></i>Home</a>
                <a href="#timeswap" class="menu-item"><i class="fas fa-exchange-alt"></i>TimeSwap</a>
                <a href="#schedule" class="menu-item"><i class="fas fa-calendar-alt"></i>Schedule</a>
                <a href="#payroll" class="menu-item"><i class="fas fa-money-bill-wave"></i>Payroll</a>
                <a href="#" class="menu-item logout-btn"><i class="fas fa-sign-out-alt"></i>Log out</a>
            `;
            document.querySelector('.logout-btn').addEventListener('click', () => {
                // 로그아웃 로직 (예: 토큰 삭제, 로그인 상태 변경)
                isLoggedIn = false;
                alert('로그아웃 되었습니다.');
                menuScreen.classList.remove('active');
            });
        } else {
            loginStateDiv.innerHTML = `
                <h3 class="signin-text">Sign in</h3>
                <button class="signin-btn">Sign in</button>
            `;
            // 로그인 전 보이는 메뉴들
            menuItemsDiv.innerHTML = `
                <a href="#home" class="menu-item"><i class="fas fa-home"></i>Home</a>
                <a href="#" class="menu-item" style="color: #ccc; cursor: not-allowed;"><i class="fas fa-exchange-alt"></i>TimeSwap</a>
                <a href="#" class="menu-item" style="color: #ccc; cursor: not-allowed;"><i class="fas fa-calendar-alt"></i>Schedule</a>
                <a href="#" class="menu-item" style="color: #ccc; cursor: not-allowed;"><i class="fas fa-money-bill-wave"></i>Payroll</a>
            `;
            document.querySelector('.signin-btn').addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }

        // 동적으로 추가된 메뉴 항목에도 이벤트 리스너 다시 연결
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (item.getAttribute('href') !== '#') {
                    e.preventDefault();
                    const targetId = item.getAttribute('href').substring(1);
                    showScreen(targetId);
                    menuScreen.classList.remove('active');
                }
            });
        });
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
    // posts.forEach(post => {
    //      post.addEventListener('click', () => {
    //          showScreen('timeswap-a');
    //      });
    // });
    // 아래 코드로 대체
    postList.addEventListener('click', (e) => {
        const postElement = e.target.closest('.post');
        if (postElement) {
            currentRequestId = postElement.dataset.requestId;
            // post-detail에 데이터 표시
            const postDetailTitle = document.querySelector('#timeswap-a .post-detail h3');
            const postDetailBody = document.querySelector('#timeswap-a .post-detail p');
            postDetailTitle.textContent = postElement.querySelector('h3').textContent;
            postDetailBody.textContent = postElement.querySelector('p').textContent;

            showScreen('timeswap-a');
        }
    });

    // TimeSwap(A) 수락 버튼 클릭
    acceptBtn.addEventListener('click', () => {
        if (!currentRequestId) {
            alert('수락할 교대 요청을 선택해주세요.');
            return;
        }

        fetch(`http://localhost:3000/swap-requests/${currentRequestId}/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert('교대 요청이 수락되었습니다.');
                showScreen('timeswap');
            } else {
                return response.json().then(error => {
                    alert(`수락 실패: ${error.message}`);
                });
            }
        })
        .catch(error => {
            console.error('Fetch 에러:', error);
            alert('네트워크 오류가 발생했습니다. 서버 상태를 확인해 주세요.');
        });
    });

    // Frame 4 '등록' 버튼 클릭 -> TimeSwap에 게시글 추가
    // 아래 코드를 API 연동 코드로 대체
    registerBtn.addEventListener('click', () => {
        const from_shift_id = staffIdInput.value;
        const to_date = dateInput.value;
        const description = document.querySelector('#frame4 textarea').value;

        if (!from_shift_id || !to_date || !description) {
            alert('모든 정보를 입력해주세요.');
            return;
        }

        const data = {
            from_shift_id: from_shift_id,
            to_date: to_date,
            description: description
        };

        fetch('http://localhost:3000/swap-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                alert('교대 요청이 성공적으로 등록되었습니다.');
                showScreen('timeswap'); // 성공 시 목록 화면으로 이동
            } else {
                return response.json().then(error => {
                    alert(`요청 실패: ${error.message}`);
                });
            }
        })
        .catch(error => {
            console.error('Fetch 에러:', error);
            alert('네트워크 오류가 발생했습니다. 서버 상태를 확인해 주세요.');
        });
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