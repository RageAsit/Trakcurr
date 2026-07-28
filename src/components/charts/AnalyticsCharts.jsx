import { useMemo, memo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { FiPieChart, FiBarChart2, FiActivity, FiInbox } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Skeleton } from '../ui';
import { formatCurrency } from '../../utils/formatters';

/**
 * Standard Paper-Themed Tooltip for all Analytics Charts
 */
export const CustomChartTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-lg p-3 shadow-xl text-xs space-y-1.5 min-w-[160px] z-50 font-mono">
        <p className="font-bold text-stone-200 border-b border-stone-800 pb-1 mb-1">{label || payload[0]?.name}</p>
        {payload.map((entry, index) => {
          const val = entry.value;
          const formattedVal = formatter
            ? formatter(val, entry.name, entry)
            : Number(val) === 0
            ? '-'
            : formatCurrency(val);

          const rawColor = entry.color || entry.payload?.fill || '#38bdf8';
          const isDarkColor =
            !rawColor ||
            rawColor === '#1c1917' ||
            rawColor === '#000000' ||
            rawColor === '#000' ||
            rawColor === '#111111' ||
            rawColor === '#171717' ||
            rawColor === '#18181b' ||
            rawColor === '#0f172a';

          const textColor = isDarkColor ? '#38bdf8' : rawColor;

          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span style={{ color: textColor }} className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: textColor }} />
                {entry.name}:
              </span>
              <span className="font-bold text-white">{formattedVal}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

/**
 * Common Empty State for Charts
 */
export const ChartEmptyState = ({ message = 'No data available for the selected period.' }) => (
  <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center border border-dashed border-stone-300 rounded-xl bg-[#fbf9f4]">
    <div className="p-3 rounded-lg bg-stone-100 border border-stone-300 text-stone-600 mb-2.5">
      <FiInbox className="text-xl" />
    </div>
    <p className="text-xs font-bold font-mono uppercase tracking-wider text-stone-700 max-w-xs">{message}</p>
    <span className="text-[11px] text-stone-500 mt-0.5">Select a different timeframe or log transactions to update.</span>
  </div>
);

/**
 * Common Loading Skeleton State for Charts
 */
export const ChartLoadingSkeleton = ({ height = 280 }) => (
  <div className="space-y-3 w-full animate-pulse" style={{ height: `${height}px` }}>
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-4 w-32 bg-stone-200" />
      <Skeleton className="h-4 w-16 bg-stone-200" />
    </div>
    <div className="flex items-end justify-between gap-2 h-[80%] pt-4">
      {[40, 65, 30, 85, 55, 70, 45, 90, 60, 75, 50, 80].map((h, i) => (
        <div key={i} className="flex-1 bg-stone-200 rounded-t-sm" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);

/* ==================================================================== */
/* 1. REUSABLE LINE CHART COMPONENT (MEMOIZED) */
/* ==================================================================== */
export const AnalyticsLineChart = memo(function AnalyticsLineChart({
  data = [],
  series = [],
  xKey = 'month',
  title,
  description,
  badge,
  height = 300,
  isLoading = false,
  emptyMessage,
  showGrid = true,
  showLegend = true,
  valueFormatter,
}) {
  const hasData = useMemo(() => {
    if (!data || data.length === 0) return false;
    return data.some((item) =>
      series.some((s) => Number(item[s.key]) > 0 || Number(item[s.key]) < 0)
    );
  }, [data, series]);

  return (
    <Card>
      {(title || description || badge) && (
        <CardHeader variant="dark">
          <div>
            {title && (
              <CardTitle className="flex items-center gap-2">
                <FiActivity className="text-white text-base" />
                {title}
              </CardTitle>
            )}
            {description && <CardDescription dark>{description}</CardDescription>}
          </div>
          {badge && <Badge variant="muted">{badge}</Badge>}
        </CardHeader>
      )}

      <CardContent className="pt-6">
        {isLoading ? (
          <ChartLoadingSkeleton height={height} />
        ) : !hasData ? (
          <ChartEmptyState message={emptyMessage} />
        ) : (
          <div className="w-full" style={{ height: `${height}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e2d7" opacity={0.8} />}
                <XAxis dataKey={xKey} stroke="#78716c" fontSize={11} tickLine={false} fontFamily="monospace" />
                <YAxis stroke="#78716c" fontSize={11} tickLine={false} fontFamily="monospace" />
                <Tooltip content={<CustomChartTooltip formatter={valueFormatter} />} />
                {showLegend && <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '12px' }} />}
                {series.map((s) => (
                  <Line
                    key={s.key}
                    type={s.type || 'monotone'}
                    dataKey={s.key}
                    stroke={s.color || '#1c1917'}
                    strokeWidth={s.strokeWidth || 2.5}
                    dot={s.dot !== false ? { r: 3, fill: s.color || '#1c1917' } : false}
                    activeDot={{ r: 5 }}
                    name={s.name || s.key}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

/* ==================================================================== */
/* 2. REUSABLE BAR CHART COMPONENT (MEMOIZED) */
/* ==================================================================== */
export const AnalyticsBarChart = memo(function AnalyticsBarChart({
  data = [],
  series = [],
  xKey = 'month',
  title,
  description,
  badge,
  height = 300,
  isLoading = false,
  emptyMessage,
  showGrid = true,
  showLegend = true,
  valueFormatter,
}) {
  const hasData = useMemo(() => {
    if (!data || data.length === 0) return false;
    return data.some((item) =>
      series.some((s) => Number(item[s.key]) > 0 || Number(item[s.key]) < 0)
    );
  }, [data, series]);

  return (
    <Card>
      {(title || description || badge) && (
        <CardHeader variant="dark">
          <div>
            {title && (
              <CardTitle className="flex items-center gap-2">
                <FiBarChart2 className="text-white text-base" />
                {title}
              </CardTitle>
            )}
            {description && <CardDescription dark>{description}</CardDescription>}
          </div>
          {badge && <Badge variant="muted">{badge}</Badge>}
        </CardHeader>
      )}

      <CardContent className="pt-6">
        {isLoading ? (
          <ChartLoadingSkeleton height={height} />
        ) : !hasData ? (
          <ChartEmptyState message={emptyMessage} />
        ) : (
          <div className="w-full" style={{ height: `${height}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e2d7" opacity={0.8} />}
                <XAxis dataKey={xKey} stroke="#78716c" fontSize={11} tickLine={false} fontFamily="monospace" />
                <YAxis stroke="#78716c" fontSize={11} tickLine={false} fontFamily="monospace" />
                <Tooltip content={<CustomChartTooltip formatter={valueFormatter} />} />
                {showLegend && <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />}
                {series.map((s) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    fill={s.color || '#1c1917'}
                    radius={s.radius || [3, 3, 0, 0]}
                    name={s.name || s.key}
                    stackId={s.stackId}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

/* ==================================================================== */
/* 3. REUSABLE STACKED BAR CHART COMPONENT (MEMOIZED) */
/* ==================================================================== */
export const AnalyticsStackedBarChart = memo(function AnalyticsStackedBarChart({
  data = [],
  series = [],
  xKey = 'month',
  title,
  description,
  badge,
  height = 300,
  isLoading = false,
  emptyMessage,
  showGrid = true,
  showLegend = true,
  valueFormatter,
}) {
  const stackedSeries = useMemo(() => {
    return series.map((s) => ({
      ...s,
      stackId: s.stackId || 'stack1',
    }));
  }, [series]);

  return (
    <AnalyticsBarChart
      data={data}
      series={stackedSeries}
      xKey={xKey}
      title={title}
      description={description}
      badge={badge || 'Stacked'}
      height={height}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      showGrid={showGrid}
      showLegend={showLegend}
      valueFormatter={valueFormatter}
    />
  );
});

/* ==================================================================== */
/* 4. REUSABLE DONUT / PIE CHART COMPONENT (MEMOIZED) */
/* ==================================================================== */
export const AnalyticsDonutChart = memo(function AnalyticsDonutChart({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  colorKey = 'fill',
  title,
  description,
  badge,
  height = 280,
  isLoading = false,
  emptyMessage,
  innerRadius = 55,
  outerRadius = 85,
  valueFormatter,
  showLegendList = true,
}) {
  const validData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter((item) => Number(item[valueKey]) > 0);
  }, [data, valueKey]);

  const hasData = validData.length > 0;

  return (
    <Card>
      {(title || description || badge) && (
        <CardHeader variant="dark">
          <div>
            {title && (
              <CardTitle className="flex items-center gap-2">
                <FiPieChart className="text-white text-base" />
                {title}
              </CardTitle>
            )}
            {description && <CardDescription dark>{description}</CardDescription>}
          </div>
          {badge && <Badge variant="muted">{badge}</Badge>}
        </CardHeader>
      )}

      <CardContent className="pt-6">
        {isLoading ? (
          <ChartLoadingSkeleton height={height} />
        ) : !hasData ? (
          <ChartEmptyState message={emptyMessage} />
        ) : (
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4" style={{ height: `${height}px` }}>
            <div className="h-full w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={validData}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    paddingAngle={3}
                    dataKey={valueKey}
                    nameKey={nameKey}
                  >
                    {validData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry[colorKey] || entry.fill || '#1c1917'} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip formatter={valueFormatter} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {showLegendList && (
              <div className="w-full sm:w-1/2 space-y-2 pr-2 overflow-y-auto max-h-full font-mono text-xs">
                {validData.map((item) => {
                  const color = item[colorKey] || item.fill || '#1c1917';
                  const val = item[valueKey];
                  const formattedVal = valueFormatter
                    ? valueFormatter(val, item[nameKey], item)
                    : Number(val) === 0
                    ? '-'
                    : formatCurrency(val);

                  return (
                    <div key={item[nameKey]} className="flex items-center justify-between text-xs py-0.5 border-b border-stone-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-xs inline-block shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-stone-700 font-semibold truncate">{item[nameKey]}</span>
                      </div>
                      <span className="font-bold text-stone-900 shrink-0 ml-2">{formattedVal}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
