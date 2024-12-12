import React, { useState, useEffect, CSSProperties } from 'react';
import { Text } from '@mantine/core';
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
const styles: { [key: string]: CSSProperties } = {
  chartContainer: {
    height: '400px',
    width: '75em',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    position: 'relative' as const,
  },

  extraPaymentOptions: {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '20px',
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
  paidOffMessage: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginTop: '20px',
  },

  percentOfIncome: {
    color: 'green',
    fontSize: '20px',
    fontWeight: 'bold',
    padding: 0,
    margin: 0,
  },
  numberGreen: {
    color: '#06945D',
    fontWeight: 'bold',
    fontSize: 'x-large',
  },

  numberBlue: {
    color: '#0077A9',
    fontWeight: 'bold',
    fontSize: 'x-large',
  },

  hidden: {
    display: 'none',
  },

  h1: {
    display: 'block',
  },

  body: {
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginLeft: '12%',
    marginRight: '12%',

    fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu',
  },

  p: {
    fontSize: 'x-large',
  },

  label: {
    fontSize: 'x-large',
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
  const percentage = (((341 + extraPayments[currentYearIndex]) / 5000) * 100).toFixed(2);
  const isOver = parseFloat(percentage) > 10;
  const isLoanPaidOff = (typeof currentYearIndex === 'number' && currentYearIndex >= chartData.length)
    || (typeof remainingBalance === 'number' && typeof extraPayment === 'number'
      && remainingBalance + extraPayment * 12 <= 0);

  function toDollars(x: number) {
    return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(x);
  }
  useEffect(() => {
    if (isLoanPaidOff && currentYearIndex !== 0 && !completedStudy) {
      submitData();
    }
  }, [isLoanPaidOff]);

  return (
    <div style={styles.chartContainer}>
      {!completedStudy}
      {!completedStudy ? (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1em' }}>

          <div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <h2>
                Year:
                {' '}
                {currentYearIndex + 2025}
              </h2>
            </div>
            <div id="full">
              <Text size="xl">
                {' '}
                You have
                <Text color="#0077A9" fw={700} component="span">
                  {` ${toDollars(chartData[currentYearIndex - 1]?.remainingBalance ?? 30000)}`}
                  {' '}
                </Text>
                remaining in your loan of
                {' '}
                <Text fw={700} component="span">$30,000</Text>
                . The
                minimum monthly payment is
                <Text color="#0077A9" fw={700} component="span"> 341.00</Text>
                .
              </Text>

              <div id="option-1">
                <Text size="xl">
                  {' '}
                  If you pay
                  <Text color="#06945D" fw={700} component="span">{` ${toDollars(341 + extraPayments[currentYearIndex])}`}</Text>
                  {' '}
                  each month this year, you will have
                  <Text color="#06945D" fw={700} component="span">{` ${toDollars(chartData[currentYearIndex]?.remainingBalance)} `}</Text>
                  remaining at the end of the year.
                </Text>
                <Text size="xl">
                  This loan payment is
                  <Text fw={700} component="span" color={isOver ? 'red' : 'black'}>
                    {` ${percentage}`}
                    %
                  </Text>
                  {' '}
                  of your total income.
                  {' '}
                </Text>
              </div>
              <div className="buttons">
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
          </div>
          <div style={{ marginLeft: '4em', justifyContent: 'top', alignItems: 'flex-start' }}>
            <h3>Budget Post Taxes: $5,000</h3>
            <SideBarPie size={350} data={extraPayments[currentYearIndex]} />
          </div>
        </div>
      ) : (

        <div style={styles.paidOffMessage}>
          <text>
            Congratulations! Your loan has been paid off.
          </text>
        </div>
      )}

    </div>

  );
}
export default TotalBalancePaymentsChart;
