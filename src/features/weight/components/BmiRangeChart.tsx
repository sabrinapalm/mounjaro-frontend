import { Bar, BarChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card } from '../../../shared/components/ui/card';
import type { WeightEntry } from '../../../shared/types';
import { getTimestamp } from '../../../shared/utils/dateHelpers';
import { useProfile } from '../../profile/ProfileContext';
import './BmiRangeChart.css';

type BmiCategoryKey =
  | 'underweight'
  | 'healthy'
  | 'overweight'
  | 'obesityClass1'
  | 'obesityClass2'
  | 'obesityClass3';

type BmiRange = {
  key: BmiCategoryKey;
  label: string;
  shortLabel: string;
  min: number;
  max: number | null;
};

type BmiChartData = Record<BmiCategoryKey, number> & {
  name: string;
};

interface BmiRangeChartProps {
  weights: WeightEntry[];
}

const DEFAULT_CHART_MAX = 45;

const BMI_RANGES: BmiRange[] = [
  {
    key: 'underweight',
    label: 'Underweight',
    shortLabel: 'Under',
    min: 0,
    max: 18.5,
  },
  {
    key: 'healthy',
    label: 'Healthy weight',
    shortLabel: 'Healthy',
    min: 18.5,
    max: 25,
  },
  {
    key: 'overweight',
    label: 'Overweight',
    shortLabel: 'Over',
    min: 25,
    max: 30,
  },
  {
    key: 'obesityClass1',
    label: 'Obesity class 1',
    shortLabel: 'Class 1',
    min: 30,
    max: 35,
  },
  {
    key: 'obesityClass2',
    label: 'Obesity class 2',
    shortLabel: 'Class 2',
    min: 35,
    max: 40,
  },
  {
    key: 'obesityClass3',
    label: 'Obesity class 3',
    shortLabel: 'Class 3',
    min: 40,
    max: null,
  },
];

const createEmptyChartData = (): BmiChartData => ({
  name: 'BMI',
  underweight: 0,
  healthy: 0,
  overweight: 0,
  obesityClass1: 0,
  obesityClass2: 0,
  obesityClass3: 0,
});

const calculateBmi = (weightKg: number | null | undefined, heightCm: number | null | undefined) => {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }

  const heightMeters = heightCm / 100;

  return weightKg / heightMeters ** 2;
};

const getLatestWeight = (weights: WeightEntry[]) => {
  if (weights.length === 0) {
    return null;
  }

  return weights.reduce((latestWeight, weight) => {
    return getTimestamp(weight.dateTime) > getTimestamp(latestWeight.dateTime)
      ? weight
      : latestWeight;
  }, weights[0]);
};

const getBmiCategory = (bmi: number) => {
  return (
    BMI_RANGES.find((range) => {
      const isAboveMin = bmi >= range.min;
      const isBelowMax = range.max === null || bmi < range.max;

      return isAboveMin && isBelowMax;
    }) ?? BMI_RANGES[BMI_RANGES.length - 1]
  );
};

const getChartMax = (bmis: Array<number | null>) => {
  const validBmis = bmis.filter((bmi): bmi is number => bmi !== null && Number.isFinite(bmi));

  if (validBmis.length === 0) {
    return DEFAULT_CHART_MAX;
  }

  const highestBmi = Math.max(...validBmis);

  return Math.max(DEFAULT_CHART_MAX, Math.ceil(highestBmi / 5) * 5 + 5);
};

const getRangeWidth = (range: BmiRange, chartMax: number) => {
  const max = range.max ?? chartMax;
  const cappedMax = Math.min(max, chartMax);

  return Math.max(cappedMax - range.min, 0);
};

const createChartData = (chartMax: number) => {
  const data = createEmptyChartData();

  BMI_RANGES.forEach((range) => {
    data[range.key] = getRangeWidth(range, chartMax);
  });

  return [data];
};

const getBmiTicks = (chartMax: number) => {
  return [0, 18.5, 25, 30, 35, 40, chartMax].filter(
    (tick, index, ticks) => tick <= chartMax && ticks.indexOf(tick) === index
  );
};

const formatBmi = (bmi: number) => {
  return bmi.toFixed(1);
};

const formatRangeLabel = (range: BmiRange) => {
  if (range.max === null) {
    return `${range.min}+`;
  }

  if (range.min === 0) {
    return `< ${range.max}`;
  }

  return `${range.min}–${range.max}`;
};

const getBarRadius = (range: BmiRange): [number, number, number, number] | number => {
  if (range.key === 'underweight') {
    return [999, 0, 0, 999];
  }

  if (range.key === 'obesityClass3') {
    return [0, 999, 999, 0];
  }

  return 0;
};

