const fs = require("fs");
const fetch = require("node-fetch");

const outputFile = "output.csv";

// Kroger Co - KR Campbell Soup - CPB Tesla - TSLA
const orders = [
  { stockSymbol: "KR", quantity: 1000, type: "buy", date: "2019-01-01" },
  { stockSymbol: "CPB", quantity: 510, type: "buy", date: "2019-01-01" },
  { stockSymbol: "TSLA", quantity: 20, type: "buy", date: "2019-01-01" }
];

//create currency formatter
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2
});

let totalValue = 0;

main();

async function main() {
  await setup();
  for (let i = 0; i < orders.length; i++) {
    //create an output object
    let output = {
      ticker: orders[i].stockSymbol,
      quantity: orders[i].quantity,
      currentPrice: 0,
      high: 0,
      low: 0,
      currentValue: 0
    };

    //create blank array to hold historical data
    let historical = [];

    //use node fetch api to get stock data
    output.currentPrice = await fetchRealTimePrice(orders[i].stockSymbol);
    historical = await fetchHistoricalData(
      orders[i].stockSymbol,
      orders[i].date
    );

    formatAndWriteData(historical, output);
  }
  formatAndWriteTotal();
}

function setup() {
  //clear output file asynchronously
  return new Promise(function(resolve, reject) {
    fs.writeFile(outputFile, "", function() {
      resolve();
    });
  });
}

function fetchRealTimePrice(stock) {
  if (stock) {
    //return a promise that will resolve once the json is returned
    return new Promise(function(resolve, reject) {
      fetch(
        `https://financialmodelingprep.com/api/v3/stock/real-time-price/${stock}`
      )
        .then(response => response.json())
        .then(json => resolve(json.price));
    });
  }
}

function fetchHistoricalData(stock, date) {
  const today = new Date().toJSON().slice(0, 10);
  //return a promise that will resolve once the json is returned
  if (stock && date) {
    return new Promise(function(resolve, reject) {
      fetch(
        `https://financialmodelingprep.com/api/v3/historical-price-full/${stock}?from=${date}&to=${today}`
      )
        .then(response => response.json())
        .then(json => resolve(json.historical));
    });
  }
}
//formatAndWriteTotal();

//test and validate (jest)

function formatAndWriteData(historical, output) {
  //search through historical and find lowest low and highest high
  historical.forEach((day, index) => {
    if (index === 0) (output.high = day.high), (output.low = day.low);
    if (day.high > output.high) output.high = day.high;
    if (day.low < output.low) output.low = day.low;
  });

  //calculate current value
  output.currentValue = output.quantity * output.currentPrice;

  //add to total value
  totalValue += output.currentValue;

  //format currency values
  output.currentPrice = formatter.format(output.currentPrice);
  output.high = formatter.format(output.high);
  output.low = formatter.format(output.low);
  output.currentValue = formatter.format(output.currentValue);

  //write record to output.csv, assume utf-8 encoding
  const dataString =
    output.ticker +
    "," +
    output.quantity +
    "," +
    output.currentPrice +
    "," +
    output.high +
    "," +
    output.low +
    "," +
    output.currentValue;

  fs.appendFileSync(outputFile, dataString + "\n");
  console.log("Wrote order " + dataString + " to " + outputFile);
}

function formatAndWriteTotal() {
  //format totalValue
  totalValue = formatter.format(totalValue);

  //write totalValue record
  fs.appendFileSync(outputFile, ",,,,," + totalValue);
  console.log("Wrote total value: " + totalValue + " to " + outputFile);
}
