const d3 = require('d3');
const chroma = require('chroma-js');
const topojson = require('topojson');
const colorbrewer = require('colorbrewer');
d3.swoopyDrag = require('d3-swoopy-drag').swoopyDrag
d3.scaleInteractive = require('d3-scale-interactive').scaleInteractive


const margin = {top: 70, bottom: 15, right: 10, left: 10}
const chart = sschart()
const el = d3.select('#self-sufficiency')

let width = 0
let height = 0
let chartWidth = 0
let chartHeight = 0

const formatSalary = d3.format("$,")
const formatDollars = d3.format("$.2f")
const formatPercent = d3.format(".1%")
const formatK = d3.format("$.2s")
let projection = d3.geoAlbers().parallels([34, 40.5]).rotate([120, 0])
let path = d3.geoPath();
let colorScale = d3.scaleThreshold()


window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
const mobile = window.mobilecheck()

var sstooltip = d3.select("body").append("div")
  .attr("class", "sstooltip")
  .on("click",function(){
    sstooltip.style("visibility","hidden");
})

sstooltip.append("div")
  .attr("class", "sstooltip-header")
  .text("California Statewide Average")

sstooltip.append("div")
  .attr("class", "ss-header")
  .text("Self-Sufficiency Wage")


var wageRows = sstooltip.append("div")
  .attr("class", "wage-rows")

var wages = ['Yearly', 'Monthly', "Hourly"]

var wageRow = wageRows.selectAll(".wage-row")
  .data(wages)
  .enter()
  .append("div")
  .attr("class", "wage-row")

wageRow.append("div")
  .attr("class", "wage-type")

wageRow.append("div")
  .attr("class", "wage-amount")

sstooltip.append("div")
  .attr("class", "budget-header")
  .text("Monthly Budget")

var costtable = sstooltip.append("div")
.attr("class", "type-table")

var costs = ["Housing", "Food", "Child Care", "Healthcare", "Transportation", "Miscellaneous", "Taxes"]

var tablerow = costtable.selectAll(".table-row")
  .data(costs)
  .enter()
  .append("div")
  .attr("class", "table-row")

tablerow.append("div")
.attr("class", "table-type")

tablerow.append("div")
.attr("class", "table-amount")

tablerow.append("div")
.attr("class", "table-percent")

const annotations = [
  {
    "two_adults": 56160,
    "snap_threshold": 49200,
    "self_sufficiency": 125995,
    "i": 2,
    "path": "M35,30L0,0",
    "text": "In San Mateo, two adults working full-time making minimum wage would be ineligible for SNAP.",
    "textOffset": [43, 11]
  },
  {
    "two_adults": 62400,
    "snap_threshold": 49200,
    "self_sufficiency": 123442,
    'i': 3.5,
    "path": "M35,30L0,0",
    "text": "In SF, minimum wage increased to $15.00 on July 1, 2018, widening the gap for SNAP eligibility.",
    "textOffset": [43, 11]
  }
]

function resize() {
  const width = window.innerWidth
  const height = window.innerWidth > 514 ? 600 : window.innerWidth * (600/514)
  chart.width(width).height(height)
  el.call(chart)
}

