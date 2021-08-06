const batteryPrompter = require('./battery-prompter');

// add matchers to simplify testing
expect.extend({
  toContainMatch(stringArray, regex) {
    const matchIndex = stringArray.findIndex(item => item.match(regex));
    const pass = matchIndex >= 0;
    return {
      message: () => `expected ${stringArray} to contain match for ${regex}`,
      pass,
    };
  }
});

// base fixtures
const batteryPrompterOptions = {
  ...batteryPrompter.options,
  loggingEnabled: false,
  speechEnabled: false
}
const currentBatteryInfo = {
  batteryData: { stateOfCharge: 50 },
  fullyCharged: false,
  isCharging: true,
  adapterDetails: { watts: 15 }
};

// tests

test('reports battery level', async() => {
  const result = await batteryPrompter.checkChargeStatus(batteryPrompterOptions, currentBatteryInfo);
  expect(result).toMatch(/Current Battery Level: 50/);
});

test('reports battery fully charged', async() => {
  const result = await batteryPrompter.checkChargeStatus(batteryPrompterOptions, currentBatteryInfo);
  expect(result).toMatch(/Currently Fully Charged: false/);
});

test('reports battery charging', async() => {
  const result = await batteryPrompter.checkChargeStatus(batteryPrompterOptions, currentBatteryInfo);
  expect(result).toMatch(/Currently Charging: true/);
});

test('reports battery charging with high wattage', async() => {
  const result = await batteryPrompter.checkChargeStatus(batteryPrompterOptions, {
    ...currentBatteryInfo,
    adapterDetails: { watts: 15 }
  });
  expect(result).toMatch(/Currently Charging With High Wattage \(Such as an Apple Adapter\): (true|false)/);
});

test('reports plugin status', async() => {
  const result = await batteryPrompter.checkChargeStatus(batteryPrompterOptions, {
    ...currentBatteryInfo,
    adapterDetails: { watts: 15 },
    batteryData: { stateOfCharge: 5 }
  });
  expect(result).toMatch(/  Battery is low. Plug in now!/);
});

test('reports unplug status', async() => {
  const result = await batteryPrompter.checkChargeStatus(batteryPrompterOptions, {
    ...currentBatteryInfo,
    adapterDetails: { watts: 96 },
    batteryData: { stateOfCharge: 95 }
  });
  expect(result).toMatch(/  Battery is sufficiently charged. Unplug now!/);
});
