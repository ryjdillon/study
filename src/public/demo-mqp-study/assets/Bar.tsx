import {
  Loader, Stack, Paper, Title,
} from '@mantine/core';
import {
  useEffect, useState,
} from 'react';
import * as d3 from 'd3';

export interface ChartParams {
  dataset: string;
  x: string;
  y: string;
  ids: string;
}

interface DataRow {
  [key: string]: string | number; // Define the keys according to your CSV structure
}

const colorMapping: { [key: string]: string } = {
  Public: '#1f77b4',
  Private: '#ff7f0e',
  Foreign: '#2ca02c',
  Other: '#d62728',
  Proprietary: '#9467bd',
};

export function Bar({ parameters }: { parameters: ChartParams }) {
  const [data, setData] = useState<DataRow[] | null>(null);
  const [_dataname] = useState<string>(parameters.dataset); // Prefixed with _ to avoid unused variable error
  const [svgRef, setSvgRef] = useState<SVGSVGElement | null>(null);

  // Load CSV data
  useEffect(() => {
    d3.csv(`./data/${_dataname}.csv`)
      .then((loadedData: DataRow[]) => { // Renamed to avoid shadowing
        if (loadedData.length === 0) {
          console.warn('Empty data received for', _dataname);
          return;
        }
        setData(loadedData);
      });
  }, [_dataname]);

  useEffect(() => {
    if (data) {
      const svg = d3.select(svgRef);

      // Clear previous chart content
      svg.selectAll('*').remove();

      const margin = {
        top: 20, right: 30, bottom: 60, left: 60,
      };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const chart = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const xScale = d3.scaleBand()
        .domain(data.map((d) => d[parameters.y] as string)) // Cast to string
        .range([0, width])
        .padding(0.1);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => +d[parameters.x]) || 0])
        .nice()
        .range([height, 0]);

      chart.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickSize(5));

      chart.append('g')
        .call(d3.axisLeft(yScale));

      chart.append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -(height / 2))
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text(`${parameters.x} (Billion USD)`);

      // Bars with specified colors
      chart.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d[parameters.y] as string) || 0) // Cast to string
        .attr('y', (d) => yScale(+d[parameters.x]))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => height - yScale(+d[parameters.x]))
        .attr('fill', (d) => colorMapping[d[parameters.y] as string] || '#ccc'); // Cast to string
    }
  }, [data, svgRef, parameters]);

  return (
    <Stack>
      <Paper shadow="md" radius="md" p="md" withBorder>
        <Title order={3} align="center">Debt by School Type</Title>
        <svg ref={setSvgRef} width={800} height={400} />
      </Paper>
      {data === null && <Loader />}
    </Stack>
  );
}

export default Bar;
