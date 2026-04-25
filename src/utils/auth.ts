const TOKEN_KEY = 'lms-token';

/**
 * 判断是否已登录 (是否有 Token)
 */
const isLogin = () => {
    return !!localStorage.getItem(TOKEN_KEY);
};

/**
 * 获取当前 Token
 */
const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * 存储 Token
 * @param token 后端返回的 JWT 字符串
 */
const setToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 清除 Token (退出登录或 Token 失效时调用)
 */
const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export { isLogin, getToken, setToken, clearToken };