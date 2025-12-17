export function getFriendlyErrorMessage(error: any): string {
    // 1. 唯一性冲突
    if (error.code === '23505') {
        if (error.message.includes('links_slug_key')) {
            return '短链接后缀已被占用'
        }
        return '数据已存在'
    }

    // 2. 数据格式错误
    if (error.code === '22P02') {
        return '输入的数据格式无效'
    }

    // 3. 默认错误
    return error.message || '未知错误'
}
