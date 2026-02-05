import * as React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

import { cn } from '../../lib/utils'

export interface Column<T> {
  key: string
  header: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  sortValue?: (item: T) => number | string
  width?: string
  hideBelow?: 'sm' | 'md' | 'lg'
  render: (item: T, index: number) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  defaultSort?: { key: string; direction: 'asc' | 'desc' }
  onRowClick?: (item: T) => void
  rowKey: (item: T) => string
  compact?: boolean
  className?: string
  emptyMessage?: string
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean
  direction: 'asc' | 'desc' | null
}): React.ReactElement {
  if (!active || !direction) {
    return <ChevronsUpDown className="size-3 opacity-40" />
  }
  return direction === 'asc' ? (
    <ChevronUp className="size-3" />
  ) : (
    <ChevronDown className="size-3" />
  )
}

export function DataTable<T>({
  columns,
  data,
  defaultSort,
  onRowClick,
  rowKey,
  compact = false,
  className,
  emptyMessage = 'No data.',
}: DataTableProps<T>): React.ReactElement {
  const [sort, setSort] = React.useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(defaultSort ?? null)

  const sortedData = React.useMemo(() => {
    if (!sort) return data
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sortValue) return data
    return [...data].sort((a, b) => {
      const va = col.sortValue!(a)
      const vb = col.sortValue!(b)
      if (typeof va === 'number' && typeof vb === 'number') {
        return sort.direction === 'asc' ? va - vb : vb - va
      }
      return sort.direction === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va))
    })
  }, [data, sort, columns])

  function handleSort(key: string): void {
    setSort((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'desc' }
    })
  }

  const cellPx = compact ? 'px-2 py-1.5' : 'px-3 py-2'

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-md border border-table-border',
        className
      )}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'bg-table-header border-b border-table-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
                  cellPx,
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.align !== 'right' &&
                    col.align !== 'center' &&
                    'text-left',
                  col.sortable &&
                    'cursor-pointer select-none hover:text-foreground',
                  col.width,
                  col.hideBelow === 'sm' && 'hidden sm:table-cell',
                  col.hideBelow === 'md' && 'hidden md:table-cell',
                  col.hideBelow === 'lg' && 'hidden lg:table-cell'
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <SortIcon
                      active={sort?.key === col.key}
                      direction={
                        sort?.key === col.key ? sort.direction : null
                      }
                    />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item, index) => (
              <tr
                key={rowKey(item)}
                className={cn(
                  index % 2 === 0
                    ? 'bg-table-row-even'
                    : 'bg-table-row-odd',
                  onRowClick &&
                    'cursor-pointer transition-colors hover:bg-table-row-hover'
                )}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'border-b border-table-border/50 text-sm',
                      cellPx,
                      col.align === 'right' &&
                        'text-right tabular-nums',
                      col.align === 'center' && 'text-center',
                      col.hideBelow === 'sm' && 'hidden sm:table-cell',
                      col.hideBelow === 'md' && 'hidden md:table-cell',
                      col.hideBelow === 'lg' && 'hidden lg:table-cell'
                    )}
                  >
                    {col.render(item, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
