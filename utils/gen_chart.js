const moment = require('moment');
const svgToImg = require("svg-to-img");

const echarts = require('echarts');

function genChart(candles, path) {

  let xVals = getXAxis(candles);
  let { yVals, miny, maxy } = getYAxis(candles);
  let offset = maxy - miny;

  // close, open, min, max
  //xVals.pop();


  const chart = echarts.init(null, null, {
    renderer: 'svg', // must use SVG rendering mode
    ssr: true, // enable SSR
    width: 400, // need to specify height and width
    height: 300
  });

  // use setOption as normal
  chart.setOption({
    xAxis: {
      data: xVals,
    },
    yAxis: {
      min: miny - offset*0.2,
      max: maxy + offset*0.2,
      boundaryGap: false,
      axisLabel: {
        formatter: function (value) {
          // Se il valore è inferiore a 0.001, visualizzalo in notazione scientifica
          if (Math.abs(value) < 0.001) {
            return value.toExponential(2); // Notazione scientifica con 2 decimali
          } else {
            return value.toFixed(3); // Altrimenti, visualizzalo con 2 decimali
          }
        }
      }
    },
    series: [
      {
        type: 'candlestick',
        data: yVals
      }
    ],
    backgroundColor: '#000',
    textStyle: {
      color: '#fff'
    }
  });

  // Output a string
  const svgStr = chart.renderToSVGString();

  // If chart is no longer useful, consider dispose it to release memory.

  (async () => {
    const image = await svgToImg.from(svgStr).toPng({
      encoding: "base64",
      path: path
    });
  })();

  chart.dispose();

}

function getXAxis(candles) {
  let vals = []
  candles.forEach(candle => {
    vals.push(timestampToMMDDHHMM(candle.unixTime));
  });

  vals.pop();
  return vals.reverse();

}

function getYAxis(candles) {
  // close, open, min, max
  let vals = [[]]
  let candle = candles[0];
  let miny = Number(candle.low);
  let maxy = Number(candle.high);

  for (let i = 1; i < candles.length; i++) {
    let candle = candles[i];

    let mintmp = Number(candle.low);
    let maxtmp = Number(candle.high);

    if (mintmp < miny) miny = mintmp;
    if (maxtmp > maxy) maxy = maxtmp;

    let arr = [
      Number(candle.close),
      Number(candle.open),
      Number(candle.low),
      Number(candle.high)
    ];
    vals.push(arr);
  }

  // rimuovo l'ultima candela (è appena iniziata)
  vals.pop();
  vals.pop();

  return { yVals: vals.reverse(), miny: miny, maxy: maxy };
}


function timestampToMMDDHHMM(timestamp) {
  // Converto il timestamp in millisecondi in un oggetto moment
  const momentObj = moment(timestamp * 1000);

  // Formatto la data nel formato mm/dd hh:mm
  const formattedDate = momentObj.format('MM/DD HH:mm');

  return formattedDate;
}

