import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { chartSeries } from '../tokens/colors';
import { ChartTooltip } from './ChartTooltip';
import { useReducedMotion } from '../motion/useReducedMotion';

export interface DonutDatum {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutDatum[];
  height?: number;
  valueFormatter?: (v: number) => string;
  /** Big number rendered in the hole. */
  centerLabel?: string;
  centerSubLabel?: string;
}

export function DonutChart({
  data,
  height = 240,
  valueFormatter,
  centerLabel,
  centerSubLabel,
}: DonutChartProps) {
  const reduced = useReducedMotion();
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip formatter={valueFormatter} />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="92%"
            paddingAngle={2}
            stroke="rgb(var(--bg-surface))"
            strokeWidth={2}
            isAnimationActive={!reduced}
            animationDuration={700}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={d.color ?? chartSeries[i % chartSeries.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerSubLabel) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerLabel && <span className="nums text-xl font-semibold text-content">{centerLabel}</span>}
          {centerSubLabel && <span className="text-xs text-content-muted">{centerSubLabel}</span>}
        </div>
      )}
    </div>
  );
}
