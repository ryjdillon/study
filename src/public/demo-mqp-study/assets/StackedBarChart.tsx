import React, { useState, useEffect, useRef } from 'react';
import { useChartDimensions } from './hooks/useChartDimensions';
import StackedBars from './chartcomponents/StackedBars';

interface DataRow {
  year: number;
  totalPaid: number;
  remainingBalance: number;
  interest: number;
  total_payment: number;
}

function TotalBalancePaymentsChart(): React.FC {
  const totalLoanAmount = 30000;
  const yearlyPayment = 4173.14;
  const initialExtraPayment = 0; // Default to no extra payment
  const annualInterestRate = 0.065; // 6.5% annual interest
  const maxYearsToSimulate = 10; // Simulate for 10 years

  // UseRef to preserve totalPaid over renders
  const totalPaidRef = useRef(0);

  const [chartData, setChartData] = useState<DataRow[]>([]);
  const [currentYearIndex, setCurrentYearIndex] = useState<number>(0);
  const [extraPayment, setExtraPayment] = useState<number>(initialExtraPayment);
  const [ref, dms] = useChartDimensions({
    marginBottom: 0,
    marginLeft: 0,
    marginTop: 0,
    marginRight: 0,
    height: 400,
    width: 0,
  });

  // Calculate initial data
  useEffect(() => {
    const initialData: DataRow[] = [];
    let remainingBalance = totalLoanAmount;
    totalPaidRef.current = 0; // Reset totalPaid at start of calculation

    for (let year = 0; year < maxYearsToSimulate; year += 1) {
      let interest = 0;

      // If remaining balance is zero, break out of the loop
      if (remainingBalance <= 0) break;

      const yearlyInterest = remainingBalance * annualInterestRate;
      const payment = yearlyPayment + extraPayment;
      const totalPayment = Math.min(remainingBalance + yearlyInterest, payment);
      remainingBalance = Math.max(0, remainingBalance + yearlyInterest - totalPayment);
      totalPaidRef.current += totalPayment; // Update the totalPaid in the ref
      interest += yearlyInterest;

      initialData.push({
        year: year + 1, // Start years from 1
        totalPaid: totalPaidRef.current,
        remainingBalance,
        interest,
        total_payment: totalPaidRef.current,
      });
    }
    setChartData(initialData);
  }, [extraPayment]); // Recalculate data when extraPayment changes

  // Update series and index on year change
  const handleNextYear = () => {
    setCurrentYearIndex((prev) => Math.min(prev + 1, maxYearsToSimulate - 1));
  };

  return (
    <div style={{
      height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}
    >
      <h2>Loan Balance and Payments Over Time</h2>
      <h3>
        Year:
        {' '}
        {currentYearIndex + 1}
      </h3>
      <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width={dms.width} height={dms.height}>
          <g transform={`translate(${[100, 0].join(',')})`}>
            <g>
              {chartData.length > 0 && currentYearIndex < chartData.length ? (
                <StackedBars
                  data={[chartData[currentYearIndex]]}
                  barWidth={Math.max(200, Math.min(dms.width, dms.height) / maxYearsToSimulate - 5)}
                  totalHeight={dms.height - dms.marginTop - dms.marginBottom}
                  colors={['#4e79a7', '#A0CBE8']}
                />
              ) : (
                <div>No data available for this year.</div>
              )}
            </g>
          </g>
        </svg>

        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <h4>
            Current Loan Balance: $
            {chartData[currentYearIndex]?.remainingBalance.toFixed(2)}
          </h4>
          <h4>
            Interest Paid: $
            {chartData[currentYearIndex]?.interest.toFixed(2)}
          </h4>
          <h4>
            Total Payment: $
            {chartData[currentYearIndex]?.totalPaid.toFixed(2)}
          </h4>

        </div>

        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <label>
            <input
              type="radio"
              name="extraPayment"
              value="0"
              checked={extraPayment === 0}
              onChange={() => setExtraPayment(0)}
            />
            No Extra Payment
          </label>
          <label>
            <input
              type="radio"
              name="extraPayment"
              value="1200"
              checked={extraPayment === 1200}
              onChange={() => setExtraPayment(1200)}
            />
            Extra Payment of $100 per Month
          </label>
        </div>

        <div style={{ marginTop: '10px' }}>
          <button type="button" onClick={handleNextYear} disabled={currentYearIndex === (chartData.length - 1)}>
            Next Year &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

export default TotalBalancePaymentsChart;
