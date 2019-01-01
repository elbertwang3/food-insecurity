var d3 = require('d3');
d3.swoopyDrag = require('d3-swoopy-drag').swoopyDrag

const margin = {top: 135, bottom: 15, right: 15, left: 15}
chart = linechart()
const el = d3.select('#lollipop-chart')
let width = 0
let height = 0
let chartWidth = 0
let chartHeight = 0
let barHeight = 0
let lollipopOffset = 45

let xScale = d3.scaleLinear()
let colorScale = d3.scaleOrdinal().domain([0,1,2]).range(['#EBCD52','#E16149', '#9ADCC9'])
let sizeScale = d3.scaleLinear().domain([325,1000]).range([4, 7.5])

const formatDollars = d3.format("$.2f")
const formatSalary = d3.format("$,.0f")

const annotations = [
  {
    "two_adults": 56160,
    "snap_threshold": 49200,
    "self_sufficiency": 125995,
    "i": 1,
    "path": "M35,30L0,0",
    "text": "In San Francisco, a household with two adults working full-time on minimum wage would not qualify for SNAP.",
    "textOffset": [43, 11]
  },
  /*{
    "two_adults": 62400,
    "snap_threshold": 49200,
    "self_sufficiency": 123442,
    'i': 3.5,
    "path": "M35,30L0,0",
    "text": "In SF, minimum wage increased to $15.00 on July 1, 2018, widening the gap for SNAP eligibility.",
    "textOffset": [43, 11]
  }*/
]

function resize() {
  const width = Math.min(1000, window.innerWidth)
  const height = 2400
  chart.width(width).height(height)
  el.call(chart)
}

