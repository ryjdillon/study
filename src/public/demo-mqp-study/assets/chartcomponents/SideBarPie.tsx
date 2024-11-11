import * as d3 from 'd3';

interface Slice {
    label: string;
    value: number;
    color: string;
  }

interface PieChartProps{
    size: number;
}

export default function SideBarPie({ size }: PieChartProps) {
  const budget = [
    { label: 'housing', value: 40, color: '#ff6f61' },
    { label: 'food', value: 10, color: '#69b578' },
    { label: 'transportation', value: 15, color: '#58A0D7' },
    { label: 'savings', value: 15, color: '#ffbf00' },
    { label: 'other', value: 20, color: '#9c88d2' },
  ];
  const pieGenerator = d3.pie<Slice>().value((d) => d.value);
  const arcGenerator = d3.arc<d3.PieArcDatum<Slice>>()
    .innerRadius(0) // Full pie, no donut hole
    .outerRadius(size / 4); // Set radius based on size prop

  // Generate the arcs with D3 pie data
  const arcs = pieGenerator(budget);

  return (
    <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
      <g transform={`translate(${size / 4}, ${size / 4})`}>
        {arcs.map((arc, index) => (
          <path
            key={index}
            d={arcGenerator(arc) || undefined}
            fill={budget[index].color}
          >
            <title>{`${arc.data.label}: ${((arc.data.value / d3.sum(budget, (d) => d.value)) * 100).toFixed(1)}%`}</title>
          </path>
        ))}
      </g>
      <g transform={`translate(${(2.35 * size) / 4}, ${size / 9})`}>

        <circle r={10} fill="#ff6f61" />
        <text x={13} y={3}>Housing</text>
        <circle cy={25} r={10} fill="#69b578" />
        <text x={13} y={28}>Food</text>
        <circle cy={50} r={10} fill="#58A0D7" />
        <text x={13} y={55}>Car</text>
        <circle cy={75} r={10} fill="#ffbf00" />
        <text x={13} y={80}>Savings</text>
        <circle cy={100} r={10} fill="#9c88d2" />
        <text x={13} y={105}>Other</text>
      </g>
    </svg>
  );
}
