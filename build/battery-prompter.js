#!/usr/bin/env node

'use strict';

// imports
const getBatteryLevel = require('battery-level');
const getOsxBattery = require('osx-battery');
const say = require('say');

let settings = {
  enabled: true,
  lowWarningThreshold: 10,
  highWarningThreshold: 90,
  checkRepeatTime: 60 * 1000 * 2, // 2 minutes
  isContinuous: process.argv[2] === 'continuous'
};

const checkChargeStatus = async() => {
  const now = new Date();
  const currentBatteryLevel = await getBatteryLevel() * 100;
  const batteryInfo = await getOsxBattery();
  const {isCharging} = batteryInfo;

  console.log('Current Date/Time: ' + now.toLocaleDateString() + ' ' + now.toLocaleTimeString());
  console.log('Current Battery Level: ' + currentBatteryLevel);
  console.log('Currently Charging: ' + isCharging);
  console.log('');

  {
    if(currentBatteryLevel <= settings.lowWarningThreshold && !isCharging) {
      say.speak('Battery is low. Plug in now!');
    } else if (currentBatteryLevel >= settings.highWarningThreshold && isCharging) {
      say.speak('Battery is sufficiently charged. Unplug now!');
    }
  }

  // check again and repeat the prompt
  if (settings.isContinuous) {
    setTimeout(checkChargeStatus, settings.checkRepeatTime);
  }
};

// checkChargeStatus the app
(async () => {
  if (!settings.isContinuous) {
    console.log('To run in continuous mode, add the "continuous" argument to the command line.\r\n');
  }
  console.log('Continuous mode: ' + settings.isContinuous + '\r\n');
  checkChargeStatus();
})();