function linechart() {
  
  function enter({ container, data }) {
  	const svg = container.selectAll('svg').data([data])
    const svgEnter = svg.enter().append('svg').attr("class", "lollipop-svg")
    const gEnter = svgEnter.append('g')

    gEnter.append("g").attr("class", "guidelines")
    gEnter.append("g").attr("class", "places")
    gEnter.append("g").attr("class", "legend")
    gEnter.append("g").attr("class", "annotations")
  }

  function updateScales({ data }) {  
  	xScale
  		.domain([0, 135000])
  		.range([0, chartWidth])


  }

  function updateDom({ container, data }) {
  	const svg = container.select('svg')
  	svg
      .attr('width', width)
      .attr('height', height)

    const g = svg.select('g')

    g.attr('transform', `translate(${margin.left}, ${margin.top})`)

    const places = g.select(".places")
    const legend = g.select(".legend")
    const guidelines = g.select(".guidelines")
    const annotationsg = g.select(".annotations")

    const guideline = guidelines.selectAll(".guideline")
      .data([49200])

    guideline
      .enter()
      .append("line")
      .attr("class", "guideline")
    .merge(guideline)
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", lollipopOffset)
      .attr("y2", chartHeight - lollipopOffset)
      
    const placeg = places.selectAll(".place-g")
    	.data(data)

    const placeGEnter = placeg
    	.enter()
    	.append("g")
    	.attr("class", "place-g")
    .merge(placeg)
    	.attr("transform", (d,i) => {
    		if (i < 2) {
    			return `translate(0, ${i*barHeight})`
    		} /*else if (i < 3) {
    			return `translate(0, ${(i+0.5)*barHeight})`
    		}*/else {
    			return `translate(0, ${(i+0.5)*barHeight})`
    		}
    	})

    const placename = placeGEnter.selectAll(".placename")
    	.data(d => [d])

    const placeCounty = placename
    	.enter()
    	.append("text")
    	.attr("class", "placename")
    .merge(placename)
    	.text(d => d['place'].split(" ").splice(-1) == 'County' || d['place'] == 'California' ? `${d['place']}` : `${d['place']}, ${d['county']} County`)

    /*const isCity = placeCounty.filter(d => d['place'] != d['county'])
    	.selectAll(".isCity")
    	.data(d => [d])

    isCity
    	.enter()
    	.append("tspan")
    	.attr("dx", 5)
    	.attr("class", "isCity")
    .merge(isCity)
    	.text(d => `, ${d['county']}`)*/

    const minWageText = placeGEnter.selectAll(".minWageText")
    	.data(d => [d])

    minWageText	
    	.enter()
    	.append("text")
    	.attr("class", "minWageText")
    .merge(minWageText)
    	.attr("y", 15)
    	.text(d => `Minimum wage in ${d['place']} is ${formatDollars(d['min_wage'])}.`)


     const lollipop = placeGEnter.selectAll(".lollipop")
    	.data(d => [d])

    const lollipopEnter = lollipop
    	.enter()
    	.append("g")
    	.attr("class", "lollipop")
    .merge(lollipop)
    	.attr("transform", (d,i) => {
    		if (i < 2) {
    			return `translate(0, ${i*barHeight + lollipopOffset})`
    		} /*else if (i < 4) {
    			return `translate(0, ${(i+0.5)*barHeight + lollipopOffset})`
    		}*/ else {
    			return `translate(0, ${(i+0.5)*barHeight + lollipopOffset})`
    		}
    	})

    const line = lollipopEnter.selectAll(".line")
    	.data(d => [d])

    line
    	.enter()
    	.append("line")
    	.attr("class", "line")
    .merge(line)
    	.attr("x1", 0)
    	.attr("x2", chartWidth)
    	.attr("y1", 0)
    	.attr("y2", 0)

     const gap = lollipopEnter
    	.filter(d => d['snap_threshold'] < d['two_adults'])
    	.selectAll(".gap")
    	.data(d => [d])

    gap
    	.enter()
    	.append("line")
    	.attr("class", "gap")
    .merge(gap)
    	.attr("x1", d => xScale(d['snap_threshold']) + sizeScale(chartWidth))
    	.attr("x2", d => xScale(d['two_adults']) - sizeScale(chartWidth))
    	.attr("y1", 0)
    	.attr("y2", 0)

    const popg = lollipopEnter.selectAll(".popg")
    	.data(d => [d['two_adults'], d['snap_threshold'], d['self_sufficiency']])

    const popGEnter = popg
    	.enter()
    	.append("g")
    	.attr("class", "popg")
  

    const pop = popGEnter
    	.append("circle")
    	.attr("class", "pop")
    
    const popText = popGEnter
    	.append("text")
    	.attr("class", "popText")

    const popGUpdate = popGEnter.merge(popg)
    
    popGUpdate
    	.select(".pop")
    	.attr("cx", d => xScale(d))
    	.attr("fill", (d,i) => colorScale(i))
    	.attr("r", sizeScale(chartWidth))

    popGUpdate
    	.select(".popText")
    	.text(d => formatSalary(d))
    	.attr("x", d => xScale(d))
    	.attr("y", (d, i) => i == 0 || i == 2 ? -15 : 15)
    	.attr("text-anchor", "middle")
    	
    const legendG = legend.selectAll(".legendG")
    	.data([1,2,3])

    const legendGEnter = legendG
    	.enter()
    	.append("g")
    	.attr("class", "legendG")
    .merge(legendG)
    	.attr("transform", (d, i) => `translate(0, ${d*20})`)

    const legendCircle = legendGEnter.selectAll(".legendCircle")
    	.data(d => [d])

    legendCircle
    	.enter()
    	.append("circle")
    	.attr("class", "legendCircle")
    .merge(legendCircle)
    	.attr("r", sizeScale(chartWidth))
    	.attr("fill", d => colorScale(d-1))

    const legendText = legendGEnter.selectAll(".legendText")
    	.data(d => [d])

    legendText
    	.enter()
    	.append("text")
    	.attr("class", "legendText")
    .merge(legendText)
        .attr("x", 15)
    	.text(d => {
    		if (d == 1) {
    			return "Two adults working full time on minimum wage"
    		} else if (d == 2) {
    			return "SNAP eligibility limit for family of 4"
    		} else {
    			return "Self-sufficiency standard for family of 4"
    		}
    	})
    
    const caveat = legend.selectAll(".caveat")
        .data([0])
    
    caveat
        .enter()
        .append("text")
        .attr("class", "caveat")
    .merge(caveat)
        .text("* All values are based on the the annual income of a family of four with two working adults and two children.")
        .attr("transform", (d, i) => `translate(0, 80)`)
        .attr("dy", "1em")
        .call(wrap, 300)
    
    const legendWidth = legend.node().getBoundingClientRect().width
    legend.attr("transform", `translate(${chartWidth/2 - (legendWidth/2)}, ${-margin.top})`)

   	const swoopy = d3.swoopyDrag()
		  .x(d => xScale((d['two_adults'] + d['snap_threshold']) / 2))
		  .y(d => barHeight * d['i'] + lollipopOffset)
		  .draggable(false)
		  .annotations(annotations)
		
		annotationsg.call(swoopy)
		annotationsg
			.selectAll("text")
			.attr("dy", "1em")
			.call(wrap, 140)
			
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
    barHeight = chartHeight / (minwage_data.length + (annotations.length / 2))
    return chart
  }
  return chart
}

function init() {
	el.datum(minwage_data)
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
