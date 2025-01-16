import * as d3 from 'd3';

interface Slice {
    label: string;
    value: number;
    color: string;
  }

interface PieChartProps{
    size: number;
    data: number;
}

export default function SideBarPie({ size, data }: PieChartProps) {
  const budget = [
    // min payment+extra
    { label: 'loan', value: 341 + data.valueOf(), color: '#ff6f61' },
    // average for single person
    { label: 'housing', value: 2400, color: '#69b578' },
    { label: 'essentials', value: 1400, color: '#ffbf00' },
    { label: 'other', value: 859 - data.valueOf(), color: '#9c88d2' },
  ];

  const pieGenerator = d3.pie<Slice>().value((d) => d.value);
  const arcGenerator = d3.arc<d3.PieArcDatum<Slice>>()
    .innerRadius(0) // Full pie, no donut hole
    .outerRadius(size / 4); // Set radius based on size prop

  // Generate the arcs with D3 pie data
  const arcs = pieGenerator(budget);

  return (
    <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
      <g id="sidebarpie" transform={`translate(${size / 4}, ${size / 4})`}>
        {arcs.map((arc, index) => (
          <path
            key={index}
            d={arcGenerator(arc) || undefined}
            fill={budget[index].color}
          >
            <title>{`${arc.data.label}: ${((arc.data.value / d3.sum(budget, (d) => d.value)) * 100).toFixed(1)}%`}</title>
          </path>
        ))}
        {arcs.map((arc, index) => {
          const [x, y] = arcGenerator.centroid(arc);
          return (
            <text
              key={index}
              dominantBaseline="central"
              textAnchor="middle"
              style={{ fontSize: '.75em' }}
              transform={`translate(${x},${y - 8})`}
            >
              {`$${arc.data.value}`}
            </text>
          );
        })}

      </g>
      <g transform={`translate(${(2.35 * size) / 4}, ${size / 10})`}>

        <circle cy={0} r={10} fill="#ffbf00" />
        <text x={13} y={0}>Essentials</text>
        <circle cy={20} r={10} fill="#ff6f61" />
        <text x={13} y={20}>Loan</text>
        <circle cy={40} r={10} fill="#69b578" />
        <text x={13} y={40}>Housing</text>
        <circle cy={60} r={10} fill="#9c88d2" />
        <text x={13} y={60}>Other</text>
      </g>
    </svg>
  );
}
