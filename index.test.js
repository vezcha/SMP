const app = require("./index.js");
const fs = require("fs");

//test if app is able to setup and clear output file
test("clear output file", () => {
  return app.setup().then(expect(fs.statSync(app.outputFile).size).toEqual(0));
});

//test if app is able to fetch real time price data from api
test("fetch real time stock price from api", () => {
  return app.fetchRealTimePrice("KO").then(data => {
    expect(data).toBeGreaterThan(0);
  });
});

//test if app is able to fetch historical stock data from api
test("fetch historical stock data from api", () => {
  return app.fetchHistoricalData("KO", "2019-01-01").then(data => {
    expect(data.length).toBeGreaterThan(0);
  });
});

//test if app is able to calculate the stock data correctly
test("calculate the stock data", () => {
  let historical = [
    {
      date: "2020-03-02",
      open: 7.11,
      high: 7.23,
      low: 6.88,
      close: 7.2,
      adjClose: 7.2,
      volume: 9.6766e7,
      unadjustedVolume: 9.6766e7,
      change: -0.09,
      changePercent: -1.266,
      vwap: 7.10333,
      label: "March 02, 20",
      changeOverTime: -0.01266
    },
    {
      date: "2020-03-03",
      open: 7.29,
      high: 7.34,
      low: 6.89,
      close: 6.97,
      adjClose: 6.97,
      volume: 9.74578e7,
      unadjustedVolume: 9.74578e7,
      change: 0.32,
      changePercent: 4.39,
      vwap: 7.06667,
      label: "March 03, 20",
      changeOverTime: 0.0439
    },
    {
      date: "2020-03-04",
      open: 7.09,
      high: 7.09,
      low: 6.92,
      close: 7.08,
      adjClose: 7.08,
      volume: 7.05881e7,
      unadjustedVolume: 7.05881e7,
      change: 0.01,
      changePercent: 0.141,
      vwap: 7.03,
      label: "March 04, 20",
      changeOverTime: 0.00141
    },
    {
      date: "2020-03-05",
      open: 6.96,
      high: 6.97,
      low: 6.71,
      close: 6.74,
      adjClose: 6.74,
      volume: 7.80254e7,
      unadjustedVolume: 7.80254e7,
      change: 0.22,
      changePercent: 3.161,
      vwap: 6.80667,
      label: "March 05, 20",
      changeOverTime: 0.03161
    }
  ];
  let output = {
    ticker: "F",
    quantity: 5,
    currentPrice: 6.74,
    high: 0,
    low: 0,
    currentValue: 0
  };
  var totalValue = 0;

  app.calcStockData(historical, output, totalValue);

  expect(output.high).toEqual(7.34);
  expect(output.low).toEqual(6.71);
  expect(output.currentValue).toEqual(33.7);
});

//test if app is able to format the data correctly
test("format the stock values correctly", () => {
  let output = {
    ticker: "A",
    quantity: 35,
    currentPrice: 80.46,
    high: 85,
    low: 77.24,
    currentValue: 2816.1
  };

  app.formatData(output);

  expect(output.currentPrice).toEqual("$80.46");
  expect(output.high).toEqual("$85.00");
  expect(output.low).toEqual("$77.24");
  expect(output.currentValue).toEqual('"$2,816.10"');
});

//test if app is able to write a line to output file
test("write data line to csv", () => {
  let output = {
    ticker: "B",
    quantity: 28,
    currentPrice: "$52.56",
    high: "$57.06",
    low: "$51.83",
    currentValue: '"$1,471.68"'
  };

  return app.setup().then(() => {
    app.writeDataAsCSV(output);
    const fileString = fs.readFileSync(app.outputFile, "utf8");
    expect(fileString).toMatch('B,28,$52.56,$57.06,$51.83,"$1,471.68"');
  });
});

//test if app is able to write the final total to output file
test("format and write the total value to the csv", () => {
  return app.setup().then(() => {
    app.totalValue = 18457.12;
    expect(app.totalValue).toEqual(18457.12);
    app.formatAndWriteTotal(app.totalValue);

    const fileString = fs.readFileSync(app.outputFile, "utf8");
    expect(fileString).toMatch(',,,,,"$18,457.12"');
  });
});
