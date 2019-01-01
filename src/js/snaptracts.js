const d3 = require('d3');
const chroma = require('chroma-js');
const topojson = require('topojson');
const colorbrewer = require('colorbrewer');
d3.swoopyDrag = require('d3-swoopy-drag').swoopyDrag
d3.scaleInteractive = require('d3-scale-interactive').scaleInteractive


const margin = {top: 70, bottom: 15, right: 10, left: 10}
const chart = stchart()
const el = d3.select('#snap-map')

let width = 0
let height = 0
let chartWidth = 0
let chartHeight = 0
let active = d3.select(null);
let zoomScale = 0
const formatSalary = d3.format("$,")
const formatPop = d3.format(",")
const formatDollars = d3.format("$.2f")
const formatPercent = d3.format(".0%")

let projection = d3.geoAlbers().parallels([34, 40.5]).rotate([120, 0])
let path = d3.geoPath()


//let colorScale = d3.scaleThreshold()
let colorScale = chroma.scale('OrRd')
let fontScale = d3.scaleLinear()

window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
const mobile = window.mobilecheck()

var sttooltip = d3.select("body").append("div")
  .attr("class", "sttooltip")
  .on("click",function(){
    sttooltip.style("visibility","hidden");
})

sttooltip.append("div")
  .attr("class", "sttooltip-tract")

sttooltip.append("div")
  .attr("class", "sttooltip-county")


sttooltip.append("div")
  .attr("class", "sttooltip-population")


sttooltip.append("div")
  .attr("class", "sttooltip-header")
  .text("Demographics")


var raceRows = sttooltip.append("div")
  .attr("class", "race-rows")

var races = ['White', 'Black', "Hispanic", "Asian", "Other"]

var raceRow = raceRows.selectAll(".race.row")
  .data(races)
  .enter()
  .append("div")
  .attr("class", "race row")

raceRow.append("div")
  .attr("class", "race type")
raceRow.append("div")
  .attr("class", "race percent")


sttooltip.append("div")
  .attr("class", "sttooltip-header")
  .text("Income and Spending")

var incomes = ['Median Income', "% income spent on rent"]
var incomeRows = sttooltip.append("div")
  .attr("class", "income-rows")

var incomeRow = incomeRows.selectAll(".income.row")
  .data(incomes)
  .enter()
  .append("div")
  .attr("class", "income row")

incomeRow.append("div")
  .attr("class", "income type")
incomeRow.append("div")
  .attr("class", "income percent")

sttooltip.append("div")
  .attr("class", "sttooltip-header")
  .text("Other Factors")

var risks = ['SNAP rate', "Unemployment rate", "Uninsured rate", "Public Assistance Rate"]
var riskRows = sttooltip.append("div")
  .attr("class", "risk-rows")
var riskRow = riskRows.selectAll(".risk.row")
  .data(risks)
  .enter()
  .append("div")
  .attr("class", "risk row")

riskRow.append("div")
  .attr("class", "risk type")
riskRow.append("div")
  .attr("class", "risk percent")

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

