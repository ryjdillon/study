import React, { useState, useEffect } from 'react';
import { NumberInput } from '@mantine/core';
import { useChartDimensions } from './hooks/useChartDimensions';
import PieChart from './chartcomponents/PieChart';
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

function TotalBalancePaymentsChart({
  setAnswer,
}: StimulusParams<Record<string, unknown>>) {
  const TOTAL_LOAN_AMOUNT = 30000;
  const ANNUAL_INTEREST_RATE = 0.065;
  const MAX_YEARS_TO_SIMULATE = 10;

  const [chartData, setChartData] = useState<DataRow[]>(Array(MAX_YEARS_TO_SIMULATE).fill({}));
  const [currentYearIndex, setCurrentYearIndex] = useState<number>(0);
  const [payments, setPayments] = useState<number[]>(Array(MAX_YEARS_TO_SIMULATE).fill(''));

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

  function submitData() {
    setAnswer({
      status: true,
      answers: { [TASK_ID]: choices },
    });
    completedStudy = true;
  }

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
              display: 'flex', flexDirection: 'row', gap: '4em', justifyContent: 'top',
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
                <SideBarPie size={370} data={payments[currentYearIndex]} />
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
          <h2 style={{ paddingTop: '10px', fontWeight: 'normal' }}>
            How much do you want to pay each month?
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
