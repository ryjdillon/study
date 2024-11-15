import React, { useState, useEffect, useRef } from 'react';
import { useChartDimensions } from './hooks/useChartDimensions';
import StackedMoney from './chartcomponents/StackedMoney';

interface DataRow {
  year: number;
  totalPaid: number;
  remainingBalance: number;
  interest: number;
  total_payment: number;
}

const styles = {
  chartContainer: {
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  chartWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '-10px',
    width: '100%',
  },
  extraPaymentOptions: {
    marginTop: '10px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '20px',
  },
  radioLabel: {
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 8px',
    borderRadius: '8px',
    border: '1px solid #4e79a7',
    backgroundColor: '#f9f9f9',
    transition: 'background-color 0.3s ease',
  },
  radioButton: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  nextYearButton: {
    marginTop: '15px',
    padding: '8px 20px',
    cursor: 'pointer',
    backgroundColor: '#0077A9',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
  disabledButton: {
    marginTop: '15px',
    padding: '8px 20px',
    cursor: 'not-allowed',
    backgroundColor: '#cccccc',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    position: 'absolute',
    top: '100px',
    right: '200px',
    gap: '6px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
  },
  legendColorBox: {
    width: '15px',
    height: '15px',
    backgroundColor: 'currentColor',
    marginRight: '5px',
  },
};

// function Legend() {
//   return (
//     <div style={styles.legend}>

//       <div style={{ ...styles.legendItem, color: '#0077A9' }}>
//         <span style={{ ...styles.legendColorBox, backgroundColor: '#0077A9' }} />
//         {' '}
//         Remaining Loan Balance
//       </div>
//       <div style={{ ...styles.legendItem, color: '#06945D' }}>
//         <span style={{ ...styles.legendColorBox, backgroundColor: '#06945D' }} />
//         {' '}
//         Amount Paid Off
//       </div>
//     </div>
//   );
// }

function ExtraPaymentOptions({ extraPayment, setExtraPayment }: { extraPayment: number, setExtraPayment: React.Dispatch<React.SetStateAction<number>> }) {
  return (
    <div style={styles.extraPaymentOptions}>
      <label style={styles.radioLabel}>
        <input
          type="radio"
          name="extraPayment"
          value="0"
          checked={extraPayment === 0}
          onChange={() => setExtraPayment(0)}
          style={styles.radioButton}
        />
        Pay $374.86  per month
      </label>
      <label style={styles.radioLabel}>
        <input
          type="radio"
          name="extraPayment"
          value="1200"
          checked={extraPayment === 1200}
          onChange={() => setExtraPayment(1200)}
          style={styles.radioButton}
        />
        Pay $474.86  per month
      </label>
    </div>
  );
}

function TotalBalancePaymentsChart(): React.FC {
  const totalLoanAmount = 30000;
  const yearlyPayment = 4173.14;
  const initialExtraPayment = 0;
  const annualInterestRate = 0.065;
  const maxYearsToSimulate = 10;

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

  useEffect(() => {
    const generateChartData = () => {
      const data: DataRow[] = [];
      let remainingBalance = totalLoanAmount;
      totalPaidRef.current = 0;

      for (let year = 2025; year < maxYearsToSimulate + 2025; year += 1) {
        if (remainingBalance <= 0) break;

        const yearlyInterest = remainingBalance * annualInterestRate;
        const payment = yearlyPayment + extraPayment;
        const totalPayment = Math.min(remainingBalance + yearlyInterest, payment);
        remainingBalance = Math.max(0, remainingBalance + yearlyInterest - totalPayment);
        totalPaidRef.current += totalPayment;

        data.push({
          year: year + 1,
          totalPaid: totalPaidRef.current,
          remainingBalance,
          interest: yearlyInterest,
          total_payment: totalPaidRef.current,
        });
      }

      return data;
    };

    setChartData(generateChartData());
  }, [extraPayment]);

  const handleNextYear = () => {
    setCurrentYearIndex((prev) => Math.min(prev + 1, chartData.length - 1));
  };

  return (
    <div style={styles.chartContainer}>
      <h2>Loan Balance and Payments Over Time</h2>
      <h3>
        Year:
        {' '}
        {currentYearIndex + 2025}
      </h3>
      <div ref={ref} style={styles.chartWrapper}>
        <svg width={dms.width} height={dms.height}>
          <g transform={`translate(${dms.width / 2 - 100}, 0)`}>
            {chartData.length > 0 && currentYearIndex < chartData.length ? (
              <StackedMoney
                data={[chartData[currentYearIndex]]}
                barWidth={Math.max(200, Math.min(dms.width, dms.height) / maxYearsToSimulate - 5)}
                totalHeight={dms.height - dms.marginTop - dms.marginBottom}
              />
            ) : (
              <text>No data available for this year.</text>
            )}
          </g>
        </svg>

        <ExtraPaymentOptions
          extraPayment={extraPayment}
          setExtraPayment={setExtraPayment}
        />

        <button
          type="button"
          onClick={handleNextYear}
          disabled={currentYearIndex === (chartData.length - 1)}
          style={currentYearIndex === (chartData.length - 1) ? styles.disabledButton : styles.nextYearButton}
        >
          Next Year &gt;
        </button>
      </div>
    </div>
  );
}

export default TotalBalancePaymentsChart;
