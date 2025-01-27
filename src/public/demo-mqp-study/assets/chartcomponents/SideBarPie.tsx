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
    { label: 'loan', value: data.valueOf(), color: '#06945D' },
    // average for single person

    { label: 'other', value: 5000 - data.valueOf(), color: '#0077a9' },
  ];

  const pieGenerator = d3.pie<Slice>().value((d) => d.value).sort(null);
  const arcGenerator = d3.arc<d3.PieArcDatum<Slice>>()
    .innerRadius(0) // Full pie, no donut hole
    .outerRadius(size / 4); // Set radius based on size prop

  // Generate the arcs with D3 pie data
  const arcs = pieGenerator(budget);

  return (
    <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
      <g transform={`translate(${size / 8}, 0)`}>
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
                alignmentBaseline="middle"
                textAnchor="middle"
                style={{ fontSize: '.75em' }}
                fill="white"
                transform={`translate(${x + 3},${y - 10})`}
              >
                {arc.data.label === 'loan'
                  ? `${Math.round((arc.data.value / 5000) * 100)}%`
                  : ''}

              </text>
            );
          })}

        </g>
        <g id="legend" transform={`translate(${(2.5 * size) / 4}, ${size / 8})`}>
          <circle cy={0} r={10} fill="#06945D" />
          <text x={15} y={4}>Loan</text>
          <circle cy={30} r={10} fill="#0077a9" />
          <text x={15} y={34}>Other</text>

        </g>
      </g>
    </svg>
  );
}
