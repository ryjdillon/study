import React, { useState, useEffect } from 'react';
import { useChartDimensions } from './hooks/useChartDimensions';
import StackedBars from './chartcomponents/StackedBars';
import { StimulusParams } from '../../../store/types';
import SideBarPie from './chartcomponents/SideBarPie';

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
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    position: 'relative' as const,
  },
  chartWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '50px',
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
  overBudget: {
    color: 'red',
    fontWeight: 'bold',

  },
  underBudget: {
    color: 'black',
    fontWeight: 'bold',
  },
  labelContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '10px',
  },
  label: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  span: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
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
  const totalMonthlyPayment = 341 + extraPayment;
  const percentOfIncome = ((totalMonthlyPayment / 5000) * 100).toFixed(2);

  return (
    <div>
      <div style={styles.labelContainer}>
        <label style={styles.span}>Total Monthly Payment:</label>
        <span style={styles.span}>
          $
          {totalMonthlyPayment}
        </span>

        <label style={styles.span}>Percent of Income:</label>
        <span style={Number(percentOfIncome) > 10 ? styles.overBudget : styles.underBudget}>
          {percentOfIncome}
          %
        </span>

      </div>
      <div style={styles.extraPaymentOptions}>
        <h3>How much extra do you want to pay each month?</h3>
        <input
          type="number"
          value={extraPayment}
          min={0}
          max={maxExtraPayment}
          onChange={(e) => {
            const value = Math.min(parseFloat(e.target.value), maxExtraPayment);
            setExtraPayment(value);
          }}
        />
      </div>
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
    height: 100,
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
  const extraPayment = extraPayments[currentYearIndex] ?? 0;

  const remainingBalance = currentYearData.remainingBalance ?? 0;

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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <h2>Loan Balance and Payments Over Time</h2>

        <h3>
          Year:
          {currentYearIndex + 2025}
        </h3>
        {!completedStudy}

        {!completedStudy ? (

          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
            <div ref={ref} style={styles.chartWrapper}>
              <svg width={dms.width + 100} height={dms.height + 100} style={styles.chartWrapper}>
                {/* Legend */}
                <g transform="translate(200, 200)">
                  <rect x={620} y={0} width={15} height={15} fill="#06945D" />
                  <text x={640} y={12} fontSize="12" fill="black">Total Paid</text>

                  <rect x={700} y={0} width={15} height={15} fill="#0077A9" />
                  <text x={720} y={12} fontSize="12" fill="black">Remaining Balance</text>
                </g>
                <g>
                  {chartData.length > 0 && currentYearIndex < chartData.length ? (
                    <StackedBars
                      data={[chartData[currentYearIndex]]}
                      barWidth={dms.width}
                      barHeight={dms.height}
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
                disabled={completedStudy}
              >
                Next Year
              </button>
            </div>
            <div style={{ marginLeft: '1em' }}>
              <h3>Budget Post Taxes: $5,000</h3>
              <SideBarPie size={350} data={extraPayments[currentYearIndex]} />
            </div>
          </div>

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
