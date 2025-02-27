import React, { useState, useEffect } from 'react';
import { NumberInput } from '@mantine/core';
import { useChartDimensions } from './hooks/useChartDimensions';
import PieChart from './chartcomponents/PieChart';
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

  return (
    <div style={styles.chartContainer}>

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
