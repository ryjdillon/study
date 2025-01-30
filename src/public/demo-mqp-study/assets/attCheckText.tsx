import React, { useState, useEffect, CSSProperties } from 'react';
import { NumberInput, Text } from '@mantine/core';
import { StimulusParams } from '../../../store/types';
import SideBarPie from './chartcomponents/SideBarPie';

const taskID = 'attn-check';
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
    justifyContent: 'center',

  },
  column: {
    display: 'flex',
    flex: 1,
    height: '100%',
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
    marginTop: '0.25em',
    marginLeft: '0.5em',
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
    width: '150px',
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
  },
  year: {
    textAlign: 'center',
    marginTop: '0',
    marginBottom: '20px',
    whiteSpace: 'pre,',
  },
};

let choice = -1;

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

      <div style={styles.inputWrapper}>
        <NumberInput
          min={minPayment}
          max={maxPayment}
          size="lg"
          prefix="$"
          clampBehavior="blur"
          value={payment}
          onChange={(e) => setPayment(e as number)}
          hideControls
        />
      </div>

    </div>
  );
}

function TotalBalancePaymentsChart({
  setAnswer,
}: StimulusParams<Record<string, unknown>>) {
  const totalLoanAmount = 30000;
  const annualInterestRate = 0.065;
  const maxYearsToSimulate = 1;

  const [chartData, setChartData] = useState<DataRow[]>([]);
  const currentYearIndex = 0;
  const [payments, setPayments] = useState<number[]>(Array(maxYearsToSimulate).fill(''));

  useEffect(() => {
    const generateChartData = () => {
      const data: DataRow[] = [];
      let remainingBalance = totalLoanAmount;
      let totalPaid = 0;

      for (let year = 2025; year < maxYearsToSimulate + 2025; year += 1) {
        if (remainingBalance <= 0) break;

        const yearlyInterest = remainingBalance * annualInterestRate;
        const payment = payments[year - 2025] * 12;
        const totalPayment = Math.min(remainingBalance + yearlyInterest, payment);
        remainingBalance = Math.max(0, remainingBalance + yearlyInterest - totalPayment);
        totalPaid += totalPayment;
        choice = payments[year - 2025];
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
    setAnswer({
      status: true,
      answers: { [taskID]: choice },
    });
  }, [payments]);

  function toDollars(x: number) {
    return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(x);
  }

  return (
    <div style={styles.chartContainer}>
      <div style={styles.contentContainer}>
        <div style={{ ...styles.column }}>
          <h2 style={styles.header}>Loan Payoff</h2>
          <h3 style={styles.year}>
            Year:
            {currentYearIndex + 2025}
          </h3>
          <div id="option-1">
            <Text size="xl" style={{ marginBottom: '12px' }}>
              Percent Paid:
              <Text fw={700} component="span">
                {chartData[currentYearIndex]?.totalPaid <= 0
                  ? ' 0%'
                  : ` ${(((chartData[currentYearIndex]?.totalPaid ?? 0)
                        / ((chartData[currentYearIndex]?.totalPaid ?? 0) + (chartData[currentYearIndex]?.remainingBalance ?? 0))) * 100).toFixed(0)}%`}
              </Text>
            </Text>
            <Text size="xl" style={{ marginBottom: '12px' }}>
              Current Loan Balance:
              <Text fw={700} component="span">
                {` ${toDollars(chartData[currentYearIndex - 1]?.remainingBalance ?? 30000)}`}
              </Text>
            </Text>
            <Text size="xl" style={{ marginBottom: '12px' }}>
              EOY Loan Balance:
              <Text fw={700} component="span">
                {` ${toDollars(chartData[currentYearIndex]?.remainingBalance)} `}
              </Text>
            </Text>
          </div>
        </div>
        <div style={{ ...styles.column }}>
          <h2 style={styles.header}>Budget: $5,000</h2>
          <SideBarPie size={370} data={payments[currentYearIndex]} />
        </div>
      </div>
      <h2 style={{ paddingTop: '10px', fontWeight: 'normal' }}>
        Please enter 1000 to show you understand the directions.
      </h2>
      <div style={{ display: 'flex' }}>
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

      </div>
    </div>
  );
}

export default TotalBalancePaymentsChart;
