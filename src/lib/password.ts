'use server'

import bcrypt from 'bcryptjs'

/**
 * 密码处理工具
 * 封装密码哈希和验证逻辑
 */

// 密码类型
export type PasswordType = 'none' | 'six_digit' | 'custom'

// 密码验证结果
export interface PasswordValidationResult {
    valid: boolean
    error?: string
}

// 密码处理结果
export interface PasswordProcessResult {
    hash: string | null
    error?: string
}

/**
 * 验证密码格式
 */
export async function validatePasswordFormat(
    passwordType: PasswordType,
    password: string
): Promise<PasswordValidationResult> {
    if (passwordType === 'none') {
        return { valid: true }
    }

    if (passwordType === 'six_digit') {
        if (!/^\d{6}$/.test(password)) {
            return {
                valid: false,
                error: '6位密码必须是纯数字'
            }
        }
    }

    if (passwordType === 'custom') {
        if (!password || password.length === 0) {
            return {
                valid: false,
                error: '自定义口令不能为空'
            }
        }
        if (password.length > 128) {
            return {
                valid: false,
                error: '自定义口令最长128位'
            }
        }
    }

    return { valid: true }
}

/**
 * 对密码进行哈希
 */
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
}

/**
 * 处理链接创建/更新时的密码
 * 验证格式并生成哈希
 */
export async function processLinkPassword(
    passwordType: PasswordType | string,
    password: string
): Promise<PasswordProcessResult> {
    const type = (passwordType || 'none') as PasswordType

    // 无密码时直接返回
    if (type === 'none' || !password) {
        return { hash: null }
    }

    // 验证格式
    const validation = await validatePasswordFormat(type, password)
    if (!validation.valid) {
        return {
            hash: null,
            error: validation.error
        }
    }

    // 生成哈希
    const hash = await hashPassword(password)
    return { hash }
}

/**
 * 验证密码是否匹配
 */
export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return await bcrypt.compare(password, hash)
}
