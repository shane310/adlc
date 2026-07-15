import { clsx } from '@/lib/clsx';

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

const TONE: Record<Required<MetricCardProps>['tone'], string> = {
  default: 'border-slate-200',
  success: 'border-emerald-300',
  warning: 'border-amber-300 bg-amber-50',
  danger: 'border-rose-300 bg-rose-50',
};

export function MetricCard({ label, value, hint, tone = 'default' }: MetricCardProps) {
  return (
    <div className={clsx('card p-4', TONE[tone])} data-testid={`metric-${label}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}
