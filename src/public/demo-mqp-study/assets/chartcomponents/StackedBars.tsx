import React from 'react';

interface StackedBarsProps {
  data: { totalPaid: number; remainingBalance: number }[]; // Each data item includes total paid and remaining balance
  barWidth: number; // Width of the bar
  totalHeight: number; // Total height for the stacked bars
  colors: string[]; // Colors for each layer
}

function StackedBars({
  data, barWidth, totalHeight, colors,
}: StackedBarsProps): React.FC {
  if (data.length === 0) return null;

  const { totalPaid, remainingBalance } = data[0];
  const totalAmount = totalPaid + remainingBalance;

  const paidHeight = (totalPaid / totalAmount) * totalHeight;
  const remainingHeight = (remainingBalance / totalAmount) * totalHeight;

  return (
    <g>
      {/* Total Paid Bar */}
      <rect
        x={0}
        y={totalHeight - paidHeight}
        width={barWidth}
        height={paidHeight}
        fill={colors[0]} // Color for the total paid
      />
      <text
        x={barWidth / 2}
        y={totalHeight - paidHeight / 2}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="10"
      >
        {totalPaid.toFixed(2)}
      </text>

      {/* Remaining Balance Bar */}
      <rect
        x={0}
        y={totalHeight - paidHeight - remainingHeight}
        width={barWidth}
        height={remainingHeight}
        fill={colors[1]} // Color for the remaining balance
      />
      <text
        x={barWidth / 2}
        y={totalHeight - paidHeight - remainingHeight / 2}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="10"
      >
        {remainingBalance.toFixed(2)}
      </text>
    </g>
  );
}

export default StackedBars;
