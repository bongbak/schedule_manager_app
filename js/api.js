// API 엔드포인트 설정
const API_BASE_URL = 'http://localhost:3000';

// API 요청 함수들
const api = {
    // 로그인 API
    login: async (userid, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userid, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '로그인 실패');
            }
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // 회원가입 API
    register: async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '회원가입 실패');
            }
            return data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    // 근무 일정 관련 API
    shifts: {
        // 근무 일정 등록
        create: async (shiftData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/shifts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(shiftData),
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || '근무 일정 등록 실패');
                }
                return data;
            } catch (error) {
                console.error('Shift creation error:', error);
                throw error;
            }
        },

        // 근무 일정 조회
        get: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            try {
                const response = await fetch(`${API_BASE_URL}/api/shifts?${queryString}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || '근무 일정 조회 실패');
                }
                return data;
            } catch (error) {
                console.error('Shift fetch error:', error);
                throw error;
            }
        }
    },

    // 급여 관련 API
    payroll: {
        // 급여 조회
        get: async (staffId, month) => {
            try {
                const response = await fetch(`${API_BASE_URL}/payroll/${staffId}/${month}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || '급여 조회 실패');
                }
                return data;
            } catch (error) {
                console.error('Payroll fetch error:', error);
                throw error;
            }
        }
    },

    // 근무 교환 요청 관련 API
    swaps: {
        // 교환 요청 생성
        create: async (swapData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/swap-requests`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(swapData),
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || '교환 요청 생성 실패');
                }
                return data;
            } catch (error) {
                console.error('Swap request creation error:', error);
                throw error;
            }
        },

        // 교환 요청 목록 조회
        list: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/swap-requests`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || '교환 요청 목록 조회 실패');
                }
                return data;
            } catch (error) {
                console.error('Swap request list error:', error);
                throw error;
            }
        },

        // 교환 요청 수락
        accept: async (requestId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/swap-requests/${requestId}/accept`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || '교환 요청 수락 실패');
                }
                return data;
            } catch (error) {
                console.error('Swap request accept error:', error);
                throw error;
            }
        }
    }
};

// 토큰 관리
const auth = {
    setToken: (token) => {
        localStorage.setItem('token', token);
    },
    getToken: () => {
        return localStorage.getItem('token');
    },
    removeToken: () => {
        localStorage.removeItem('token');
    },
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};
