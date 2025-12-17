import * as React from "react"
import { Loader2 } from "lucide-react"
import { Button, ButtonProps } from "@/components/ui/button"

export interface LoadingButtonProps extends ButtonProps {
    loading?: boolean
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({ loading, children, disabled, ...props }, ref) => {
        return (
            <Button ref={ref} disabled={loading || disabled} {...props}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </Button>
        )
    }
)
LoadingButton.displayName = "LoadingButton"
