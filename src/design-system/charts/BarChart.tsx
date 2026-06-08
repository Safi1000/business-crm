import {
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { chartSeries } from '../tokens/colors';
import { ChartTooltip } from './ChartTooltip';
import { useReducedMotion } from '../motion/useReducedMotion';

export interface BarSeries {
  key: string;
  name: string;
  color?: string;
}

interface BarChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  series: BarSeries[];
  height?: number;
  stacked?: boolean;
  valueFormatter?: (v: number) => string;
  /** Side-by-side grouped bars vs single. */
  showLegend?: boolean;
}

const axisStyle = { fontSize: 11, fill: 'rgb(var(--text-tertiary))' };

export function BarChart({
  data,
  xKey,
  series,
  height = 280,
  stacked,
  valueFormatter,
  showLegend = true,
}: BarChartProps) {
  const reduced = useReducedMotion();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={4}>
        <CartesianGrid vertical={false} stroke="rgb(var(--border-base))" strokeDasharray="3 3" />
        <XAxis dataKey={xKey} tick={axisStyle} tickLine={false} axisLine={false} dy={6} />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v) => (valueFormatter ? valueFormatter(Number(v)) : String(v))}
        />
        <Tooltip
          cursor={{ fill: 'rgb(var(--bg-sunken) / 0.6)' }}
          content={<ChartTooltip formatter={valueFormatter} />}
        />
        {showLegend && series.length > 1 && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8, color: 'rgb(var(--text-secondary))' }}
          />
        )}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            stackId={stacked ? 'stack' : undefined}
            fill={s.color ?? chartSeries[i % chartSeries.length]}
            radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
            maxBarSize={44}
            isAnimationActive={!reduced}
            animationDuration={700}
            animationEasing="ease-out"
          />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  );
}
