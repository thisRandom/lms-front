const TOKEN_KEY = 'lms-token';
const EXPIRE_KEY = 'lms-token-expire';

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
 * 存储 Token 及过期时间
 * @param token 后端返回的 JWT 字符串
 * @param expireTime 过期时间戳（毫秒）
 */
const setToken = (token: string, expireTime?: number) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (expireTime) {
        localStorage.setItem(EXPIRE_KEY, expireTime.toString());
    }
};

/**
 * 获取 Token 过期时间
 */
const getExpireTime = (): number => {
    const expire = localStorage.getItem(EXPIRE_KEY);
    return expire ? parseInt(expire, 10) : 0;
};

/**
 * 判断 Token 是否已过期
 */
const isTokenExpired = (): boolean => {
    const expireTime = getExpireTime();
    if (!expireTime) return false;
    return Date.now() > expireTime;
};

/**
 * 清除 Token (退出登录或 Token 失效时调用)
 */
const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRE_KEY);
};

export { isLogin, getToken, setToken, getExpireTime, isTokenExpired, clearToken };