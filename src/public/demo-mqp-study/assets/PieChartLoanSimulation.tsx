import React, { useState, useEffect, CSSProperties } from 'react';
import { NumberInput } from '@mantine/core';
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
  PaymentOptions: {
    marginTop: '5px',
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '0px',

  },
  nextYearButton: {
    marginTop: '25px',
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
    marginTop: '25px',
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

function PaymentOptions({
  payment,
  setPayment,
}: {
  payment: number;
  setPayment: React.Dispatch<React.SetStateAction<number>>;
}) {
  const maxPayment = 5000; // Set the maximum limit
  const minPayment = 341;
  return (
    <div style={
      {
        ...styles.PaymentOptions, display: 'flex', flexDirection: 'column', gap: '0px', alignItems: 'center',
      }
}
    >
      <h2 style={{ paddingTop: '10px', fontWeight: 'normal' }}>
        How much do you want to pay each month?
      </h2>
      <div style={styles.inputWrapper}>
        {(payment < 341 || payment > 5000)
          ? (
            <NumberInput
              error="Invalid input."
              min={minPayment}
              max={maxPayment}
              prefix="$"
              clampBehavior="blur"
              onChange={(e) => setPayment(e as number)}
            />
          )
          : (
            <NumberInput
              min={minPayment}
              max={maxPayment}
              prefix="$"
              clampBehavior="blur"
              onChange={(e) => setPayment(e as number)}
            />
          )}

      </div>

    </div>
  );
}

function TotalBalancePaymentsChart({
  setAnswer,
}: StimulusParams<Record<string, unknown>>) {
  const totalLoanAmount = 30000;
  const annualInterestRate = 0.065;
  const maxYearsToSimulate = 10;
  const initialPayment = 0;

  const [chartData, setChartData] = useState<DataRow[]>([]);
  const [currentYearIndex, setCurrentYearIndex] = useState<number>(0);
  const [payments, setPayments] = useState<number[]>(Array(maxYearsToSimulate).fill(initialPayment));
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
        const currentPayment = payments[year - 2025] * 12;
        const totalPayment = Math.min(remainingBalance + yearlyInterest, currentPayment);
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
  }, [payments]);

  function submitData() {
    setAnswer({
      status: true,
      answers: { [taskID]: choices },
    });
    completedStudy = true;
  }

  function handleNextYear() {
    choices[currentYearIndex] = payments[currentYearIndex];
    const nextIndex = currentYearIndex + 1;
    const currentYearData = chartData[currentYearIndex] || { remainingBalance: 0 };
    const remainingBalance = currentYearData.remainingBalance ?? 0;
    const payment = (payments[currentYearIndex] ?? 0) * 12;

    const isEndOfStudy = nextIndex >= maxYearsToSimulate
      || (typeof remainingBalance === 'number'
        && typeof payment === 'number'
        && remainingBalance + payment <= 0);

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
  const payment = payments[currentYearIndex] ?? 0;

  const remainingBalance = currentYearData.remainingBalance ?? 0; // Ensure a fallback value
  const isLoanPaidOff = (typeof currentYearIndex === 'number' && currentYearIndex >= chartData.length)
    || (typeof remainingBalance === 'number' && typeof payment === 'number'
      && remainingBalance + payment * 12 <= 0);
  const isInputValid = (payment < 341 || payment > 5000);
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
                <SideBarPie size={350} data={payments[currentYearIndex]} />
                <div style={{ textAlign: 'center', marginTop: '3em' }}>
                  <h2>EOY Loan Balance</h2>
                  <h2 style={{ marginTop: '1px', fontSize: '36px', fontWeight: '300' }}>
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
            <PaymentOptions
              payment={payments[currentYearIndex]}
              setPayment={(value) => {
                const updatedPayments = [...payments];
                const updatedValue = typeof value === 'function' ? value(updatedPayments[currentYearIndex]) : value;
                updatedPayments[currentYearIndex] = updatedValue;
                setPayments(updatedPayments);
              }}
            />

            {/* Next Year Button */}
            <button
              type="button"
              style={(isLoanPaidOff || isInputValid) ? styles.disabledButton : styles.nextYearButton}
              onClick={handleNextYear}
              disabled={isLoanPaidOff || isInputValid}
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