function sschart() {
  
  function enter({ container, data }) {
  	const svg = container.selectAll('svg').data([data])
    const svgEnter = svg.enter().append('svg').attr("class", "selfsufficiency-svg")
    const gEnter = svgEnter.append('g')
    gEnter.append("g").attr("class", "sscounties")
    gEnter.append("g").attr("class", "california-cities")
    svgEnter.append("g").attr("class", "legend")

  }

  function updateScales({ container, data }) {  
    // const max = d3.max(data.objects.counties.geometries, d => d['properties']['Annual Self-Sufficiency Wage'])
    // const min = d3.min(data.objects.counties.geometries, d => d['properties']['Annual Self-Sufficiency Wage'])
    // colorScale
    //   .domain([55000, 60000, 65000, 70000, 75000, 80000, 90000, 110000, 130000])
    //   .range(d3.schemeOrRd[9])

    const svg = container.select('svg')
    const g = svg.select('g')
    const legend = svg.select(".legend")

    const scaleDomain = [60000, 65000, 70000, 75000, 80000, 90000, 110000, 130000]
    const rectWidth = window.innerWidth > 514 ? 450/scaleDomain.length : chartWidth * 0.9 / scaleDomain.length
    const rectHeight = 10

    colorScale
      .domain(scaleDomain)
      .range(d3.schemeOrRd[8])

    // fontScale
    //   .domain([0, 17.13])
    //   .range([14, 3])
    
    const legendRect = legend.selectAll(".legend-rect")
      .data(scaleDomain)
    legendRect
      .enter()
      .append("rect")
      .attr("class", "legend-rect")
    .merge(legendRect)  
      .attr("x", (d, i) => i * rectWidth)
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("fill", d => colorScale(d-1))

    const tickg = legend.selectAll(".tick-g")
      .data(scaleDomain.slice(0, -1))

    const tickGEnter = tickg
      .enter()
      .append("g")
      .attr("class", "tick-g")
    .merge(tickg)
      .attr("transform", (d, i) => `translate(${(i+1)*rectWidth}, 0)`)

    const tickLine = tickGEnter.selectAll(".tick-line")
      .data(d => [d])
    tickLine
      .enter()
      .append("line")
      .attr("class", "tick-line")
    .merge(tickLine)
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", (d, i) => 0)
      .attr("y2", (d, i) => rectHeight * 2)

    const tickText = tickGEnter.selectAll(".tick-text")
      .data(d => [d])

    tickText
      .enter()
      .append("text")
      .attr("class", "tick-text")
    .merge(tickText)
      .attr("x", 0)
      .attr("y", rectHeight * 2.75)
      .text(d => formatK(d))

    const legendAnno = svg.selectAll(".legend-anno")
      .data([[scaleDomain]])

    legendAnno
      .enter()
      .append("text")
      .attr("class", "legend-anno")
    .merge(legendAnno)
      .text("Annual Self-Sufficiency Wage")
      .attr("x", width/2)
      .attr("y", 20)


    const legendWidth = legend.node().getBoundingClientRect().width
    legend.attr("transform", `translate(${width/2 - (legendWidth/2)}, ${margin.top*2/5})`)
  


  }

  function updateDom({ container, data }) {

  	const svg = container.select('svg')
  	svg
      .attr('width', width)
      .attr('height', height)

    const g = svg.select('g')

    g.attr('transform', `translate(${margin.left}, ${margin.top})`)

    const counties = g.select(".sscounties")
    const cities = g.select(".california-cities")

    projection
      .fitExtent([[0,0], [chartWidth,chartHeight]], topojson.feature(data, data.objects.counties))
    path.projection(projection)

    //var colorScale = d3.scaleInteractive('color', updateChart).scaleThreshold().domain([50000, 55000, 60000, 65000, 70000, 80756, 107295, 130000]).range(d3.schemeOrRd[8]);
 

    const county = counties
      .selectAll(".county")
      .data(topojson.feature(data, data.objects.counties).features)
      //.data(data.features)


    county
      .enter()
      .append("path")
      .attr("class", "county")
    .merge(county)
      .attr("fill", d => colorScale(d['properties']['Annual Self-Sufficiency Wage']))
      .attr("d", path)
      .on("mouseover", function(d) {
          d3.select(this).moveToFront()
          //mouseOverHandler(d['properties'])
        })
        .on("mousemove", d => {
          mouseMoveHandler(d['properties'])
        })
        .on("mouseout", d => {
          sstooltip.style("visibility", "hidden")
        })

    const cityG = cities.selectAll(".california-city-g")
      .data(california_cities)

    const city = cityG
      .enter()
      .append("g")
      .attr("class", "california-city-g")
    .merge(cityG)
      .attr("transform", d => {
        return `translate(${projection([d['lng'], d['lat']])[0]}, ${projection([d['lng'], d['lat']])[1]})`
      })

    const cityCircle = city.selectAll(".city-circle")
      .data(d => [d])

    cityCircle
      .enter()
      .append("circle")
      .attr("class", "city-circle")
    .merge(cityCircle)
      .attr("r", 3)

    const cityText = city.selectAll(".city-text")
      .data(d => [d])

    cityText
      .enter()
      .append("text")
      .attr("class", "city-text")
    .merge(cityText)
      .text(d => d['city'])
      .attr("x", 10)


    function mouseMoveHandler(d) {

      sstooltip
        .style("visibility", "visible")
        .style("top", () => {
          const tooltipheight = sstooltip.node().getBoundingClientRect().height
          const bottomcutoff = window.innerHeight - tooltipheight/2 - 20
          const topcutoff = tooltipheight/2 + 20
          if (d3.event.pageY - pageYOffset <= bottomcutoff && d3.event.pageY - pageYOffset >= topcutoff) {
            return (d3.event.pageY - (tooltipheight/2)) + "px"
          } else if (d3.event.pageY - pageYOffset > bottomcutoff) {
            return (d3.event.pageY - tooltipheight) + "px"
          } else {
            return (d3.event.pageY) + "px"
          } 
        })
        .style("left", () => {
          const tooltipwidth = sstooltip.node().getBoundingClientRect().width
          if (mobile || window.innerWidth <= 600) {
            const offset = (window.innerWidth - tooltipwidth)/2
            return offset + "px"

          } else {
            if (d3.event.pageX + tooltipwidth + 30 >= window.innerWidth) {
              return (d3.event.pageX - tooltipwidth - 30) +"px"
            } else {
              return (d3.event.pageX + 30) +"px"
            }
          }
        })

      var wageRows = sstooltip.select(".wage-rows")
      var costtable = sstooltip.select(".type-table")

      const sum = d['Housing Costs'] + d['Food Costs'] + d['Child Care Costs'] + d['Health Care Costs'] + d['Transportation Costs'] + d['Miscellaneous costs'] + d['Emergency Savings']
      const costs = [{type: "Housing", cost: d['Housing Costs'], percent: d['Housing Costs']/sum},
      {type: "Food", cost: d['Food Costs'], percent: d['Food Costs']/sum},
      {type: "Child Care", cost: d['Child Care Costs'], percent: d['Child Care Costs']/sum},
      {type: "Health Care", cost: d['Health Care Costs'], percent: d['Health Care Costs']/sum},
      {type: "Transportation", cost: d['Transportation Costs'],percent: d['Transportation Costs']/sum},
      {type: "Miscellaneous", cost: d['Miscellaneous costs'], percent: d['Miscellaneous costs']/sum},
      //{type: "Emergency", cost: d['Emergency Savings'], percent: d['Miscellaneous costs']/sum},
      {type: "Taxes", cost: d['Taxes'], percent: d['Taxes']/sum}]




      sstooltip.select(".sstooltip-header")
        .text(d['County'])

      const wages = [{type: 'Yearly', amount: d['Annual Self-Sufficiency Wage']}, 
          {type: 'Monthly',  amount: d['Monthly Self-Sufficiency Wage']}, 
          {type: 'Hourly', amount: d['Hourly Self-Sufficiency Wage']}]

      wageRowEnter = wageRows.selectAll(".wage-row")
        .data(wages)

      var wageRow = wageRowEnter
        .enter()
        .append("div")
        .attr("class", "wage-row")
      .merge(wageRowEnter)

      wageRow.select(".wage-type")
        .text(d => d['type'])

      wageRow.select(".wage-amount")
        .text((d,i) => i == 2 ? formatDollars(d['amount']) : formatSalary(d['amount']))

      tablerowEnter = costtable.selectAll(".table-row")
        .data(costs)

      tablerow = tablerowEnter
        .enter()
        .append("div")
        .attr("class", "table-row")
      .merge(tablerowEnter)

      tablerow.select(".table-type")
        .text(d =>  d['type'])

      tablerow.select(".table-amount")
        .text(d => formatSalary(d['cost']))

      tablerow.select(".table-percent")
        .text(d => formatPercent(d['percent']))

    }
   
	}

  function chart(container) {
    const data = container.datum()
    enter({ container, data })
    updateScales({ container, data })
    updateDom({ container, data })

  }

  chart.width = function(...args) {
    if (!args.length) return width
    width = args[0]
    chartWidth = width - margin.left - margin.right

  

    return chart
  }

  chart.height = function(...args) {
    if (!args.length) return height
    height = args[0]
    chartHeight = height - margin.top - margin.bottom
    return chart
  }
  return chart
}

