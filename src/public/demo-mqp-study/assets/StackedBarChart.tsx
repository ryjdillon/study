import React, { useState, useEffect } from 'react';
import { useChartDimensions } from './hooks/useChartDimensions';
import StackedBars from './chartcomponents/StackedBars';
import { StimulusParams } from '../../../store/types';

const taskID = 'answer-array';
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
    flexDirection: 'column' as const,
    alignItems: 'center',
    position: 'relative' as const,
  },
  chartWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    paddingBottom: '-10px',
  },
  extraPaymentOptions: {
    marginTop: '10px',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'row' as const,
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
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    position: 'absolute' as const,
    top: '200px',
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
  paidOffMessage: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginTop: '20px',
  },
  submitButton: {
    marginTop: '15px',
    padding: '8px 20px',
    cursor: 'pointer',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
};

const choices: boolean[] = [];

function Legend() {
  return (
    <div style={styles.legend}>
      <div style={{ ...styles.legendItem, color: '#0077A9' }}>
        <span style={{ ...styles.legendColorBox, backgroundColor: '#0077A9' }} />
        Remaining Loan Balance
      </div>
      <div style={{ ...styles.legendItem, color: '#06945D' }}>
        <span style={{ ...styles.legendColorBox, backgroundColor: '#06945D' }} />
        Amount Paid Off
      </div>
    </div>
  );
}

function ExtraPaymentOptions({
  extraPayment,
  setExtraPayment,
}: {
  extraPayment: number;
  setExtraPayment: React.Dispatch<React.SetStateAction<number>>;
}) {
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
        Pay $374.86 per month
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
        Pay $474.86 per month
      </label>
    </div>
  );
}

function TotalBalancePaymentsChart({
  setAnswer,
}: StimulusParams<Record<string, unknown>>) {
  const totalLoanAmount = 30000;
  const yearlyPayment = 4173.14;
  const initialExtraPayment = 0;
  const annualInterestRate = 0.065;
  const maxYearsToSimulate = 10;

  const [chartData, setChartData] = useState<DataRow[]>([]);
  const [currentYearIndex, setCurrentYearIndex] = useState<number>(0);
  const [extraPayments, setExtraPayments] = useState<number[]>(Array(maxYearsToSimulate).fill(initialExtraPayment));
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
      let totalPaid = 0;

      for (let year = 2025; year < maxYearsToSimulate + 2025; year += 1) {
        if (remainingBalance <= 0) break;

        const yearlyInterest = remainingBalance * annualInterestRate;
        const extraPayment = extraPayments[year - 2025];
        const payment = yearlyPayment + extraPayment;
        const totalPayment = Math.min(remainingBalance + yearlyInterest, payment);
        remainingBalance = Math.max(0, remainingBalance + yearlyInterest - totalPayment);
        totalPaid += totalPayment;

        data.push({
          year,
          totalPaid,
          remainingBalance,
          interest: yearlyInterest,
          total_payment: totalPaid,
        });
      }

      return data;
    };

    setChartData(generateChartData());
  }, [extraPayments]);

  function handleNextYear() {
    choices[currentYearIndex] = extraPayments[currentYearIndex] > 0;

    const nextIndex = currentYearIndex + 1;
    const isEndOfStudy = nextIndex >= maxYearsToSimulate || chartData[nextIndex]?.remainingBalance <= 4173.14;
    if (isEndOfStudy) {
      setAnswer({
        status: true,
        answers: { [taskID]: choices },
      });
    }
    setCurrentYearIndex(nextIndex);
  }

  const isLoanPaidOff = currentYearIndex >= chartData.length || chartData[currentYearIndex]?.remainingBalance <= 4173.14;

  return (
    <div style={styles.chartContainer}>
      <h2>Loan Balance and Payments Over Time</h2>
      <h3>
        Year:
        {currentYearIndex + 2025}
      </h3>
      {!isLoanPaidOff && <Legend />}
      <div ref={ref} style={styles.chartWrapper}>
        {!isLoanPaidOff ? (
          <>
            <svg width={dms.width} height={dms.height}>
              <g transform={`translate(${dms.width / 2 - 100}, 0)`}>
                {chartData.length > 0 && currentYearIndex < chartData.length ? (
                  <StackedBars
                    data={[chartData[currentYearIndex]]}
                    barWidth={Math.max(200, Math.min(dms.width, dms.height) / maxYearsToSimulate - 5)}
                    totalHeight={dms.height - dms.marginTop - dms.marginBottom}
                    colors={['#06945D', '#0077A9']}
                  />
                ) : (
                  <text>No data available for this year.</text>
                )}
              </g>
            </svg>

            <ExtraPaymentOptions
              extraPayment={extraPayments[currentYearIndex]}
              setExtraPayment={(value) => {
                const updatedPayments = [...extraPayments];
                const updatedValue = typeof value === 'function' ? value(updatedPayments[currentYearIndex]) : value;
                updatedPayments[currentYearIndex] = updatedValue;
                setExtraPayments(updatedPayments);
              }}
            />
            <button
              type="button"
              style={isLoanPaidOff ? styles.disabledButton : styles.nextYearButton}
              onClick={handleNextYear}
              disabled={isLoanPaidOff}
            >
              Next Year
            </button>
          </>
        ) : (
          <div style={styles.paidOffMessage}>
            Congratulations! Your loan has been paid off.
          </div>
        )}
      </div>
    </div>
  );
}

export default TotalBalancePaymentsChart;
