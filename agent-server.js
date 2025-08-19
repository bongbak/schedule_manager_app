const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // .env 파일 로드
const { OpenAI } = require('openai');

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // 현재 디렉토리의 정적 파일 제공

// 임시 사용자 데이터베이스
const users = [
    { id: 'admin', password: 'password', name: '사장님', email: 'admin@example.com', isAdmin: true },
    { id: 'user1', password: 'password', name: '직원1', email: 'user1@example.com', isAdmin: false }
];

// TimeSwap 게시글 데이터
const posts = [
    {
        id: 1,
        date: '08/17/2025',
        time: '14:00-18:00',
        authorId: 'user1',
        body: '근무 시간 교환을 희망합니다.'
    }
];

// 스케줄 데이터
const schedules = [
    {
        date: '2025-08-20',
        workerId: 'user1',
        time: '09:00-18:00',
        workerName: '직원1'
    }
];

// 로그인 API
app.post('/api/auth/login', (req, res) => {
    const { id, password } = req.body;
    const user = users.find(u => u.id === id && u.password === password);
    
    if (user) {
        const token = jwt.sign(
            { id: user.id, name: user.name, isAdmin: user.isAdmin },
            SECRET_KEY,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            },
            token
        });
    } else {
        res.status(401).json({
            success: false,
            message: '아이디 또는 비밀번호가 올바르지 않습니다.'
        });
    }
});

// 회원가입 API
app.post('/api/auth/register', (req, res) => {
    const { id, password, name, email, company } = req.body;
    
    // 아이디 중복 체크
    if (users.find(u => u.id === id)) {
        return res.status(400).json({
            success: false,
            message: '이미 사용중인 아이디입니다.'
        });
    }
    
    // 새 사용자 추가
    const newUser = {
        id,
        password,
        name,
        email,
        company,
        isAdmin: false
    };
    
    users.push(newUser);
    
    res.json({
        success: true,
        message: '회원가입이 완료되었습니다.'
    });
});

// 토큰 검증 미들웨어
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({
            success: false,
            message: '토큰이 제공되지 않았습니다.'
        });
    }
    
    try {
        const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: '유효하지 않은 토큰입니다.'
        });
    }
}

// 사용자 정보 조회 API
app.get('/api/user/info', verifyToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// TimeSwap 게시글 목록 조회
app.get('/api/posts', verifyToken, (req, res) => {
    res.json({
        success: true,
        posts: posts
    });
});

// TimeSwap 게시글 작성
app.post('/api/posts', verifyToken, (req, res) => {
    const { date, time, body } = req.body;
    const newPost = {
        id: posts.length + 1,
        date,
        time,
        authorId: req.user.id,
        body
    };
    
    posts.push(newPost);
    
    res.json({
        success: true,
        post: newPost
    });
});

// 스케줄 조회
app.get('/api/schedules', verifyToken, (req, res) => {
    res.json({
        success: true,
        schedules: schedules
    });
});

// 스케줄 생성/수정
app.post('/api/schedules', verifyToken, (req, res) => {
    const { date, workerId, time, workerName } = req.body;
    
    // 기존 스케줄 확인
    const existingScheduleIndex = schedules.findIndex(s => s.date === date);
    
    if (existingScheduleIndex >= 0) {
        // 기존 스케줄 업데이트
        schedules[existingScheduleIndex] = { date, workerId, time, workerName };
    } else {
        // 새 스케줄 추가
        schedules.push({ date, workerId, time, workerName });
    }
    
    res.json({
        success: true,
        schedule: { date, workerId, time, workerName }
    });
});

// 채팅 메시지 처리 (GPT-4o-mini 연동)
app.post('/api/chat', verifyToken, async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;

    console.log(`[Chat] User: ${userName}(${userId}), Message: "${message}"`);

    try {
        // 1. GPT-4o-mini API 호출
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a schedule management assistant named 'Agentica'. Your role is to help users manage their work schedules.
- Your responses must be in Korean.
- Today's date is ${new Date().toISOString().split('T')[0]}.
- The user you are talking to is ${userName} (ID: ${userId}).
- **Function Calling**: When you need to perform an action (like creating a timeswap post or a schedule), respond ONLY with a JSON object in the format: \`{"function": "function_name", "parameters": {"key": "value"}}\`.
- **Crucially**, when a user asks to swap, change, or exchange a shift (e.g., "근무 교체", "근무 변경", "바꿔줘"), you MUST use the \`create_timeswap\` function. For creating a new work schedule, use \`create_schedule\`.
- When a user asks to swap a shift, you must extract both the date and the specific time from their request.
- Available functions:
  - \`create_timeswap(date, time, body)\`: Creates a timeswap request. 'date' should be 'YYYY/MM/DD', 'time' should be 'HH:mm' or similar format, and 'body' is a short description.
  - \`create_schedule(date, time, workerName)\`: Creates a new schedule for a worker. 'date' is 'YYYY-MM-DD', 'time' is 'HH:mm-HH:mm'.
- For other general conversation, respond naturally as a helpful assistant.`
                },
                { role: "user", content: message }
            ],
            temperature: 0.7,
        });

        const gptResponse = completion.choices[0].message.content;
        console.log('[GPT-4o-mini Response]', gptResponse);

        let finalResponse = gptResponse;
        let timeswapCreated = false;
        let scheduleCreated = false;

        // 2. Function Calling 응답 처리
        try {
            const parsedResponse = JSON.parse(gptResponse);
            if (parsedResponse.function) {
                const { function: funcName, parameters } = parsedResponse;

                if (funcName === 'create_timeswap') {
                    const { date, time, body } = parameters;
                    const newPost = { id: posts.length + 1, date, time, authorId: userId, body: `[AI 생성] ${body}` };
                    posts.push(newPost);
                    timeswapCreated = true;
                    finalResponse = `✅ ${date} ${time || ''} 근무 교환(TimeSwap) 요청을 등록했어요.`;
                }
                else if (funcName === 'create_schedule') {
                    const { date, time, workerName } = parameters;
                    const newSchedule = { date, workerId: userId, time, workerName };
                    schedules.push(newSchedule);
                    scheduleCreated = true;
                    finalResponse = `✅ ${date} (${time}) 스케줄을 등록했습니다.`;
                }
                else if (funcName === 'get_schedules') {
                    const userSchedules = schedules.filter(s => s.workerId === userId);
                    if (userSchedules.length > 0) {
                        const scheduleList = userSchedules.map(s => `\n- ${s.date}: ${s.time}`).join('');
                        finalResponse = `${userName}님의 예정된 스케줄입니다:${scheduleList}`;
                    } else {
                        finalResponse = '아직 등록된 스케줄이 없네요.';
                    }
                }
            }
        } catch (e) {
            // JSON 파싱 실패 시, 일반 텍스트 응답으로 처리
        }

        res.json({
            success: true,
            response: finalResponse,
            timeswapCreated,
            scheduleCreated,
        });

    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ success: false, response: 'AI 서버 연결에 실패했습니다. API 키를 확인해주세요.' });
    }
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행중입니다.`);
});
