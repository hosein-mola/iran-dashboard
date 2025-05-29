import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ReactNode } from "react"

export function StatsCard({
    title,
    value,
    icon,
    helperText,
    loading,
    className,
  }: {
    title: string
    value: string
    icon: ReactNode
    helperText: string
    loading: boolean
    className: string
  }) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold">
            {loading ? (
              <Skeleton>
                <span className="opacity-0">0</span>
              </Skeleton>
            ) : (
              value
            )}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-xl">{helperText}</p>
        </CardFooter>
      </Card>
    )
  }