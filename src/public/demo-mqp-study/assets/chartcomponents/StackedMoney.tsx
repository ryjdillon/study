import React from 'react';

interface StackedBarsProps {
  data: { totalPaid: number; remainingBalance: number }[];
  barWidth: number;
  totalHeight: number;
}

function StackedMoney({
  data, barWidth, totalHeight,
}: StackedBarsProps): React.ReactElement | null {
  const { totalPaid = 0, remainingBalance = 0 } = data[0] || {};
  const totalAmount = totalPaid + remainingBalance;

  // const paidHeight = totalAmount ? (totalPaid / totalAmount) * totalHeight : 0;
  const remainingHeight = totalAmount ? (remainingBalance / totalAmount) * totalHeight : 0;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (data.length === 0) return null;

  return (
    <svg width={barWidth} height={totalHeight + 40} style={{ border: '1px solid #ddd' }}>
      <defs>
        <pattern id="image-fill" patternUnits="userSpaceOnUse" width={barWidth} height={totalHeight}>
          <image href="/images/moneystack.png" x="0" y="0" width={barWidth} height={totalHeight} />
        </pattern>
        <clipPath id="clip-path">
          <rect x="0" y={totalHeight - remainingHeight} width={barWidth} height={remainingHeight} />
        </clipPath>
      </defs>

      <g>
        {/* Remaining Balance Bar */}
        <rect
          x="0"
          y="0"
          width={barWidth}
          height={totalHeight}
          fill="url(#image-fill)"
          clipPath="url(#clip-path)"
          style={{ transition: 'clip-path 0.3s ease' }}
        />
        <text
          x={barWidth / 2}
          y={totalHeight - remainingHeight - 20}
          textAnchor="middle"
          fill="#000000"
          fontSize="18"
        >
          <tspan x={barWidth / 2} dy="-0.5em">You owe</tspan>
          <tspan x={barWidth / 2} dy="1.2em">{formatCurrency(remainingBalance)}</tspan>
        </text>
      </g>
    </svg>
  );
}

export default StackedMoney;
