# Food Insecurity Graphics

[Project preview](https://projects.sfchronicle.com/test-proj/food-insecurity/)

[Google doc brainstorming](https://docs.google.com/document/d/1oh-fJKPSK7Vvl82atCNdFDcwHnqAOhqukiZRxvR-neM/edit?usp=drive_web&ouid=107317233247828819256)

## Graphics

I've discussed these graphics with both the interactive team and Tara, and they have been approved so they should be good to go. They are also all responsive. 

1. Percent of households that receive SNAP choropleth  
data: data/ca_topo.json  
code: js/snaptracts.js
This map shows the percentage of households that receive SNAP per census tract. The cities that have been annotated are clusters where SNAP enrollment is higher. On default view, hovering with highlight each county. If you click on a county, you can hover over each tract for more detailed demographic info. We probably want to include instructions so that we don't hide too much data. Click on the water (outside of the land) will zoom out to default view.  
We also floated the idea of using Joaquin's zip code data to explore SNAP eligility vs actual enrollment, but this data was very messy and contained negative numbers, percentages above 100%, and large geographic maps that made the map confusing and innacurate, so that's why I ended up sticking to the census tract data.

2. GAP chart 
data: data/minwage.csv  
code: js/lollipop.js  
This chart should show the gap between making minimum wage, the SNAP threshold, and self-sufficiency in each county and city that has a specific minimum wage law. These numbers are constantly changing and need to be checked that they are still accurate at the time of publishing.
It also still needs a headline and deck from Tara, as she hasn't gotten back to me on that.

3. Self-sufficiency in CA
code: js/selfsufficiency.js  
data: selfsufficiency_topo.json  	
This map should show self-sufficiency levels in California by county, and mousing over each county should give a breakdown of where that number comes from. It's pretty obvious that the Bay Area is much redder than anywhere else in the state, which is what I wanted to get across.

## Jupyter Notebooks (how I got the data)
All of the work I did to get the data are in jupyter notebooks, which you can also reproduce. I got geographic data from the census, which I then simplified in [mapshaper](http://mapshaper.org/) to make the files smaller. 


1. To get SNAP choropleth data, I ran `01-census-api-scraper.ipynb` which outputs `data/merged_bay_area_tracts.shp`, which I then converted to topojson using 

```
shp2json merged_bay_area_tracts.shp -o ca.json

ndjson-split 'd.features' \
  < ca.json \
  > ca.ndjson

geo2topo -n \
  tracts=ca.ndjson \
  > ca-tracts-topo.json

toposimplify -f \
  < ca-tracts-topo.json \
  > ca-simple-topo.json

topoquantize 1e5 \
  < ca-simple-topo.json \
  > ca-quantized-topo.json

topomerge -k 'd.properties.GEOID.slice(2, 5)' counties=tracts \
  < ca-quantized-topo.json \
  > ca-merge-topo.json

topomerge --mesh -f 'a !== b' counties2=counties \
  < ca-merge-topo.json \
  > ca_topo.json
```

2. To get self-sufficiency choropleth data, I ran `02-self-sufficiency-and-costs.ipynb` to get the data and `http://localhost:8888/notebooks/notebooks/05-county-merge-data.ipynb` to merge it with geographic data, which is all from the census. This outputs `data/selfsufficiency.json`, which I then converted to topojson using 

```
ndjson-split 'd.features' \
  < selfsufficiency.json \
  > selfsufficiency.ndjson

geo2topo -n \
  counties=selfsufficiency.ndjson \
  > selfsufficiency-counties-topo.json

toposimplify -f \
  < selfsufficiency-counties-topo.json \
  > selfsufficiency-simple-topo.json

topoquantize 1e5 \
  < selfsufficiency-simple-topo.json \
  > ../data/selfsufficiency_topo.json
```
This is all detailed in Mike Bostock's [command-line cartography](https://medium.com/@mbostock/command-line-cartography-part-1-897aa8f8ca2c).

3. Minimum wage data is from a variety of sources that I researched


## Additional Work
Someone needs to put the graphics in the proper places in the article when all of the text is ready. There are places in the article where she talks about SNAP enrollment, the gap, and self-sufficiency so that's where it would make most sense to put them. 

