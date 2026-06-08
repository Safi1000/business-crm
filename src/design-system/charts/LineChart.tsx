import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { chartSeries } from '../tokens/colors';
import { ChartTooltip } from './ChartTooltip';
import { useReducedMotion } from '../motion/useReducedMotion';

export interface LineSeries {
  key: string;
  name: string;
  color?: string;
}

interface LineChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  series: LineSeries[];
  height?: number;
  valueFormatter?: (v: number) => string;
  showLegend?: boolean;
  area?: boolean;
}

const axisStyle = { fontSize: 11, fill: 'rgb(var(--text-tertiary))' };

export function LineChart({
  data,
  xKey,
  series,
  height = 280,
  valueFormatter,
  showLegend = true,
}: LineChartProps) {
  const reduced = useReducedMotion();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="rgb(var(--border-base))" strokeDasharray="3 3" />
        <XAxis dataKey={xKey} tick={axisStyle} tickLine={false} axisLine={false} dy={6} />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v) => (valueFormatter ? valueFormatter(Number(v)) : String(v))}
        />
        <Tooltip content={<ChartTooltip formatter={valueFormatter} />} />
        {showLegend && series.length > 1 && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8, color: 'rgb(var(--text-secondary))' }}
          />
        )}
        {series.map((s, i) => {
          const color = s.color ?? chartSeries[i % chartSeries.length];
          return (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'rgb(var(--bg-surface))' }}
              isAnimationActive={!reduced}
              animationDuration={800}
              animationEasing="ease-out"
            />
          );
        })}
      </ReLineChart>
    </ResponsiveContainer>
  );
}
