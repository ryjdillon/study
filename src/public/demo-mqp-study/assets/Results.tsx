import { CSSProperties } from 'react';
import { Text, Anchor } from '@mantine/core';

const styles: { [key: string]: CSSProperties } = {
  chartContainer: {
    height: '400px',
    width: '50em',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    position: 'relative' as const,

  },

};

interface dataProp {
  data: number[];
}
function averagePercent(payments: number[]) {
  const min = 341 * 12;
  const salary = 80000;
  const totalPayment = payments.flatMap((d) => (((d * 12) + min) / salary));
  const avg = totalPayment.reduce((prev, cur) => prev + cur) / payments.length;
  return (avg * 100).toPrecision(3);
}
function Results({ data }:dataProp) {
  return (
    <div style={styles.chartContainer}>
      <h1> Congratulations! Your loan is paid off.</h1>
      <Text fz="xl" lh="lg">
        It took you
        {' '}
        {data.length}
        {' '}
        years to pay off your loan.

        On average, you spent
        {' '}
        {' '}
        {' '}
        {averagePercent(data)}
        % of your income a year to pay off the loan.
      </Text>
      { parseInt(averagePercent(data), 10) > 10
        ? (<Text fz="xl" lh="lg">This percentage is greater than the recommended 10% allocation of gross income. It may be difficult to afford this repayment plan</Text>)
        : (
          <>
            <br />
            <Text fz="xl" lh="lg"> This percentage is less than the recommended 10% allocation of gross income.</Text>

          </>
        )}
      <Text fz="xl" lh="lg">
        To learn more about budgeting student loans, you can
        {' '}
        <Anchor fz="xl" lh="lg" href="https://www.consumerfinance.gov/consumer-tools/student-loans/">search here</Anchor>
        .
      </Text>
    </div>

  );
}
export default Results;
