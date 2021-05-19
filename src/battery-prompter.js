'use strict';

process.title = 'battery-prompter';

// imports
const getBatteryLevel = require('battery-level');
const getOsxBattery = require('osx-battery');
const say = require('say');

let settings = {
  enabled: true, // TODO: build a UI to enable/disable while running
  lowWarningThreshold: 10,
  highWarningThreshold: 90,
  checkRepeatTimeLow: 60 * 1000 * 1, // 1 minute
  checkRepeatTimeHigh: 60 * 1000 * 2, // 2 minutes
  isContinuous: process.argv[2] === 'continuous'
};

const checkChargeStatus = async(options = {}) => {
  const {
    settings,
    outputFormat = 'string',
    logOutput = true
  } = options;

  const now = new Date();
  const currentBatteryLevel = Math.round(await getBatteryLevel() * 100);
  const batteryInfo = await getOsxBattery();
  const {fullyCharged, isCharging} = batteryInfo;

  const output = outputFormat === 'string' ? (
    'Current Date/Time: ' + now.toLocaleDateString() + ' ' + now.toLocaleTimeString() + '\r\n' +
    'Current Battery Level: ' + currentBatteryLevel + '\r\n' +
    'Currently Fully Charged: ' + fullyCharged + '\r\n' +
    'Currently Charging: ' + isCharging + '\r\n'
  ) : {
    dateTime: now.toLocaleDateString() + ' ' + now.toLocaleTimeString(),
    currentBatteryLevel,
    fullyCharged,
    isCharging
  };

  if (settings.enabled) {
    if(currentBatteryLevel <= settings.lowWarningThreshold && !isCharging) {
      const message = 'Battery is low. Plug in now!';
      say.speak(message);
    } else if (currentBatteryLevel >= settings.highWarningThreshold && (fullyCharged || isCharging)) {
      const message = 'Battery is sufficiently charged. Unplug now!';
      say.speak(message);
    }
  }

  if (logOutput) {
    console.log(output);
  }

  // prompt more often when battery is low
  const checkRepeatTime = currentBatteryLevel <= settings.lowWarningThreshold ? settings.checkRepeatTimeLow : settings.checkRepeatTimeHigh;
  // check again and repeat the prompt
  if (settings.isContinuous) {
    setTimeout(()=>{
      checkChargeStatus(options);
    }, checkRepeatTime);
  }

  return output;
};

// only auto run if we aren't inside Jest
if (typeof jest === 'undefined') {
  // run the app
  (async () => {
    if (!settings.isContinuous) {
      console.log('To run in continuous mode, add the "continuous" argument to the command line.\r\n');
    }
    console.log('Continuous mode: ' + settings.isContinuous + '\r\n');
    checkChargeStatus({settings});
  })();
}

module.exports = {
  settings,
  checkChargeStatus
};
