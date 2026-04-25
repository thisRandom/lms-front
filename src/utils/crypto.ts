import CryptoJS from 'crypto-js'

// 核心 1：必须和后端 yml 里的 secret-key 保持绝对一致，且为 16 位
const SECRET_KEY = CryptoJS.enc.Utf8.parse('1234567890123456')

/**
 * AES 加密方法
 * @param rawPassword 用户输入的明文密码
 * @returns 加密后的 Hex (16进制) 字符串
 */
export function encryptPassword(rawPassword: string): string {
    if (!rawPassword) return ''

    // 将明文密码转为 UTF-8 编码的 WordArray
    const src = CryptoJS.enc.Utf8.parse(rawPassword)

    // 核心 2：使用 AES 加密
    const encrypted = CryptoJS.AES.encrypt(src, SECRET_KEY, {
        mode: CryptoJS.mode.ECB,      // Hutool 默认的不带 IV 的模式就是 ECB
        padding: CryptoJS.pad.Pkcs7   // 前端的 Pkcs7 等同于 Java 后端的 Pkcs5Padding
    })

    // 核心 3：后端要求的是 Hex 格式（encryptHex），而不是默认的 Base64
    return encrypted.ciphertext.toString(CryptoJS.enc.Hex)
}