'use server'

/**
 * 带重试逻辑的异步函数执行器
 * @param fn 要执行的异步函数
 * @param maxRetries 最大重试次数（默认 3 次）
 * @param delay 重试间隔毫秒（默认 500ms）
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 500
): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn()
        } catch (error: any) {
            lastError = error
            console.log(`[Retry] Attempt ${attempt}/${maxRetries} failed:`, error.message || error)

            // 如果是最后一次尝试，不再等待
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    // 所有重试都失败了
    throw lastError
}

/**
 * 带重试的 Supabase 查询封装
 * 专门处理 fetch failed 等网络错误
 */
export async function retryQuery<T>(
    queryFn: () => PromiseLike<{ data: T | null; error: any }>,
    maxRetries: number = 3
): Promise<{ data: T | null; error: any }> {
    let lastResult: { data: T | null; error: any } = { data: null, error: null }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            lastResult = await queryFn()

            // 如果没有错误或者错误不是网络错误，直接返回
            if (!lastResult.error) {
                return lastResult
            }

            const errorMsg = lastResult.error?.message?.toLowerCase() || ''
            const isNetworkError = errorMsg.includes('fetch failed') ||
                errorMsg.includes('network') ||
                errorMsg.includes('timeout')

            // 如果不是网络错误，不重试
            if (!isNetworkError) {
                return lastResult
            }

            console.log(`[Retry] Query attempt ${attempt}/${maxRetries} failed (network error), retrying...`)

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 500))
            }
        } catch (error: any) {
            console.log(`[Retry] Query attempt ${attempt}/${maxRetries} threw exception:`, error.message)
            lastResult = { data: null, error }

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 500))
            }
        }
    }

    return lastResult
}
