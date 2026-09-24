import { cn } from '@/lib/utils'

function Progress({ value, className }: { value: number; className?: string }) {
  const boundedValue = Math.max(0, Math.min(100, value))
  return <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={boundedValue} className={cn('h-2 overflow-hidden rounded-full bg-[#e6f0e8]', className)}><div className="h-full rounded-full bg-[#193b5a] transition-all" style={{ width: `${boundedValue}%` }} /></div>
}

export { Progress }
