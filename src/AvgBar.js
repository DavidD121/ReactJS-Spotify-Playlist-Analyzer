import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import './AvgBar.css';

function AvgBar({ avg, max, min }) {

  var range = max - min;

  var barHeightPx = 200;

  function getMeterHeight(val) {
    return ((val - min) / range) * barHeightPx;
  }

  const fill = useSpring({ height: avg ? avg : min, from: { height: min } });

  var conditionalAdjust = 0;

  if ((avg ? getMeterHeight(avg) : 0) > (barHeightPx * 92 / 100)) {
    var div = document.getElementById('meter');
    div.classList.add('filled');
    conditionalAdjust = -20;
  }


  const meterStyle = {
    top: fill.height.interpolate(val => (getMeterHeight(val)) + conditionalAdjust),
  }

  return (
    <div className='avgbar'>
      <h2 className='label'>{max}</h2>
      <div className="bar" style={{ height: barHeightPx }}>
        <animated.div className="meter" id="meter" style={{ height: fill.height.interpolate(val => getMeterHeight(val)) }}>
          <animated.p className="meter-label" style={meterStyle}>{fill.height.interpolate(val => val.toFixed(2))}</animated.p>
        </animated.div>
      </div>
      <h2 className='label'>{min}</h2>
    </div>
  )
}

export default AvgBar;