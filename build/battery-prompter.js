#!/usr/bin/env node

'use strict';

process.title = 'battery-prompter';

// imports
const fs = require('fs');
const path = require('path');
const readLastLine = require('read-last-line');
const { program } = require('commander');
const getOsxBattery = require('osx-battery');
const say = require('say');

program
  .option('-c, --continuous', 'run in continuous mode')
  .option('-l, --log-file-path <path>', 'where to write the log after each check')
  .allowUnknownOption();
program.parse(process.argv);

let options = {
  enabled: true, // TODO: build a UI to enable/disable while running
  logFilePath: '',
  loggingEnabled: true,
  speechEnabled: true,
  outputFormat: 'string',
  lowWarningThreshold: 10,
  highWarningThreshold: 90,
  checkRepeatTimeLow: 60 * 1000 * 1, // 1 minute
  checkRepeatTimeHigh: 60 * 1000 * 2, // 2 minutes
  continuous: false,
  ...program.opts()
};

// ensure log file exists
const basePath = path.dirname(options.logFilePath);
if (options.loggingEnabled && options.logFilePath){
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }
  if (!fs.existsSync(options.logFilePath)) {
    fs.writeFileSync(options.logFilePath, '');
  }
}

const checkChargeStatus = async(options = {}, currentBatteryInfo) => {
  const now = new Date();
  const batteryInfo = currentBatteryInfo || (await getOsxBattery());
  const {batteryData, fullyCharged, isCharging, adapterDetails} = batteryInfo;
  const currentBatteryLevel = batteryData.stateOfCharge;
  // ensure we are using an apple adaptor or at least one with enough wattage to charge the laptop
  let isChargingWithHighWattage = isCharging && adapterDetails.watts >= 60;

  let output;
  if (options.outputFormat === 'string') {
    output = (
      'Current Date/Time: ' + now.toLocaleDateString() + ' ' + now.toLocaleTimeString() + '\r\n' +
      'Current Battery Level: ' + currentBatteryLevel + '\r\n' +
      'Currently Fully Charged: ' + fullyCharged + '\r\n' +
      'Currently Charging: ' + isCharging + '\r\n' +
      'Currently Charging With High Wattage (Such as an Apple Adapter): ' + isChargingWithHighWattage + '\r\n'
    );
  } else {
    if (typeof options.logFilePath === 'string') {
      options.logFilePath = options.logFilePath.replace(/\.txt$/, '.json');
    }

    output = {
      dateTime: now.toLocaleDateString() + ' ' + now.toLocaleTimeString(),
      currentBatteryLevel,
      fullyCharged,
      isCharging,
      isChargingWithHighWattage
    };
  }

  if (options.enabled) {
    if(currentBatteryLevel <= options.lowWarningThreshold && !isChargingWithHighWattage) {
      const message = 'Battery is low. Plug in now!';
      options.speechEnabled && say.speak(message);
      options.outputFormat === 'string' ? output += `  ${message}\r\n` : output.message = message;
    } else if (currentBatteryLevel >= options.highWarningThreshold && (fullyCharged || isChargingWithHighWattage)) {
      const message = 'Battery is sufficiently charged. Unplug now!';
      options.speechEnabled && say.speak(message);
      options.outputFormat === 'string' ? output += `  ${message}\r\n` : output.message = message;
    }
  }

  if (options.loggingEnabled) {
    console.log(output);

    if (options.logFilePath) {
      const lastLogLines = await readLastLine.read(options.logFilePath, 500);
      const updatedLog = lastLogLines ? lastLogLines + '\r\n' + output : output;
      fs.writeFileSync(options.logFilePath, updatedLog);
    }
  }

  // prompt more often when battery is low
  const checkRepeatTime = currentBatteryLevel <= options.lowWarningThreshold ? options.checkRepeatTimeLow : options.checkRepeatTimeHigh;
  // check again and repeat the prompt
  if (options.continuous) {
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
    if (!options.continuous) {
      console.log('To run in continuous mode, add the "--continuous" argument to the command line.\r\n');
    }
    console.log('Continuous mode: ' + options.continuous + '\r\n');
    checkChargeStatus({...options});
  })();
}

module.exports = {
  options,
  checkChargeStatus
};
