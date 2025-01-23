import React, { useState, useEffect, CSSProperties } from 'react';
import { Text } from '@mantine/core';
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
    height: '80%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginTop: '20px',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    width: '100%',
  },
  column: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraPaymentOptions: {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'column' as const, // Change to column to place input box below the line
    gap: '10px',
    alignItems: 'center',
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
  header: {
    textAlign: 'center',
    margin: '20x',

  },
  year: {
    textAlign: 'center',
    margin: '0px',
    marginBottom: '20px',
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
  const maxExtraPayment = 5000; // Set the maximum limit (5000-min payment)
  const minPayment = 341;
  return (
    <div style={styles.extraPaymentOptions}>
      <h3>How much do you want to pay each month?</h3>
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
        <>
          <div style={styles.contentContainer}>
            <div style={{ ...styles.column, justifyContent: 'flex-start' }}>
              <h2 style={styles.header}>Loan Payoff</h2>
              <h3 style={styles.year}>{currentYearIndex + 2025}</h3>
              <div id="option-1">
                <Text size="xl">
                  Percent Paid:
                  <Text fw={700} component="span">
                    {chartData[currentYearIndex]?.totalPaid <= 0
                      ? '0%'
                      : ` ${Math.round(((chartData[currentYearIndex]?.totalPaid ?? 0) / ((chartData[currentYearIndex]?.totalPaid ?? 0) + (chartData[currentYearIndex]?.remainingBalance ?? 0))) * 100)}%`}
                  </Text>
                </Text>
                <Text size="xl">
                  Current Loan Balance:
                  <Text fw={700} component="span">
                    {` ${toDollars(chartData[currentYearIndex]?.remainingBalance)} `}
                  </Text>
                </Text>
              </div>
            </div>
            <div style={{ ...styles.column, justifyContent: 'flex-start' }}>
              <h2 style={styles.header}>Budget: $5,000</h2>

              <SideBarPie size={350} data={extraPayments[currentYearIndex]} />
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
          <Results data={choices} />
        </div>
      )}
    </div>
  );
}

export default TotalBalancePaymentsChart;
