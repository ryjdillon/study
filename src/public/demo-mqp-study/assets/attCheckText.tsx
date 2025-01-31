import React, { useState, useEffect } from 'react';
import { NumberInput, Text } from '@mantine/core';
import { StimulusParams } from '../../../store/types';
import SideBarPie from './chartcomponents/SideBarPie';
import styles from './styles';

const taskID = 'attn-check';
interface DataRow {
  year: number;
  totalPaid: number;
  remainingBalance: number;
  interest: number;
  total_payment: number;
}

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
