const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // 현재 디렉토리의 정적 파일 제공

// 임시 사용자 데이터베이스
const users = [
    { id: 'admin', password: 'password', name: '사장님', isAdmin: true },
    { id: 'user1', password: 'password', name: '직원1', isAdmin: false }
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

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행중입니다.`);
});
