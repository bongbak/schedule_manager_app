// API 기본 URL
const API_BASE_URL = 'http://localhost:3000';

// API 호출 함수
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                throw new Error('인증이 필요합니다.');
            }
            const error = await response.json();
            throw new Error(error.message || '서버 오류가 발생했습니다.');
        }

        return await response.json();
    } catch (error) {
        console.error('API 호출 에러:', error);
        throw error;
    }
}

// TimeSwap API 함수들
const timeswapApi = {
    // 교대 요청 목록 조회
    getSwapRequests: () => apiCall('/swap-requests'),

    // 새로운 교대 요청 생성
    createSwapRequest: (data) => apiCall('/swap-requests', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // 교대 요청 수락
    acceptSwapRequest: (requestId, toShiftId) => apiCall(`/swap-requests/${requestId}/accept`, {
        method: 'POST',
        body: JSON.stringify({ to_shift_id: toShiftId })
    })
};

// Schedule API 함수들
const scheduleApi = {
    // 스케줄 조회
    getSchedule: (year, month) => apiCall(`/api/shifts?year=${year}&month=${month}`),

    // 새로운 스케줄 생성
    createSchedule: (data) => apiCall('/api/shifts', {
        method: 'POST',
        body: JSON.stringify(data)
    })
};

// Payroll API 함수들
const payrollApi = {
    // 급여 조회
    getPayroll: (staffId, month) => apiCall(`/payroll?staff_id=${staffId}&month=${month}`),

    // 급여 계산
    calculatePayroll: (data) => apiCall('/payroll/calculate', {
        method: 'POST',
        body: JSON.stringify(data)
    })
};
