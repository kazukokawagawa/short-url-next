'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ShortenForm() {
    const [url, setUrl] = useState('')
    const [shortUrl, setShortUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            })
            const data = await res.json()

            if (data.slug) {
                setShortUrl(`${window.location.origin}/${data.slug}`)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid w-full items-center gap-4">
            <form onSubmit={handleSubmit} className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="url">Original URL</Label>
                    <Input
                        id="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                </div>
                <Button disabled={loading} type="submit">
                    {loading ? 'Shortening...' : 'Shorten URL'}
                </Button>
            </form>

            {shortUrl && (
                <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md break-all">
                    <p className="text-sm font-semibold">Success!</p>
                    <a href={shortUrl} target="_blank" className="underline">{shortUrl}</a>
                </div>
            )}
        </div>
    )
}
