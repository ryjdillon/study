import { CSSProperties } from 'react';

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
  paymentOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
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
  disabledButton: {
    marginTop: '0.25em',
    marginLeft: '0.5em',
    padding: '8px 20px',
    cursor: 'not-allowed',
    backgroundColor: '#cccccc',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    height: '50%',
  },
  body: {
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginLeft: '12%',
    marginRight: '12%',
    fontFamily:
            '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu',
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
    whiteSpace: 'pre',
  },
  leftAlignText: {
    textAlign: 'left',
    marginBottom: '12px',
  },
  boldText: {
    fontWeight: '700',
  },
};

export default styles;
