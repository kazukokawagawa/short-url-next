'use server'

import { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * 认证工具函数
 * 封装重复的用户认证检查逻辑
 */

// 认证成功返回类型
export interface AuthSuccess {
    user: User
    error?: never
    needsLogin?: never
}

// 认证失败返回类型
export interface AuthError {
    user?: never
    error: string
    needsLogin?: boolean
}

// 认证结果联合类型
export type AuthResult = AuthSuccess | AuthError

/**
 * 获取当前用户，不强制登录
 * @returns 用户对象或 null
 */
export async function getCurrentUser(supabase: SupabaseClient): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

/**
 * 验证用户必须登录（用于 Server Actions）
 * 如果未登录，返回包含 needsLogin 标记的错误对象
 */
export async function requireAuth(supabase: SupabaseClient): Promise<AuthResult> {
    const user = await getCurrentUser(supabase)

    if (!user) {
        return {
            error: "User not authenticated",
            needsLogin: true
        }
    }

    return { user }
}

/**
 * 验证用户必须登录（用于 API 路由）
 * 如果未登录，抛出包含状态码的对象供 API 路由使用
 */
export async function requireAuthForApi(supabase: SupabaseClient) {
    const user = await getCurrentUser(supabase)

    if (!user) {
        return {
            authenticated: false as const,
            user: null
        }
    }

    return {
        authenticated: true as const,
        user
    }
}

/**
 * 检查用户是否可以执行公开操作
 * 用于支持 allowPublicShorten 的场景
 */
export interface PublicAccessSuccess {
    user: User | null
    error?: never
    needsLogin?: never
}

export interface PublicAccessError {
    user?: never
    error: string
    needsLogin?: boolean
}

export type PublicAccessResult = PublicAccessSuccess | PublicAccessError

export async function checkPublicAccess(
    supabase: SupabaseClient,
    allowPublic: boolean
): Promise<PublicAccessResult> {
    const user = await getCurrentUser(supabase)

    // 如果不允许公开操作且用户未登录
    if (!user && !allowPublic) {
        return {
            error: "User not authenticated",
            needsLogin: true
        }
    }

    return { user }
}

