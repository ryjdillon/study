import { RangeSlider, Box, Text } from '@mantine/core';
import * as d3 from 'd3';
import { ChartParams } from './ChartParam';

export function RangeSelector({
  parameters,
  setRange,
  trackRange,
}: {
  parameters: ChartParams;
  setRange: (value: [Date, Date]) => void;
  trackRange: (value: [Date, Date]) => void;
}) {
  const dateScale = d3.scaleTime()
    .domain([new Date(parameters.start_date), new Date(parameters.end_date)])
    .range([0, 100]);

  function numToRange(v: number) {
    return dateScale.invert(v);
  }

  function numToRangeLabel(v: number) {
    const date = numToRange(v);
    return d3.utcFormat('%b %e, %Y')(date);
  }

  const sliderStyle = {
    marginTop: '20px',
    marginBottom: '20px',
  };

  const labelStyle = {
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#4a5568',
  };

  const boxStyle = {
    paddingLeft: '30px',
  };

  return (
    <Box style={boxStyle}>
      <Text style={[labelStyle, { marginBottom: 30 }]}>
        Select Date Range:
      </Text>
      <RangeSlider
        style={sliderStyle}
        defaultValue={[0, 100]}
        label={(value) => numToRangeLabel(value)}
        labelAlwaysOn
        step={1}
        min={0}
        max={100}
        disabled={!parameters.allow_time_slider}
        onChange={([min, max]) => {
          const range: [Date, Date] = [numToRange(min), numToRange(max)];
          setRange(range);
          trackRange(range);
        }}
        thumbSize={16}
        thumbToLabel="Date Range"
        marks={[
          { value: 0, label: numToRangeLabel(0) },
          { value: 100, label: numToRangeLabel(100) },
        ]}
      />
    </Box>
  );
}

export default RangeSelector;
