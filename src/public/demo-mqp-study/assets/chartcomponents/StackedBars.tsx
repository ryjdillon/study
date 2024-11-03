import React, { useState } from 'react';

interface StackedBarsProps {
  data: { totalPaid: number; remainingBalance: number }[];
  barWidth: number;
  totalHeight: number;
  colors: string[];
}

function StackedBars({
  data, barWidth, totalHeight, colors,
}: StackedBarsProps): React.ReactElement | null {
  const { totalPaid = 0, remainingBalance = 0 } = data[0] || {};
  const totalAmount = totalPaid + remainingBalance;

  const paidHeight = totalAmount ? (totalPaid / totalAmount) * totalHeight : 0;
  const remainingHeight = totalAmount ? (remainingBalance / totalAmount) * totalHeight : 0;

  const paidPercentage = totalAmount ? Math.round((totalPaid / totalAmount) * 100) : 0;
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const [tooltip, setTooltip] = useState<{ content: string[]; x: number; y: number } | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const handleMouseEnter = (x: number, y: number, content: string[], segment: string) => {
    setHoveredSegment(segment);
    setTooltip({
      content,
      x: x + barWidth + 10,
      y,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
    setHoveredSegment(null);
  };

  if (data.length === 0) return null;

  return (
    <svg width={barWidth + 200} height={totalHeight + 40} style={{ border: '1px solid #ddd' }}>
      <g>
        {/* Total Paid Bar */}
        <rect
          x={20}
          y={totalHeight - paidHeight}
          width={barWidth}
          height={paidHeight}
          fill={hoveredSegment === 'paid' ? '#2DB681' : colors[0]}
          onMouseEnter={() => handleMouseEnter(20, totalHeight - paidHeight / 2, [`Paid percent: ${paidPercentage}%`], 'paid')}
          onMouseLeave={handleMouseLeave}
          style={{ transition: 'fill 0.3s ease', cursor: 'pointer' }}
        />
        <text
          x={barWidth / 2 + 20}
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
          x={20}
          y={totalHeight - paidHeight - remainingHeight}
          width={barWidth}
          height={remainingHeight}
          fill={hoveredSegment === 'remaining' ? '#46A3CA' : colors[1]}
          onMouseEnter={() => handleMouseEnter(20, totalHeight - paidHeight - remainingHeight / 2, [`Remaining Percent: ${Math.round((remainingBalance / totalAmount) * 100)}%`], 'remaining')}
          onMouseLeave={handleMouseLeave}
          style={{ transition: 'fill 0.3s ease', cursor: 'pointer' }}
        />
        <text
          x={barWidth / 2 + 20}
          y={totalHeight - paidHeight - remainingHeight / 2}
          textAnchor="middle"
          fill="#ffffff"
          fontSize="14"
          fontWeight="bold"
        >
          {formatCurrency(remainingBalance)}
        </text>
      </g>

      {/* Hover Tooltip */}
      {tooltip && (
        <text x={tooltip.x} y={tooltip.y} fill="black" fontSize="13" textAnchor="start">
          {tooltip.content.map((line, index) => (
            <tspan key={index} x={tooltip.x} dy={index === 0 ? '0' : '15'}>
              {line}
            </tspan>
          ))}
        </text>
      )}
    </svg>
  );
}

export default StackedBars;
