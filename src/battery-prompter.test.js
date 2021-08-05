const batteryPrompter = require('./battery-prompter');

// TODO: get mocked functions working
// const getBatteryLevel = jest.fn().mockImplementation(() => Promise.resolve(72));
// const testFixtures = require('./testFixtures');

test('reports battery level', async() => {
  const result = await batteryPrompter.checkChargeStatus({
    ...batteryPrompter.options,
    loggingEnabled: false
  });
  const resultList = result.split('\r\n');
  expect(resultList[1]).toMatch(/Current Battery Level: \d{1,3}/);
});

test('reports battery fully charged', async() => {
  const result = await batteryPrompter.checkChargeStatus({
    ...batteryPrompter.options,
    loggingEnabled: false
  });
  const resultList = result.split('\r\n');
  expect(resultList[2]).toMatch(/Currently Fully Charged: (true|false)/);
});

test('reports battery charging', async() => {
  const result = await batteryPrompter.checkChargeStatus({
    ...batteryPrompter.options,
    loggingEnabled: false
  });
  const resultList = result.split('\r\n');
  expect(resultList[3]).toMatch(/Currently Charging: (true|false)/);
});

test('reports battery charging with high wattage', async() => {
  const result = await batteryPrompter.checkChargeStatus({
    ...batteryPrompter.options,
    loggingEnabled: false
  });
  const resultList = result.split('\r\n');
  expect(resultList[4]).toMatch(/Currently Charging With High Wattage \(Such as an Apple Adapter\): (true|false)/);
});
