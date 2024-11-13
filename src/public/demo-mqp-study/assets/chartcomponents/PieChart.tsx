import React from 'react';

interface PieChartProps {
  data: { totalPaid: number; remainingBalance: number }[];
  radius: number;
  colors: string[];
}

function PieChart({ data, radius, colors }: PieChartProps): React.ReactElement | null {
  if (data.length === 0) return null;

  const { totalPaid = 0, remainingBalance = 0 } = data[0] || {};
  const totalAmount = totalPaid + remainingBalance;

  // Calculate percentages
  const paidPercentage = totalAmount ? (totalPaid / totalAmount) : 0;

  // Check for invalid percentage
  if (paidPercentage > 1) {
    return (
      <div style={{
        textAlign: 'center', color: 'red', fontSize: '18px', marginTop: '20px',
      }}
      >
        Please enter a valid number
      </div>
    );
  }

  const paidEndAngle = paidPercentage * 360;

  const getCoordinatesForAngle = (angle: number) => {
    const adjustedAngle = angle - 90;
    const radians = (adjustedAngle * Math.PI) / 180;
    return {
      x: radius * Math.cos(radians),
      y: radius * Math.sin(radians),
    };
  };

  return (
    <svg width={radius * 2 + 100} height={radius * 2 + 100} style={{ border: '1px solid #ddd' }}>
      <g transform={`translate(${radius + 50}, ${radius + 50})`}>
        {/* Paid Segment */}
        <path
          d={`M 0 0 
                        L ${getCoordinatesForAngle(0).x} ${getCoordinatesForAngle(0).y} 
                        A ${radius} ${radius} 0 ${paidEndAngle > 180 ? 1 : 0} 1 
                        ${getCoordinatesForAngle(paidEndAngle).x} ${getCoordinatesForAngle(paidEndAngle).y} 
                        Z`}
          fill={colors[0]}
        />

        {/* Remaining Balance Segment */}
        <path
          d={`M 0 0 
                        L ${getCoordinatesForAngle(paidEndAngle).x} ${getCoordinatesForAngle(paidEndAngle).y} 
                        A ${radius} ${radius} 0 ${360 - paidEndAngle > 180 ? 1 : 0} 1 
                        ${getCoordinatesForAngle(360).x} ${getCoordinatesForAngle(360).y} 
                        Z`}
          fill={colors[1]}
        />

        {/* Labels */}
        <text
          x={getCoordinatesForAngle(paidEndAngle / 1.4).x * 0.6}
          y={getCoordinatesForAngle(paidEndAngle / 1.4).y * 0.6}
          fill="white"
          fontSize="16"
          textAnchor="middle"
        >
          {`${(paidPercentage * 100).toFixed(1)}%`}
        </text>
      </g>
    </svg>
  );
}

export default PieChart;
