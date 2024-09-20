import { Center, Text, Tooltip } from '@mantine/core';
import { useMemo } from 'react';
import * as d3 from 'd3';

export function XAxis({
  xScale,
  yRange,
  vertPosition,
  ticks,
  isDate = false,
  showLines = true,
}: {
  showLines?: boolean;
  isDate?: boolean;
  xScale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>;
  yRange: [number, number];
  vertPosition: number;
  ticks: { value: string | Date; offset: number }[];
}) {
  const tickWidth = useMemo(() => {
    if (ticks.length > 1) {
      return Math.abs(ticks[1].offset - ticks[0].offset);
    }
    return xScale.range()[0] - xScale.range()[1];
  }, [ticks, xScale]);

  const format = (str: string | Date) => {
    const dateFormat = d3.utcFormat('%b %e, %Y');

    return isDate
      ? dateFormat(str as Date).toString() // Convert Date to string
      : d3.format('.2s')(parseFloat(String(str)));
  };

  return (
    <>
      {showLines && (
        <path
          transform={`translate(0, ${yRange[1]})`}
          d={['M', xScale.range()[0], 0, 'H', xScale.range()[1]].join(' ')}
          fill="none"
          stroke="lightgray"
        />
      )}
      {ticks.map(({ value, offset }) => (
        <g key={`${value}tick`} transform={`translate(${offset}, ${vertPosition})`}>
          <line y2="6" stroke="currentColor" />
          {showLines && <line y2={`${-(yRange[0] - yRange[1])}`} stroke="lightgray" />}

          <foreignObject x={0 - tickWidth / 2} y={10} width={tickWidth} height={20}>
            <Center>
              <Tooltip withinPortal label={String(value)}>
                <Text
                  px={2}
                  size="xs"
                  style={{
                    textAlign: 'center',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {format(isDate ? new Date(value) : value as string)}
                  {' '}
                  {/* Ensure correct type usage */}
                </Text>
              </Tooltip>
            </Center>
          </foreignObject>
        </g>
      ))}
    </>
  );
}

export default XAxis;
