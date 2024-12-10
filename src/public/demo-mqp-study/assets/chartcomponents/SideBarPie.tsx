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
    { label: 'loan', value: 500, color: '#ff6f61' },
    { label: 'housing', value: 2200, color: '#69b578' },
    { label: 'Transport', value: 500, color: '#58A0D7' },
    { label: 'essentials', value: 1050, color: '#ffbf00' },
    { label: 'other', value: 750, color: '#9c88d2' },
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
              style={{ fontSize: '.75em' }}
              transform={`translate(${x - 15},${y - 5})`}
            >
              {' '}
              {`$${arc.data.value}`}
            </text>
          );
        })}

      </g>
      <g transform={`translate(${(2.35 * size) / 4}, ${size / 9})`}>

        <circle r={10} fill="#ff6f61" />
        <text x={13} y={3}>Loan</text>
        <circle cy={25} r={10} fill="#69b578" />
        <text x={13} y={28}>Housing</text>
        <circle cy={50} r={10} fill="#58A0D7" />
        <text x={13} y={55}>Transport</text>
        <circle cy={75} r={10} fill="#ffbf00" />
        <text x={13} y={80}>Essentials</text>
        <circle cy={100} r={10} fill="#9c88d2" />
        <text x={13} y={105}>Other</text>
      </g>
    </svg>
  );
}