testData = [
  {
    id: 590615,
    token_id: 731,
    close: '0.1405993930',
    high: '0.1405993930',
    low: '0.1405993930',
    open: '0.1405993930',
    type: '2H',
    unixTime: '1706781600',
    volume: '0.00000000000000000000'
  },
  {
    id: 590614,
    token_id: 731,
    close: '0.1405993930',
    high: '0.1405993930',
    low: '0.1243680558',
    open: '0.1280351495',
    type: '2H',
    unixTime: '1706774400',
    volume: '22960.61548000000000000000'
  },
  {
    id: 590613,
    token_id: 731,
    close: '0.1280351495',
    high: '0.1280351495',
    low: '0.1240189039',
    open: '0.1236609594',
    type: '2H',
    unixTime: '1706767200',
    volume: '1397.54645300000000000000'
  },
  {
    id: 590612,
    token_id: 731,
    close: '0.1236609594',
    high: '0.1307909379',
    low: '0.1236609594',
    open: '0.1326600470',
    type: '2H',
    unixTime: '1706760000',
    volume: '5693.73530400000000000000'
  },
  {
    id: 590611,
    token_id: 731,
    close: '0.1326600470',
    high: '0.1332216262',
    low: '0.1302925550',
    open: '0.1292763427',
    type: '2H',
    unixTime: '1706752800',
    volume: '2440.69899400000000000000'
  },
  {
    id: 590610,
    token_id: 731,
    close: '0.1292763427',
    high: '0.1331106271',
    low: '0.1292763427',
    open: '0.1339285288',
    type: '2H',
    unixTime: '1706745600',
    volume: '6045.99054900000100000000'
  },
  {
    id: 590609,
    token_id: 731,
    close: '0.1339285288',
    high: '0.1447119940',
    low: '0.1339285288',
    open: '0.1456877467',
    type: '2H',
    unixTime: '1706738400',
    volume: '7711.98473100000000000000'
  },
  {
    id: 590608,
    token_id: 731,
    close: '0.1456877467',
    high: '0.1470837960',
    low: '0.1235966151',
    open: '0.1353316743',
    type: '2H',
    unixTime: '1706731200',
    volume: '19607.14014600000000000000'
  },
  {
    id: 590607,
    token_id: 731,
    close: '0.1353316743',
    high: '0.1506490382',
    low: '0.1353316743',
    open: '0.1456124386',
    type: '2H',
    unixTime: '1706724000',
    volume: '9243.21521300000000000000'
  },
  {
    id: 590606,
    token_id: 731,
    close: '0.1456124386',
    high: '0.1548078045',
    low: '0.1426568333',
    open: '0.1463488185',
    type: '2H',
    unixTime: '1706716800',
    volume: '11925.69069599999800000000'
  },
  {
    id: 590605,
    token_id: 731,
    close: '0.1463488185',
    high: '0.1613362139',
    low: '0.1171411447',
    open: '0.1164746174',
    type: '2H',
    unixTime: '1706709600',
    volume: '31126.32667699999700000000'
  },
  {
    id: 590604,
    token_id: 731,
    close: '0.1164746174',
    high: '0.1226938704',
    low: '0.1164746174',
    open: '0.1217893463',
    type: '2H',
    unixTime: '1706702400',
    volume: '4269.16148100000000000000'
  },
  {
    id: 590603,
    token_id: 731,
    close: '0.1217893463',
    high: '0.1217893463',
    low: '0.1170607810',
    open: '0.1166332448',
    type: '2H',
    unixTime: '1706695200',
    volume: '4897.42304900000000000000'
  },
  {
    id: 590602,
    token_id: 731,
    close: '0.1166332448',
    high: '0.1191065728',
    low: '0.1131109831',
    open: '0.1099301340',
    type: '2H',
    unixTime: '1706688000',
    volume: '7096.72830099999900000000'
  },
  {
    id: 590601,
    token_id: 731,
    close: '0.1099301340',
    high: '0.1122408731',
    low: '0.1057819151',
    open: '0.1118795031',
    type: '2H',
    unixTime: '1706680800',
    volume: '6672.73020200000100000000'
  },
  {
    id: 590600,
    token_id: 731,
    close: '0.1118795031',
    high: '0.1118795031',
    low: '0.1061553891',
    open: '0.1039886785',
    type: '2H',
    unixTime: '1706673600',
    volume: '6469.56674700000000000000'
  },
  {
    id: 590599,
    token_id: 731,
    close: '0.1039886785',
    high: '0.1112284796',
    low: '0.1039886785',
    open: '0.1035386576',
    type: '2H',
    unixTime: '1706666400',
    volume: '11559.31766300000000000000'
  },
  {
    id: 590598,
    token_id: 731,
    close: '0.1035386576',
    high: '0.1251400298',
    low: '0.1021642579',
    open: '0.1246759207',
    type: '2H',
    unixTime: '1706659200',
    volume: '35038.98660400000000000000'
  },
  {
    id: 590597,
    token_id: 731,
    close: '0.1246759207',
    high: '0.1409841699',
    low: '0.1214218535',
    open: '0.1380490486',
    type: '2H',
    unixTime: '1706652000',
    volume: '18932.16220900000000000000'
  },
  {
    id: 590596,
    token_id: 731,
    close: '0.1380490486',
    high: '0.1548626059',
    low: '0.1380490486',
    open: '0.1551100621',
    type: '2H',
    unixTime: '1706644800',
    volume: '7870.12791200000000000000'
  },
  {
    id: 590595,
    token_id: 731,
    close: '0.1551100621',
    high: '0.1554232013',
    low: '0.1180261575',
    open: '0.1208808699',
    type: '2H',
    unixTime: '1706637600',
    volume: '22194.61981700000300000000'
  },
  {
    id: 211439,
    token_id: 731,
    close: '0.1549794278',
    high: '0.1717500005',
    low: '0.1549794278',
    open: '0.1704561462',
    type: '2H',
    unixTime: '1706392800',
    volume: '18954.10610300000000000000'
  }
];

// genChart(testData, "test.png")

module.exports = genChart;
