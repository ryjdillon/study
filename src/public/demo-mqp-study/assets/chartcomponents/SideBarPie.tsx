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
    { label: 'housing', value: 2000, color: '#69b578' },
    { label: 'Transport', value: 800, color: '#58A0D7' },
    // energy,water,internet,gas,phone,cable/streaming
    { label: 'utilities', value: 400, color: '#ffbf00' },
    { label: 'essentials', value: 600, color: '#52D3D1' },
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
              style={{ fontSize: '.75em' }}
              textAnchor="middle"
              dominantBaseline="central"
              transform={`translate(${x},${y - 8})`}
            >
              {`$${arc.data.value}`}
            </text>
          );
        })}

      </g>
      <g transform={`translate(${(2.35 * size) / 4}, ${size / 10})`}>

        <circle cy={-5} r={10} fill="#52D3D1" />
        <text x={13} y={0}>Essentials</text>
        <circle cy={15} r={10} fill="#ff6f61" />
        <text x={13} y={20}>Loan</text>
        <circle cy={35} r={10} fill="#69b578" />
        <text x={13} y={40}>Housing</text>
        <circle cy={55} r={10} fill="#58A0D7" />
        <text x={13} y={60}>Transport</text>
        <circle cy={75} r={10} fill="#ffbf00" />
        <text x={13} y={80}>Utilities</text>
        <circle cy={95} r={10} fill="#9c88d2" />
        <text x={13} y={100}>Other</text>
      </g>
    </svg>
  );
}
