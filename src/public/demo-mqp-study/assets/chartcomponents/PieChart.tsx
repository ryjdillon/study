import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface PieChartProps {
  data: { totalPaid: number; remainingBalance: number }[];
  radius: number;
  colors: string[];
  year: number;
}

function PieChart({
  data, radius, colors, year,
}: PieChartProps): React.ReactElement | null {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (data.length === 0) return;

    const { totalPaid = 0, remainingBalance = 0 } = data[0] || {};
    const totalAmount = totalPaid + remainingBalance;

    const pieData = [
      { value: totalPaid, color: colors[0], label: 'Paid' },
      { value: remainingBalance, color: colors[1], label: 'Remaining' },
    ];

    const pie = d3.pie<{ value: number; color: string; label: string }>()
      .sort(null) // disable sorting by value to prevent flipping the order
      .value((d) => d.value);

    const arc = d3.arc<d3.PieArcDatum<{ value: number; color: string; label: string }>>()
      .innerRadius(radius / 2)
      .outerRadius(radius);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const chartGroup = svg.append('g')
      .attr('transform', `translate(${radius + 50}, ${radius + 50})`);

    const arcs = chartGroup.selectAll('arc')
      .data(pie(pieData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color);

    arcs.append('text')
      .attr('transform', (d) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('fill', 'white')
      .style('font-size', '12px')
      .text((d) => (d.data.label === 'Paid' ? `${((d.data.value / totalAmount) * 100).toFixed(1)}%` : ''));

    chartGroup.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .text(`${year}`);
  }, [data, radius, colors, year]);

  return <svg ref={svgRef} width={radius * 2 + 100} height={radius * 2 + 100} />;
}

export default PieChart;
