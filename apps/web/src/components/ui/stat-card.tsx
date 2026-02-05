import * as React from 'react'

import { cn } from '../../lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  className?: string
}

export function StatCard({
  label,
  value,
  sublabel,
  className,
}: StatCardProps): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-md border border-table-border bg-table-row-even px-4 py-3',
        className
      )}
    >
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </div>
      {sublabel && (
        <div className="mt-0.5 text-xs text-muted-foreground">{sublabel}</div>
      )}
    </div>
  )
}
