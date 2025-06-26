"use client"

import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"

function PageHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6",
        className
      )}
      {...props}
    >
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">{children}</div>
    </header>
  )
}

function PageHeaderTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h1 className={cn("text-xl font-bold font-headline tracking-tight", className)} {...props}>{children}</h1>
}

export { PageHeader, PageHeaderTitle };
