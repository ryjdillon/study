import React, { useState, useEffect, CSSProperties } from 'react';
import { useChartDimensions } from './hooks/useChartDimensions';
import PieChart from './chartcomponents/PieChart';
import { StimulusParams } from '../../../store/types';

const taskID = 'answer-array';
interface DataRow {
  year: number;
  totalPaid: number;
  remainingBalance: number;
  interest: number;
  total_payment: number;
}
const styles: { [key: string]: CSSProperties } = {
  chartContainer: {
    height: '400px',
    width: '1000px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    position: 'relative' as const,
  },
  chartWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    paddingBottom: '20px',
  },
  extraPaymentOptions: {
    marginTop: '50px',
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
  alignRight: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    top: '120px',
    right: '200px',
  },
  visWrapper: {
    backgroundColor: '#f0f0f0',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    margin: 0,
    padding: 0,
  },
  sideBar: {
    fontSize: '16px',
    fontWeight: 'bold',
    padding: 0,
    margin: 0,
  },
};

let completedStudy = false;
const choices: number[] = [];

function ExtraPaymentOptions({
  extraPayment,
  setExtraPayment,
}: {
  extraPayment: number;
  setExtraPayment: React.Dispatch<React.SetStateAction<number>>;
}) {
  const maxExtraPayment = 200; // Set the maximum limit

  return (
    <div style={styles.extraPaymentOptions}>
      <h3>How much extra do you want to pay each month?</h3>
      <input
        type="number"
        value={extraPayment}
        max={maxExtraPayment}
        onChange={(e) => {
          const value = Math.min(parseFloat(e.target.value), maxExtraPayment);
          setExtraPayment(value);
        }}
      />
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
    height: 450,
    width: 800,
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
        const payment = yearlyPayment + (extraPayment * 12);
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

  function submitData() {
    setAnswer({
      status: true,
      answers: { [taskID]: choices },
    });
    completedStudy = true;
  }

  function handleNextYear() {
    choices[currentYearIndex] = extraPayments[currentYearIndex];
    const nextIndex = currentYearIndex + 1;
    const currentYearData = chartData[currentYearIndex] || { remainingBalance: 0 };
    const remainingBalance = currentYearData.remainingBalance ?? 0;
    const extraPayment = (extraPayments[currentYearIndex] ?? 0) * 12;

    const isEndOfStudy = nextIndex >= maxYearsToSimulate
      || (typeof remainingBalance === 'number'
        && typeof extraPayment === 'number'
        && remainingBalance + extraPayment <= 4100);

    if (isEndOfStudy) {
      setAnswer({
        status: true,
        answers: { [taskID]: choices },
      });
      completedStudy = true;
    }
    setCurrentYearIndex(nextIndex);
  }
  const currentYearData = chartData[currentYearIndex] || { remainingBalance: 0 };
  const extraPayment = extraPayments[currentYearIndex] ?? 0; // Use nullish coalescing for safety

  const remainingBalance = currentYearData.remainingBalance ?? 0; // Ensure a fallback value

  const isLoanPaidOff = (typeof currentYearIndex === 'number' && currentYearIndex >= chartData.length)
    || (typeof remainingBalance === 'number' && typeof extraPayment === 'number'
      && remainingBalance + extraPayment * 12 <= 0);

  useEffect(() => {
    if (isLoanPaidOff && currentYearIndex !== 0 && !completedStudy) {
      submitData();
    }
  }, [isLoanPaidOff]);

  return (
    <div style={styles.chartContainer}>
      <h3>
        Year:
        {currentYearIndex + 2025}
      </h3>
      {!completedStudy}
      <div ref={ref} style={styles.chartWrapper}>
        {!completedStudy ? (
          <>
            <svg width={dms.width} height={dms.height} style={styles.visWrapper}>
              <g transform="translate(0, 0)">
                {chartData.length > 0 && currentYearIndex < chartData.length ? (
                  <PieChart
                    data={[chartData[currentYearIndex]]}
                    radius={160}
                    colors={['#06945D', '#0077A9']}
                  />
                ) : (
                  <text>No data available for this year.</text>
                )}
              </g>
            </svg>
            <div style={styles.alignRight}>
              <p style={styles.sideBar}>Current Balance</p>

              <h1>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(chartData[currentYearIndex]?.remainingBalance)}</h1>

              <p style={styles.sideBar}> Miniumum Payment per Month</p>
              <h1>$341.00</h1>

              <p style={styles.sideBar}> Monthly Payment</p>
              <h1>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(341 + extraPayments[currentYearIndex])}</h1>
            </div>

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