function stchart() {
  
  function enter({ container, data }) {
    const svg = container.selectAll('svg').data([data])
    const svgEnter = svg.enter().append('svg').attr("class", "snap-svg")
    svgEnter.append("rect").attr("class", "background")
    
    const gEnter = svgEnter.append('g').attr("class", "parent-g")
    
    
   
   
    
    gEnter.append("g").attr("class", "tracts")
    gEnter.append("g").attr("class", "countyOutlines")
    gEnter.append("g").attr("class", "counties")
    gEnter.append("g").attr("class", "big-cities")
    svgEnter.append("g").attr("class", "legend")
    
  }

  function updateScales({ container, data }) {  
    // const max = d3.max(data.objects.counties.geometries, d => d['properties']['Annual Self-Sufficiency Wage'])
    // const min = d3.min(data.objects.counties.geometries, d => d['properties']['Annual Self-Sufficiency Wage'])
    const svg = container.select('svg')
    const g = svg.select('.parent-g')
    const legend = svg.select(".legend")

    const scaleDomain = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35]
    const rectWidth = window.innerWidth > 514 ? 450/scaleDomain.length : chartWidth * 0.9 / scaleDomain.length
    const rectHeight = 10

    /*colorScale
      .domain(scaleDomain)
      .range(d3.schemeOrRd[8])*/

    colorScale
      .domain([0, 0.3])

    fontScale
      .domain([0, 17.13])
      .range([14, 3])
    


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
      .attr("fill", d => colorScale(d-0.025))

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
      .text(d => formatPercent(d))

    const legendAnno = svg.selectAll(".legend-anno")
      .data([[scaleDomain]])

    legendAnno
      .enter()
      .append("text")
      .attr("class", "legend-anno")
    .merge(legendAnno)
      .text("Percent of households that receive SNAP")
      .attr("x", width/2)
      .attr("y", 20)


    const legendWidth = legend.node().getBoundingClientRect().width
    legend.attr("transform", `translate(${width/2 - (legendWidth/2)}, ${margin.top*2/5})`)

  }

  function updateDom({ container, data }) {
    /*console.log(data.features.map(d => d['properties']['Annual Self-Sufficiency Wage']).sort(function(x, y){
      return d3.descending(x, y);
    }))*/
    const svg = container.select('svg')
    
    svg
      .attr('width', width)
      .attr('height', height)

    const g = svg.select('.parent-g')

    g.attr('transform', `translate(${margin.left}, ${margin.top})`)
  
    const background = svg.select(".background")
    const countyOutlines = g.select(".countyOutlines")
    const counties = g.select(".counties")
    const tracts = g.select(".tracts")
    const cities = g.select(".big-cities")
    const legend = svg.select(".legend")

    background
      .attr("width", width)
      .attr("height", height)
      .on("click", reset)

    projection
      .fitExtent([[0,0], [chartWidth,chartHeight]], topojson.feature(data, data.objects.tracts))

    
    path.projection(projection)

    //var colorScale = d3.scaleInteractive('color', updateChart).scaleThreshold().domain([50000, 55000, 60000, 65000, 70000, 80756, 107295, 130000]).range(d3.schemeOrRd[8]);
 

    const tract = tracts
      .selectAll(".tract")
      .data(topojson.feature(data, data.objects.tracts).features)


    tract
      .enter()
      .append("path")
      .attr("class", "tract")
    .merge(tract)
      .attr("fill", d => colorScale(d['properties']['pct_snap']))
      .attr("d", path)
      .attr("stroke-width", 0)
      .on("mouseover", function(d) {
        d3.select(this).moveToFront()
        d3.select(this).attr("stroke-width", fontScale(zoomScale)/28)
      })
      .on("mousemove", d => {
        mouseMoveHandler(d['properties'])
      })
      .on("mouseout", function(d) {
         sttooltip.style("visibility", "hidden")
      })

    const countyOutline = countyOutlines
      .selectAll(".county-outline")
      .data(topojson.feature(data, data.objects.counties2).features)

     countyOutline
      .enter()
      .append("path")
      .attr("class", "county-outline")
    .merge(countyOutline)
      .attr("d", path)
      .attr("stroke-width", fontScale(0)/14)
      .attr("stroke", "white")


    const county = counties
      .selectAll(".county")
      .data(topojson.feature(data, data.objects.counties).features)

     county
      .enter()
      .append("path")
      .attr("class", "county")
    .merge(county)
      .attr("d", path)
      .attr("stroke-width", fontScale(0)/10)
      .on("click", function(d) { 
        clickHandler(this, d)
      })

    const cityG = cities.selectAll(".bay-area-city-g")
      .data(cities_data)


    const city = cityG
      .enter()
      .append("g")
      .attr("class", "bay-area-city-g")
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
      .attr("r", fontScale(0)/6)
      .attr("stroke-width", fontScale(0)/14)

    const cityText = city.selectAll(".city-text")
      .data(d => [d])

    cityText
      .enter()
      .append("text")
      .attr("class", "city-text")
    .merge(cityText)
      .attr("text-anchor", d => d['anchor'])
      .text(d => d['city'])
      .attr("x", d => d['anchor'] == "end" ? -fontScale(0)/2 : fontScale(0)/2)
      .attr("font-size", fontScale(0))




    function mouseMoveHandler(d) {
      sttooltip
        .style("visibility", "visible")
        .style("top", () => {
          const tooltipheight = sttooltip.node().getBoundingClientRect().height
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
          const tooltipwidth = sttooltip.node().getBoundingClientRect().width
          if (mobile || window.innerWidth <= 600) {
            const offset = (window.innerWidth - tooltipwidth)/2
            return offset + "px"

          } else {
            if (d3.event.clientX + tooltipwidth + 30 >= window.innerWidth) {
              return (d3.event.clientX - tooltipwidth - 30) +"px"
            } else {
              return (d3.event.clientX + 30) +"px"
            }
          }
        })

      const races = [{type: 'White', percent: d['pct_white']},
      {type: 'Black', percent: d['pct_black']},
      {type: 'Hispanic', percent: d['pct_hispan']},
      {type: 'Asian', percent: d['pct_asian']},
      {type: 'Other', percent: d['pct_native'] + d['pct_pac_is'] + d['pct_other_'] + d['pct_two_ra']}]
      const incomes = [{type: 'Median income', percent: d['median_inc']},
      {type: '% income spent on rent', percent: d['median_per']}]
      const risks = [{type: '% on SNAP', percent: d['pct_snap']},
      {type: '% unemployed', percent: d['pct_unemp']},
      {type: '% uninsured', percent: d['pct_uninsu']},
      {type: '% on public assistance', percent: d['pct_pai']}]



      sttooltip.select(".sttooltip-tract")
        .text(d['name'].split(",")[0])

      sttooltip.select(".sttooltip-county")
        .text(d['name'].split(",")[1])

      sttooltip.select(".sttooltip-population")
        .text(`total population: ${formatPop(d['total_popu'])}`)

      raceRowEnter = raceRows.selectAll(".race.row")
        .data(races)

      var raceRow = raceRowEnter
        .enter()
        .append("div")
        .attr("class", "race row")
      .merge(raceRowEnter)

      raceRow.select(".race.type")
        .text(d => d['type'])

      raceRow.select(".race.percent")
        .text(d => formatPercent(d['percent']))

      incomeRowEnter = incomeRows.selectAll(".income.row")
        .data(incomes)

      var incomeRow = incomeRowEnter
        .enter()
        .append("div")
        .attr("class", "income row")
      .merge(incomeRowEnter)

      incomeRow.select(".income.type")
        .text(d => d['type'])

      incomeRow.select(".income.percent")
        .text((d,i) => i == 0 ? formatSalary(d['percent']) : `${Math.round(d['percent'])}%`)

      riskRowEnter = riskRows.selectAll(".risk.row")
        .data(risks)

      var riskRow = riskRowEnter
        .enter()
        .append("div")
        .attr("class", "risk row")
      .merge(riskRowEnter)

      riskRow.select(".risk.type")
        .text(d => d['type'])

      riskRow.select(".risk.percent")
        .text(d => formatPercent(d['percent']))

     

    }

    function clickHandler(selectedCounty, d) {
      const firstCoordinate = d['geometry']['coordinates'][0]
      d['geometry']['coordinates'] = [firstCoordinate]
      const clickedCounty = d
      
      active.classed("active", false);
      active = d3.select(selectedCounty).classed("active", true);

      var bounds = path.bounds(d),
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          scale = .9 / Math.max(dx / chartWidth, dy / chartHeight),
          translate = [(chartWidth / 2 - scale * x) + margin.left, (chartHeight / 2 - scale * y) + margin.top]

      zoomScale = scale

      g.transition()
        .duration(750)
        .attr("transform", `translate(${translate}) scale(${scale})`)

      g.selectAll(".city-text")
        .transition()
        .duration(750)
        .attr("font-size", `${fontScale(scale)/2}px`)
        .attr("x", d => d['anchor'] == "end" ? -fontScale(scale)/4 : fontScale(scale)/4)

      g.selectAll(".city-circle")
        .transition()
        .duration(750)
        .attr("r", fontScale(scale)/6)
        .attr("stroke-width", fontScale(scale)/28)

      g.selectAll(".county-outline")
        .attr("stroke", "none")

      g.selectAll(".county")
        .attr("stroke-width", 0)

      g.select(".counties").moveToBack()
    }

    function reset() {
      active.classed("active", false);
      active = d3.select(null);

      g.transition()
        .duration(750)
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      g.selectAll(".city-text")
        .transition()
        .duration(750)
        .attr("font-size", `${fontScale(0)}px`)
        .attr("x", d => d['anchor'] == "end" ? -fontScale(0)/2 : fontScale(0)/2)

      g.selectAll(".city-circle")
        .transition()
        .duration(750)
        .attr("r", fontScale(0)/6)
        .attr("stroke-width", fontScale(0)/14)

      g.selectAll(".county-outline")
        .attr("stroke", "white")

      g.selectAll(".county")
        .attr("stroke-width", fontScale(0)/10)

      g.select(".counties").moveToFront()
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


function init() {
  el.datum(snap_tract_data)
  resize()
  window.addEventListener('resize', resize)
}


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

d3.selection.prototype.moveToBack = function() {  
  return this.each(function() { 
      var firstChild = this.parentNode.firstChild; 
      if (firstChild) { 
          this.parentNode.insertBefore(this, firstChild); 
      } 
  });
};
