import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { VerifyPasswordClient } from '@/app/[slug]/verify/verify-client'

export const dynamic = 'force-dynamic'

interface Props {
    params: Promise<{ slug: string }>
}

export default async function VerifyPasswordPage({ params }: Props) {
    const { slug } = await params

    // 查询链接信息
    const { data: link, error } = await supabase
        .from('links')
        .select('id, password_type, expires_at')
        .eq('slug', slug)
        .single()

    if (error || !link) {
        notFound()
    }

    // 检查是否过期
    if (link.expires_at) {
        const isExpired = new Date(link.expires_at) < new Date()
        if (isExpired) {
            await supabase.from('links').delete().eq('id', link.id)
            notFound()
        }
    }

    // 如果不需要密码，直接跳转
    if (!link.password_type || link.password_type === 'none') {
        notFound()
    }

    return (
        <VerifyPasswordClient
            slug={slug}
            passwordType={link.password_type as 'six_digit' | 'custom'}
        />
    )
}
