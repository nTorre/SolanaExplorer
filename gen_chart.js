const echarts = require('echarts');

// In SSR mode the first container parameter is not required
const chart = echarts.init(null, null, {
  renderer: 'svg', // must use SVG rendering mode
  ssr: true, // enable SSR
  width: 400, // need to specify height and width
  height: 300
});

// use setOption as normal
chart.setOption({
  xAxis: {
    data: ['2017-10-24', '2017-10-25', '2017-10-26', '2017-10-27']
  },
  yAxis: {},
  series: [
    {
      type: 'candlestick',
      data: [
        [20, 34, 10, 38],
        [38, 35, 30, 50],
        [50, 38, 33, 44],
        [44, 15, 5, 42]
      ]
    }
  ]
});

// Output a string
const svgStr = chart.renderToSVGString();

// If chart is no longer useful, consider dispose it to release memory.
chart.dispose();
console.log(svgStr);
