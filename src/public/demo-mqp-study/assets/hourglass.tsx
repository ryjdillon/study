import React, { useState } from 'react';
import hourglass from './images/hrglass.png';

function StackedBars() {
  const initialBalance = 30000;
  const [balance, setBalance] = useState(initialBalance);
  const scale = 1 - (initialBalance - balance) / initialBalance;
  const TopSideBound = `M31.9999 155
        C-3.8244 123.654 -2.10771 48.9642 4.10287 8.63672
        C4.83333 3.89362 8.97073 0.5 13.7698 0.5
        H290.365
        C295.325 0.5 299.555 4.16589 300.168 9.08783
        C313.293 114.554 272.474 152.565 271.5 155
        C270.62 157.2 205.518 214.884 169.793 245.602
        C167.983 247.158 165.688 248 163.301 248
        H148.5
        C142.977 248 137.546 243.526 134.028 239.268
        C119.473 221.648 72.0764 190.067 31.9999 155Z`;

  const makePayment = (amount: number) => {
    setBalance((prev) => Math.max(prev - amount, 0));
  };

  const imgStyle: React.CSSProperties = {
    position: 'absolute',

  };

  const divStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
  };
  const initWidth = 226;
  const initHeight = 185;
  return (
    <div style={divStyle}>
      <img style={imgStyle} src={hourglass} alt="hourglass" width="332" height="580" />

      <svg width={332} height={580} transform="scale(0.75)">
        <g transform={`translate(${125 - (initWidth / 2)}, ${200 - (initHeight * scale)}) scale(1,${scale})`}>

          <path d={TopSideBound} fill="#D4B87C" />
        </g>
        <g transform={`translate(${432 - (initWidth / 2)}, ${395 + (initHeight * (1 - scale))}) scale(1,${1 - scale}) rotate(180)`}>

          <path d={TopSideBound} fill="#D4B87C" />
        </g>

      </svg>
      <button type="button" onClick={() => makePayment(350)}>next</button>

    </div>
  );
}
export default StackedBars;
