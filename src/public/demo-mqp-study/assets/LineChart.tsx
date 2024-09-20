import { useMemo } from 'react';
import * as d3 from 'd3';
import { Center, Text } from '@mantine/core';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
import { ChartParams } from './ChartParam';
import { OwidDistinctLinesPalette } from './Color';

const margin = {
  top: 30,
  left: 100,
  right: 110,
  bottom: 80,
};

interface DataPoint {
  [key: string]: number | string; // Specify keys as needed
}

export function LineChart({
  parameters,
  data,
  dataname,
  items,
  selection,
  range,
  guardrail,
}: {
  parameters: ChartParams;
  data: DataPoint[];
  dataname: string;
  items: { name: string; group: string }[]; // Specify item structure
  selection: string[] | null; // Specify selection type
  range: [Date, Date] | null;
  guardrail: string;
}) {
  const controlsSelection = useMemo(() => {
    const selectedGroups = items
      .filter((val) => selection?.includes(val.name))
      .map((val) => val.group);

    return items
      .filter((val) => selectedGroups.includes(val.group) && !selection?.includes(val.name))
      .map((val) => val.name);
  }, [selection, items]);

  const calculatedAvgData = useMemo(() => {
    const selectedGroups = items.map((val) => val.group);
    const controlsData = data.filter((val) => selectedGroups.includes(String(val[parameters.group_var])));

    const avgData = d3.rollup(
      controlsData,
      (v) => ({
        mean: d3.mean(v, (d) => +d[parameters.y_var]),
        upperq: d3.quantile(v, 0.75, (d) => +d[parameters.y_var]),
        lowerq: d3.quantile(v, 0.25, (d) => +d[parameters.y_var]),
      }),
      (d) => d[parameters.x_var],
    );

    return Array.from(avgData, ([date, values]) => ({
      date,
      mean: values.mean,
      upperq: values.upperq,
      lowerq: values.lowerq,
    }));
  }, [data, parameters, items]);

  const width = dataname === 'clean_data' ? 800 - margin.left - margin.right - 60 : 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const { yMin, yMax } = useMemo(() => {
    let relevantSelection: string[] = [];
    switch (guardrail) {
      case 'super_data':
        relevantSelection = selection?.concat(controlsSelection) ?? [];
        break;
      default:
        relevantSelection = selection ?? [];
        break;
    }

    const yData = data
      .filter((val) => relevantSelection.includes(String(val[parameters.cat_var])))
      .map((d) => +d[parameters.y_var])
      .filter((val) => val !== null);

    const [yMinSel, yMaxSel] = d3.extent(yData) as [number, number];
    const lowerq = d3.min(calculatedAvgData, (val) => val.lowerq) ?? yMinSel;
    const upperq = d3.max(calculatedAvgData, (val) => val.upperq) ?? yMaxSel;

    return {
      yMin: guardrail === 'super_summ' ? Math.min(yMinSel, lowerq) : yMinSel,
      yMax: guardrail === 'super_summ' ? Math.max(yMaxSel, upperq) : yMaxSel,
    };
  }, [data, selection, guardrail, calculatedAvgData, controlsSelection, parameters]);

  const xScale = useMemo(() => {
    if (range) {
      return d3.scaleTime()
        .range([margin.left, width + margin.left])
        .domain(range);
    }
    return d3.scaleTime()
      .range([margin.left, width + margin.left])
      .domain([new Date(parameters.start_date), new Date(parameters.end_date)]);
  }, [width, range, parameters]);

  const yScale = useMemo(() => d3.scaleLinear()
    .range([height + margin.top, margin.top])
    .domain([yMin, yMax])
    .nice(), [height, yMax, yMin]);

  const colorScale = useMemo(() => {
    const categories = Array.from(new Set(data.map((d) => String(d[parameters.cat_var]))));
    return d3.scaleOrdinal(OwidDistinctLinesPalette).domain(categories);
  }, [data, parameters]);

  const linePaths = useMemo(() => {
    if (!xScale || !yScale) {
      return [];
    }

    const lineGenerator = d3.line<DataPoint>()
      .x((d) => xScale(d3.timeParse('%Y-%m-%d')(String(d[parameters.x_var]))!))
      .y((d) => yScale(+d[parameters.y_var]))
      .curve(d3.curveBasis);

    return selection?.map((schoolType) => ({
      schoolType,
      path: lineGenerator(data.filter((val) => val[parameters.cat_var] === schoolType))!,
    }));
  }, [data, xScale, yScale, selection, parameters]);

  const xTicks = useMemo(() => xScale.ticks(6).map((value) => ({
    value: d3.utcFormat('%b %e, %Y')(value), // Format date to string
    offset: xScale(value),
  })), [xScale]);

  return (
    selection?.length === 0 ? (
      <Center style={{ width: '800px', height: '400px' }}>
        <Text fs="italic" c="dimmed">Select an item to view the chart.</Text>
      </Center>
    ) : (
      <svg style={{ height: '400px', width: '800px' }}>
        <g id="axes">
          <XAxis
            isDate
            xScale={xScale}
            yRange={yScale.range() as [number, number]}
            vertPosition={height + margin.top}
            ticks={xTicks}
          />
          <YAxis
            label="Debt In Billion USD"
            yScale={yScale}
            horizontalPosition={margin.left}
            xRange={xScale.range()}
          />
        </g>
        {linePaths?.map((x) => (
          <g key={`${x.schoolType}_g`}>
            <path
              id={`${x.schoolType}`}
              fill="none"
              stroke={colorScale(x.schoolType)}
              strokeWidth={2}
              d={x.path}
            />
          </g>
        ))}
        <g transform={`translate(${width + margin.left + 20}, ${margin.top})`}>
          {Array.from(new Set(data.map((d) => d[parameters.cat_var]))).map((category, index) => (
            <g key={category} transform={`translate(0, ${index * 20})`}>
              <rect width={15} height={15} fill={colorScale(String(category))} />
              <text x={20} y={15} style={{ fontSize: '12px', fill: 'black' }}>
                {category}
              </text>
            </g>
          ))}
        </g>
      </svg>
    )
  );
}

export default LineChart;
