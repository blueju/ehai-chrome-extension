// mock/index.ts
import { MockMethod } from 'vite-plugin-mock';

export default [
    {
        url: '/api/user', // 请求的 URL
        method: 'get', // 请求方法
        response: () => {
            return {
                code: 200,
                data: {
                    name: 'John Doe',
                    age: 30,
                },
            };
        },
    },
    {
        url: '/api/login',
        method: 'post',
        response: (request) => {
            const { username, password } = request.body;
            if (username === 'admin' && password === '12345') {
                return {
                    code: 200,
                    message: '登录成功',
                };
            } else {
                return {
                    code: 401,
                    message: '用户名或密码错误',
                };
            }
        },
    },
] as MockMethod[];