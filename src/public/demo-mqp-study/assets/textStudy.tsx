import React, { useState, useEffect } from 'react';
import { NumberInput, Text } from '@mantine/core';
import { StimulusParams } from '../../../store/types';
import SideBarPie from './chartcomponents/SideBarPie';
import Results from './Results';
import styles from './styles';

interface DataRow {
  year: number;
  totalPaid: number;
  remainingBalance: number;
  yearlyInterest: number;
}

let completedStudy = false;
const choices: number[] = [];
const TASK_ID = 'answer-array';

const MIN_PAYMENT = 341;
const MAX_PAYMENT = 5000;

function PaymentOptions({
  payment,
  setPayment,
}: {
  payment: number;
  setPayment: React.Dispatch<React.SetStateAction<number>>;
}) {
  const handlePaymentChange = (value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    setPayment(numericValue ?? MIN_PAYMENT);
  };

  return (
    <div style={styles.paymentOptions}>
      <div style={styles.inputWrapper}>
        <NumberInput
          error={payment < MIN_PAYMENT || payment > MAX_PAYMENT ? 'Invalid input.' : ''}
          min={MIN_PAYMENT}
          max={MAX_PAYMENT}
          size="lg"
          prefix="$"
          clampBehavior="blur"
          value={payment}
          onChange={handlePaymentChange}
          hideControls
        />
      </div>
    </div>
  );
}

function TotalBalancePaymentsChart({ setAnswer }: StimulusParams<Record<string, unknown>>) {
  const TOTAL_LOAN_AMOUNT = 30000;
  const ANNUAL_INTEREST_RATE = 0.065;
  const MAX_YEARS_TO_SIMULATE = 10;

  const [chartData, setChartData] = useState<DataRow[]>(Array(MAX_YEARS_TO_SIMULATE).fill({}));
  const [currentYearIndex, setCurrentYearIndex] = useState<number>(0);
  const [payments, setPayments] = useState<number[]>(Array(MAX_YEARS_TO_SIMULATE).fill(''));

  useEffect(() => {
    const generateChartData = () => {
      const data: DataRow[] = [];
      let remainingBalance = TOTAL_LOAN_AMOUNT;
      let totalPaid = 0;

      for (let year = 2025; year < MAX_YEARS_TO_SIMULATE + 2025; year += 1) {
        if (remainingBalance <= 0) break;
        const yearlyInterest = remainingBalance * ANNUAL_INTEREST_RATE;
        const payment = payments[year - 2025] * 12;
        const totalPayment = Math.min(remainingBalance + yearlyInterest, payment);
        remainingBalance = Math.max(0, remainingBalance + yearlyInterest - totalPayment);
        totalPaid += totalPayment;

        data.push({
          year,
          totalPaid,
          remainingBalance,
          yearlyInterest,
        });
      }

      return data;
    };

    setChartData(generateChartData());
  }, [payments]);

  const submitData = () => {
    setAnswer({
      status: true,
      answers: { [TASK_ID]: choices },
    });
    completedStudy = true;
  };

  const handleNextYear = () => {
    choices[currentYearIndex] = payments[currentYearIndex];
    const nextIndex = currentYearIndex + 1;
    const currentYearData = chartData[currentYearIndex] || { remainingBalance: 0 };
    const remainingBalance = currentYearData.remainingBalance ?? 0;

    const isEndOfStudy = nextIndex >= MAX_YEARS_TO_SIMULATE || remainingBalance <= 4100;

    if (isEndOfStudy) {
      submitData();
    } else {
      setCurrentYearIndex(nextIndex);
    }
  };

  const currentYearData = chartData[currentYearIndex] || { remainingBalance: 0 };
  const payment = payments[currentYearIndex] ?? 0;
  const remainingBalance = currentYearData.remainingBalance ?? 0;
  const isLoanPaidOff = currentYearIndex >= chartData.length || remainingBalance + payment * 12 <= 0;
  const isInputValid = payment < MIN_PAYMENT || payment > MAX_PAYMENT;

  const toDollars = (x: number) => Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(x);

  useEffect(() => {
    if (isLoanPaidOff && currentYearIndex !== 0 && !completedStudy) {
      submitData();
    }
  }, [isLoanPaidOff]);

  return (
    <div style={styles.chartContainer}>
      {!completedStudy ? (
        <>
          <div style={styles.contentContainer}>
            <div style={styles.column}>
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
                    {` ${toDollars(chartData[currentYearIndex]?.remainingBalance)}`}
                  </Text>
                </Text>
              </div>
            </div>
            <div style={styles.column}>
              <h2 style={styles.header}>Budget: $5,000</h2>
              <SideBarPie size={370} data={payments[currentYearIndex]} />
            </div>
          </div>
          <h2 style={{ paddingTop: '10px', fontWeight: 'normal' }}>
            How much do you want to pay each month?
          </h2>
          <div style={{ display: 'flex' }}>
            <PaymentOptions
              payment={payments[currentYearIndex]}
              setPayment={(value) => {
                const updatedPayments = [...payments];
                updatedPayments[currentYearIndex] = typeof value === 'function' ? value(payments[currentYearIndex]) : value;
                setPayments(updatedPayments);
              }}
            />
            <button
              type="button"
              style={isLoanPaidOff || isInputValid ? styles.disabledButton : styles.nextYearButton}
              onClick={handleNextYear}
              disabled={isLoanPaidOff || isInputValid}
            >
              Next Year
            </button>
          </div>
        </>
      ) : (
        <Results data={choices} />
      )}
    </div>
  );
}

export default TotalBalancePaymentsChart;
