export function SiteFooter() {
    return (
        <footer className="fixed bottom-4 left-0 right-0 w-full text-center text-xs text-muted-foreground z-50 pointer-events-none">
            <div className="pointer-events-auto inline-block">
                <p>
                    &copy; {new Date().getFullYear()} Chiyuyu. All rights reserved.
                </p>
                <p className="mt-1">
                    Built with <span className="text-red-400">❤</span> by{" "}
                    <a
                        href="https://chiyu.it"
                        target="_blank"
                        className="underline hover:text-foreground transition-colors"
                    >
                        池鱼
                    </a>
                </p>
            </div>
        </footer>
    )
}
