import { rem } from '@mantine/core';
import React, { useState } from 'react';

interface StackedBarsProps {
  data: { totalPaid: number; remainingBalance: number }[];
  barWidth: number;
  barHeight: number;
  colors: string[];
}

function StackedBars({
  data, barHeight, barWidth, colors,
}: StackedBarsProps): React.ReactElement | null {
  const { totalPaid = 0, remainingBalance = 0 } = data[0] || {};
  const totalAmount = totalPaid + remainingBalance;

  const paidWidth = totalAmount ? (totalPaid / totalAmount) * barWidth : 0;
  const remainingWidth = totalAmount ? (remainingBalance / totalAmount) * barWidth : 0;

  const paidPercentage = totalAmount ? Math.round((totalPaid / totalAmount) * 100) : 0;
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const [tooltip, setTooltip] = useState<{ content: string[]; x: number; y: number } | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const handleMouseEnter = (x: number, y: number, content: string[], segment: string) => {
    setHoveredSegment(segment);
    setTooltip({ content, x: x + 2, y: y - 10 });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
    setHoveredSegment(null);
  };

  if (data.length === 0) return null;

  return (
    <svg width={barWidth + 500} height={barHeight + 600} style={{ border: '1px solid #ddd' }}>
      <g transform="translate(20, 20})">
        {/* Remaining Balance Bar */}
        <rect
          x={0}
          y={50}
          width={barWidth - 10}
          height={barHeight - 10}
          fill={hoveredSegment === 'remaining' ? '#46A3CA' : colors[1]}
          onMouseEnter={() => handleMouseEnter(paidWidth + remainingWidth / 2, barHeight / 2, [`Remaining Percent: ${Math.round((remainingBalance / totalAmount) * 100)}%`], 'remaining')}
          onMouseLeave={handleMouseLeave}
          style={{ transition: 'fill 0.3s ease', cursor: 'pointer' }}
          rx={20}
          ry={20}
        />

        {/* Total Paid Bar */}
        <rect
          x={0}
          y={50}
          width={paidWidth - 10}
          height={barHeight - 10}
          fill={hoveredSegment === 'paid' ? '#2DB681' : colors[0]}
          onMouseEnter={() => handleMouseEnter(paidWidth / 2, barHeight / 2, [`Paid Percent: ${paidPercentage}%`], 'paid')}
          onMouseLeave={handleMouseLeave}
          style={{ transition: 'fill 0.3s ease', cursor: 'pointer' }}
          rx={20}
          ry={20}
          stroke="white"
          strokeWidth={2}
        />

        {/* Text for Total Paid */}
        <text>
          <tspan x={10} y={barHeight / 2 + 50} fill="white" style={{ fontSize: rem(16), fontWeight: 600 }}>
            {formatCurrency(totalPaid)}
          </tspan>
        </text>

        {/* Text for Remaining Balance */}
        <text>
          <tspan x={10 + paidWidth} y={barHeight / 2 + 50} fill="white" style={{ fontSize: rem(16), fontWeight: 600 }}>
            {formatCurrency(remainingBalance)}
          </tspan>
        </text>
      </g>

      {tooltip && (
        <text x={tooltip.x} y={tooltip.y} fill="black" fontSize="13" textAnchor="middle">
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
