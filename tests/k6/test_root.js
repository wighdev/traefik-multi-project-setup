import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '30s', target: 30 },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:58002';

export default function () {
    const res = http.get(`${BASE_URL}/`);
    check(res, {
        'status is 200': (r) => r.status === 200,
        'body contains Dashboard': (r) => r.body && r.body.includes('Server Dashboard'),
    });
    sleep(1);
}