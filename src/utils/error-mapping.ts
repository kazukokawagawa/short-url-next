export function getFriendlyErrorMessage(error: { message: string, code?: string }): string {
    const msg = error.message.toLowerCase() // 转小写方便匹配

    // --- 1. 登录/注册相关 (Auth) ---

    // 密码错误或账号不存在
    if (msg.includes('invalid login credentials')) {
        return '账号或密码错误，请检查后重试'
    }

    // 邮箱未验证
    if (msg.includes('email not confirmed')) {
        return '您的邮箱尚未验证，请前往邮箱查收确认信'
    }

    // 账号已存在 (注册时)
    if (msg.includes('user already registered')) {
        return '该邮箱已被注册，请直接登录'
    }

    // 密码太短
    if (msg.includes('password should be at least')) {
        return '密码长度不能少于 6 位'
    }

    // 频率限制 (比如短时间内发了太多验证邮件)
    if (msg.includes('rate limit exceeded') || msg.includes('too many requests')) {
        return '操作太频繁，请稍后几分钟再试'
    }

    // --- 2. 数据库相关 (Dashboard) ---

    // 唯一性冲突 (比如短链 slug 重复)
    // PostgreSQL 错误码 23505 代表违反唯一约束
    if (error.code === '23505') {
        if (msg.includes('links_slug_key')) {
            return '该短链接名称已被占用，换一个试试吧'
        }
        return '数据已存在，请勿重复添加'
    }

    // 违反外键约束 (极少见，除非手动改了请求)
    if (error.code === '23503') {
        return '关联数据不存在'
    }

    // --- 3. 其他兜底 ---

    // 如果没有匹配到任何中文，返回原始英文，或者返回通用提示
    // return '系统繁忙，请稍后再试' 
    return error.message // 开发阶段建议保留原始报错，方便调试
}
