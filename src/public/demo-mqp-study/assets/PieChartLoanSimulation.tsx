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
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chartWrapper: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0px',
  },
  extraPaymentOptions: {
    marginTop: '5px',
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '0px',

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
  visWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 0,
  },
  sideBar: {
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    boxSizing: 'border-box',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    width: '100px',
  },
  dollarSign: {
    position: 'absolute',
    left: '10px',
    color: '#555',
    fontSize: '17px',
    pointerEvents: 'none',
  },
  dollarInput: {
    width: '100%',
    padding: '5px',
    boxSizing: 'border-box',
    paddingLeft: '25px',
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
    <div style={
      {
        ...styles.extraPaymentOptions, display: 'flex', flexDirection: 'column', gap: '0px', alignItems: 'center',
      }
}
    >
      <h2 style={{ paddingTop: '10px', fontWeight: 'normal' }}>
        How much do you want to pay each month?
      </h2>
      <div style={styles.inputWrapper}>
        <span style={styles.dollarSign}>$</span>
        <input
          type="number"
          style={styles.dollarInput}
          value={extraPayment + 341} // Add the minimum payment to the value for display
          min={minPayment}
          max={maxExtraPayment}
          onChange={(e) => {
            let value = Math.max(parseFloat(e.target.value), minPayment); // Enforce minimum
            value = Math.min(value, maxExtraPayment); // Enforce maximum
            setExtraPayment(value - 341); // Subtract the minimum payment to get the extra payment
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
    height: 360,
    width: 700,
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
          <div ref={ref} style={styles.chartWrapper}>
            <div style={{
              display: 'flex', flexDirection: 'row', gap: '4em', justifyContent: 'center',
            }}
            >
              <div style={styles.visWrapper}>
                <div style={{ marginTop: '0px', alignItems: 'flex-start' }}>
                  <h2 style={{ textAlign: 'center' }}>Loan Payoff</h2>
                  <svg width={dms.width * 0.5} height={dms.height}>
                    <g transform="translate(0, 0)">
                      {chartData.length > 0 && currentYearIndex < chartData.length ? (
                        <PieChart
                          data={[chartData[currentYearIndex]]}
                          radius={175}
                          colors={['#06945D', '#e5e5e5']}
                          year={currentYearIndex + 2025}
                        />
                      ) : (
                        <text>No data available for this year.</text>
                      )}
                    </g>
                  </svg>
                </div>
              </div>

              <div style={{ marginLeft: '1em', justifyContent: 'top', alignItems: 'flex-start' }}>
                <h2 style={{ textAlign: 'center' }}>Budget: $5,000</h2>
                <SideBarPie size={350} data={extraPayments[currentYearIndex]} />
                <div style={{ textAlign: 'center', marginTop: '2em' }}>
                  <h2 style={{ margin: '0px' }}>Current Balance</h2>
                  <h2 style={{ marginTop: '3px', fontSize: '36px', fontWeight: '300' }}>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(chartData[currentYearIndex]?.remainingBalance)}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Extra Payment Options */}
            <ExtraPaymentOptions
              extraPayment={extraPayments[currentYearIndex]}
              setExtraPayment={(value) => {
                const updatedPayments = [...extraPayments];
                const updatedValue = typeof value === 'function' ? value(updatedPayments[currentYearIndex]) : value;
                updatedPayments[currentYearIndex] = updatedValue;
                setExtraPayments(updatedPayments);
              }}
            />

            {/* Next Year Button */}
            <button
              type="button"
              style={isLoanPaidOff ? styles.disabledButton : styles.nextYearButton}
              onClick={handleNextYear}
              disabled={isLoanPaidOff}
            >
              Next Year
            </button>
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
