import React, { useState, useEffect, CSSProperties } from 'react';
import { useChartDimensions } from './hooks/useChartDimensions';
import PieChart from './chartcomponents/PieChart';
import { StimulusParams } from '../../../store/types';
import SideBarPie from './chartcomponents/SideBarPie';
import Results from './Results';

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
    alignItems: 'flex-start',
    position: 'relative' as const,
  },
  chartWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    paddingBottom: '20px',
  },
  extraPaymentOptions: {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'row' as const,
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
    marginTop: '25px',
    marginLeft: '10px',
    padding: '8px 20px',
    cursor: 'pointer',
    backgroundColor: '#0077A9',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    height: '50%',
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
  },
  visWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: '2em',
    marginLeft: '5em',
    padding: 0,
  },
  sideBar: {
    fontSize: '16px',
    fontWeight: 'bold',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '100%',
    boxSizing: 'border-box',
  },
  percentOfIncome: {
    color: 'green',
    fontSize: '20px',
    fontWeight: 'bold',
    padding: 0,
    margin: 0,
  },

  percentOfIncomeOver: {
    color: 'red',
    fontSize: '20px',
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
  const maxExtraPayment = 5000; // Set the maximum limit
  const minPayment = 341;
  return (
    <div style={styles.extraPaymentOptions}>
      <h3>How much do you want to pay each month?</h3>
      <input
        type="number"
        value={extraPayment + 341} // Add the minimum payment to the value for display
        min={minPayment}
        max={maxExtraPayment}
        onChange={(e) => {
          let value = Math.max(parseFloat(e.target.value), minPayment); // Enforce minimum
          value = Math.min(value, maxExtraPayment); // Enforce maximum
          setExtraPayment(value - 341); // subtract the minimum payment to get the extra payment
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
  const extraPayment = extraPayments[currentYearIndex] ?? 0;

  const remainingBalance = currentYearData.remainingBalance ?? 0; // Ensure a fallback value
  const percentOfIncome = (((extraPayments[currentYearIndex] + 341) / 5000) * 100).toFixed(2);
  const isOverTenPercent = parseFloat(percentOfIncome) > 10;
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
      <div style={{ alignSelf: 'center' }} />
      {!completedStudy}
      {!completedStudy ? (
        <>
          <div style={{ alignSelf: 'center' }}>
            {' '}
            <h2>
              Year:
              {' '}
              {currentYearIndex + 2025}
            </h2>
          </div>
          <div ref={ref} style={styles.chartWrapper}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '2em' }}>
              <div style={styles.visWrapper}>
                <svg width={dms.width * 0.55} height={dms.height}>
                  <g transform="translate(0, 0)">
                    {chartData.length > 0 && currentYearIndex < chartData.length ? (
                      <PieChart
                        data={[chartData[currentYearIndex]]}
                        radius={160}
                        colors={['#06945D', '#e5e5e5']}
                      />
                    ) : (
                      <text>No data available for this year.</text>
                    )}
                  </g>
                </svg>

                <div style={styles.alignRight}>
                  <p style={styles.sideBar}>Current Balance</p>

                  <h1>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(chartData[currentYearIndex]?.remainingBalance)}</h1>

                  <p style={styles.sideBar}> Monthly Payment</p>
                  <h1>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(341 + extraPayments[currentYearIndex])}</h1>

                  <p style={styles.sideBar}> Percent of Monthly Income</p>

                  <h1 style={{ color: isOverTenPercent ? 'red' : 'black' }}>
                    {percentOfIncome}
                    %
                  </h1>
                </div>

              </div>

              <div style={{ marginLeft: '1em', justifyContent: 'top', alignItems: 'flex-start' }}>
                <h3>Budget Post Taxes: $5,000</h3>
                <SideBarPie size={350} data={extraPayments[currentYearIndex]} />
              </div>

            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignContent: 'center' }}>
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
            </div>
          </div>
        </>

      ) : (
        <div>
          <Results
            data={choices}
          />
        </div>
      )}
    </div>
  );
}

export default TotalBalancePaymentsChart;