function clean_data() {
  selfsufficiency_data.objects.counties.geometries.map(d => {
    d['properties']['Annual Self-Sufficiency Wage'] = +d['properties']['Annual Self-Sufficiency Wage'].trim().replace("$", "").replace(",", "")
    d['properties']['Child Care Costs'] = +d['properties']['Child Care Costs'].trim().replace("$", "").replace(",", "")
    d['properties']['Emergency Savings'] = +d['properties']['Emergency Savings'].trim().replace("$", "").replace(",", "")
    d['properties']['Food Costs'] = +d['properties']['Food Costs'].trim().replace("$", "").replace(",", "")
    d['properties']['Health Care Costs'] = +d['properties']['Health Care Costs'].trim().replace("$", "").replace(",", "")
    d['properties']['Hourly Self-Sufficiency Wage'] = +d['properties']['Hourly Self-Sufficiency Wage'].trim().replace("$", "").replace(",", "")
    d['properties']['Housing Costs'] = +d['properties']['Housing Costs'].trim().replace("$", "").replace(",", "")
    d['properties']['Miscellaneous costs'] = +d['properties']['Miscellaneous costs'].trim().replace("$", "").replace(",", "")
    d['properties']['Monthly Self-Sufficiency Wage'] = +d['properties']['Monthly Self-Sufficiency Wage'].trim().replace("$", "").replace(",", "")
    d['properties']['Taxes'] = +d['properties']['Taxes'].trim().replace("$", "").replace(",", "")
    d['properties']['Transportation Costs'] = +d['properties']['Transportation Costs'].trim().replace("$", "").replace(",", "")
    return d
  })
}
function init() {
	el.datum(selfsufficiency_data)
  resize()
  window.addEventListener('resize', resize)
}


clean_data() 
init()

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