export const BmiRangeChart = ({ weights }: BmiRangeChartProps) => {
  const { profile } = useProfile();

  const height = profile?.height ?? null;
  const goalWeight = profile?.goalWeight ?? null;
  const latestWeight = getLatestWeight(weights);

  const currentBmi = calculateBmi(latestWeight?.weight, height);
  const goalBmi = calculateBmi(goalWeight, height);

  const currentCategory = currentBmi !== null ? getBmiCategory(currentBmi) : null;
  const goalCategory = goalBmi !== null ? getBmiCategory(goalBmi) : null;

  const chartMax = getChartMax([currentBmi, goalBmi]);
  const chartData = createChartData(chartMax);
  const bmiTicks = getBmiTicks(chartMax);

  const hasMissingHeight = !height;
  const hasMissingWeights = weights.length === 0;

  return (
    <Card asChild appearance='custom'>
      <section className='bmi-range-card' aria-labelledby='bmi-range-chart-title'>
        <header className='bmi-range-card__header'>
          <div>
            <h2 id='bmi-range-chart-title' className='bmi-range-card__title'>
              BMI &amp; health metrics
            </h2>

            <p className='bmi-range-card__description'>
              Based on your latest measurement and height.
            </p>
          </div>

          {currentBmi !== null && currentCategory && (
            // biome-ignore lint/a11y/useAriaPropsSupportedByRole: cba
            <div
              className='bmi-range-card__summary'
              aria-label={`Current BMI ${formatBmi(currentBmi)}`}
            >
              <span className='bmi-range-card__bmi-value'>{formatBmi(currentBmi)}</span>
              <span className='bmi-range-card__bmi-label'>{currentCategory.label}</span>

              {goalBmi !== null && goalCategory && (
                <span className='bmi-range-card__goal-summary'>
                  Goal BMI {formatBmi(goalBmi)} · {goalCategory.label}
                </span>
              )}
            </div>
          )}
        </header>

        {hasMissingHeight && (
          <div className='bmi-range-card__empty'>
            Add your height in profile settings to calculate your BMI.
          </div>
        )}

        {!hasMissingHeight && hasMissingWeights && (
          <div className='bmi-range-card__empty'>Add a weight entry to see your BMI range.</div>
        )}

        {!hasMissingHeight && !hasMissingWeights && currentBmi !== null && currentCategory && (
          <>
            <div className='bmi-range-card__chart' aria-hidden='true'>
              <ResponsiveContainer width='100%' height={80}>
                <BarChart
                  data={chartData}
                  layout='vertical'
                  margin={{
                    top: 8,
                    right: 12,
                    bottom: 4,
                    left: 12,
                  }}
                >
                  <XAxis
                    type='number'
                    domain={[0, chartMax]}
                    ticks={bmiTicks}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 12,
                      fill: 'var(--color-text-muted)',
                    }}
                  />

                  <YAxis type='category' dataKey='name' hide />

                  {BMI_RANGES.map((range) => (
                    <Bar
                      key={range.key}
                      dataKey={range.key}
                      stackId='bmi'
                      fill={`var(--bmi-range-${range.key})`}
                      radius={getBarRadius(range)}
                      isAnimationActive={false}
                    />
                  ))}

                  {goalBmi !== null && (
                    <ReferenceLine
                      x={goalBmi}
                      stroke='var(--bmi-goal-marker-color)'
                      strokeWidth={2}
                      strokeDasharray='5 5'
                      ifOverflow='extendDomain'
                    />
                  )}

                  <ReferenceLine
                    x={currentBmi}
                    stroke='var(--bmi-marker-color)'
                    strokeWidth={2}
                    ifOverflow='extendDomain'
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className='bmi-range-card__markers'>
              <span className='bmi-range-card__marker-item'>
                <span className='bmi-range-card__marker-line bmi-range-card__marker-line--current' />
                Current BMI {formatBmi(currentBmi)}
              </span>

              {goalBmi !== null && (
                <span className='bmi-range-card__marker-item'>
                  <span className='bmi-range-card__marker-line bmi-range-card__marker-line--goal' />
                  Goal BMI {formatBmi(goalBmi)}
                </span>
              )}
            </div>

            <ul className='bmi-range-card__legend' aria-label='BMI ranges'>
              {BMI_RANGES.map((range) => (
                <li key={range.key} className='bmi-range-card__legend-item'>
                  <span
                    className={`bmi-range-card__legend-dot bmi-range-card__legend-dot--${range.key}`}
                    aria-hidden='true'
                  />

                  <span className='bmi-range-card__legend-text'>
                    <span className='bmi-range-card__legend-label'>{range.label}</span>
                    <span className='bmi-range-card__legend-range'>{formatRangeLabel(range)}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className='bmi-range-card__note'>
              BMI is a simple range indicator. It does not measure body composition, muscle mass,
              waist size, or individual health risk.
            </p>
          </>
        )}
      </section>
    </Card>
  );
};
