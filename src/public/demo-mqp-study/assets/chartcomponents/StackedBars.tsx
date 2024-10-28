import React from 'react';

interface StackedBarsProps {
  data: { totalPaid: number; remainingBalance: number }[]; // Each data item includes total paid and remaining balance
  barWidth: number;
  totalHeight: number;
  colors: string[];
}

function StackedBars({
  data, barWidth, totalHeight, colors,
}: StackedBarsProps): React.FC | null {
  if (data.length === 0) return null;

  const { totalPaid, remainingBalance } = data[0];
  const totalAmount = totalPaid + remainingBalance;

  const paidHeight = (totalPaid / totalAmount) * totalHeight;
  const remainingHeight = (remainingBalance / totalAmount) * totalHeight;

  // Format as dollar amounts
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

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
        fontSize="14"
        fontWeight="bold"
      >
        {formatCurrency(totalPaid)}
      </text>

      {/* Remaining Balance Bar */}
      <rect
        x={0}
        y={totalHeight - paidHeight - remainingHeight}
        width={barWidth}
        height={remainingHeight}
        fill={colors[1]}
      />
      <text
        x={barWidth / 2}
        y={totalHeight - paidHeight - remainingHeight / 2}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="14"
        fontWeight="bold"
      >
        {formatCurrency(remainingBalance)}
      </text>
    </g>
  );
}

export default StackedBars;
