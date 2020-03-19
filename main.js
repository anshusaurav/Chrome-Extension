

const kMillisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
const kOneWeekAgo = (new Date).getTime() - kMillisecondsPerWeek;
let historyDiv = document.getElementById('historyDiv');
let infographicDiv = document.querySelector('#infographics')
const kColors = ['#93385FFF', '#9F6B99FF', '#4F3466FF', '#a04c85'];//,'#008080','#15F4EE'];
let $ = document.getElementById.bind(document);
let map = new Map();
function constructHistory(historyItems) {
  let template = $('historyTemplate');
  for (let item of historyItems) {
    let displayDiv = template.content.querySelector("#history, div");
    let randomColor = kColors[Math.floor(Math.random() * kColors.length)];
    displayDiv.style.backgroundColor = randomColor;
    let titleLink = template.content.querySelector('.titleLink, a');
    //titleLink.style.backgroundColor = 'transparent';
    
    let pageName = template.content.querySelector('.pageName, p');
    let visittime = template.content.querySelector('.visitTime, p');
    let removeButton = template.content.querySelector('.removeButton, button');
    let checkbox = template.content.querySelector('.removeCheck, input');
    checkbox.setAttribute('value', item.url);
    let favicon = document.createElement('img');
    let host = new URL(item.url).host;
    titleLink.href = item.url;
    let baseUrl = getMainDomain(item.url);
    console.log(baseUrl);
    if(map.has(baseUrl)){
      map.set(baseUrl , map.get(baseUrl)+item.visitCount);
      //console.log(baseUrl +': ' +map.get(baseUrl));
    } 
    else
    {
      map.set(baseUrl , item.visitCount);
    }
    //favicon.src = 'chrome://favicon/' + item.url;
    titleLink.textContent = shorten(host,2)+'\n'+getDate(item.lastVisitTime);// + ' Total Visits: ' + item.visitCount + ' Total Typed: ' + item.typedCount;
    visittime.innerHTML = getDate(item.lastVisitTime);
    //titleLink.appendChild(favicon);
    pageName.innerText = item.title;
    if (item.title == '') {
      pageName.innerText = host;
    }
    var clone = document.importNode(template.content, true);
    clone.querySelector('.removeButton, button')
      .addEventListener('click', function() {
        chrome.history.deleteUrl({url: item.url}, function() {
          location.reload();
        });
      });
    historyDiv.appendChild(clone);
    //historyItems.appendChild(infographicDiv);
  }
  let cn = 1;
  let sumClicks = 0;
  map.forEach( (value, key) => {
    console.log(`${cn++}-->${key}: ${value}`); // cucumber: 500 etc
    sumClicks+=value;
  });

  // var dataset = [
  //   { name: 'Data', percent: 39.10 },
  //   { name: 'Chrome', percent: 32.51 },
  //   { name: 'Safari', percent: 13.68 },
  //   { name: 'Firefox', percent: 8.71 },
  //   { name: 'Others', percent: 6.01 }
  // ];
  let data = [];

  let cnt = 0, sumTillNow = 0 ;
  map.forEach((value,key, map) =>{
    let obj = {};
    //console.log(key);
    obj.name = key;
    obj.percent = Math.floor(value*100/sumClicks);
    cnt++;
    sumTillNow += value;
    data.push(obj);
    //if(cnt < 4)
    //dataset.push(obj);
    
  });
  //dataset.push({name: 'Others', percent: Math.round((sumClicks-sumTillNow)*100/sumClicks)});
  console.log(data);
  data.sort((a,b)=>{
    return a['percent']-b['percent'];
  }).reverse();
  let dataset = [];
  let sumPercent = 0.0;
  for(let i = 0; i < data.length; i++){
    if(i < 4)
    dataset.push(data[i]);
    else
      sumPercent += data[i]['percent'];
    
  }
  dataset.push({name: 'Others', percent: sumPercent});
  //console.log('Rest %:'+sumPercent);
  var pie=d3.layout.pie()
    .value(function(d){return d.percent})
    .sort(null)
    .padAngle(.03);
  
  var w=300,h=600;
  
  var outerRadius=w/2;
  var innerRadius=100;
  
  var color = d3.scale.category10();
  
  var arc=d3.svg.arc()
    .outerRadius(outerRadius)
    .innerRadius(innerRadius);
  
  var svg=d3.select("#infographics")
    .append("svg")
    .attr({
        width:w,
        height:h,
        class:'shadow'
    }).append('g')
    .attr({
        transform:'translate('+w/2+','+h/2+')'
    });
  var path=svg.selectAll('path')
    .data(pie(dataset))
    .enter()
    .append('path')
    .attr({
        d:arc,
        fill:function(d,i){
            console.log(color(d.data.name));
            return color(d.data.name);
        }
    });
  
  path.transition()
    .duration(1000)
    .attrTween('d', function(d) {
        var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
        return function(t) {
            return arc(interpolate(t));
        };
    });
  
  
  var restOfTheData=function(){
      var text=svg.selectAll('text')
          .data(pie(dataset))
          .enter()
          .append("text")
          .transition()
          .duration(200)
          .attr("transform", function (d) {
              return "translate(" + arc.centroid(d) + ")";
          })
          .attr("dy", ".4em")
          .attr("text-anchor", "middle")
          .text(function(d){
              return d.data.percent+"%";
          })
          .style({
              fill:'#fff',
              'font-size':'10px'
          });
  
      var legendRectSize=16;
      var legendSpacing=7;
      var legendHeight=legendRectSize+legendSpacing;
  
      
      var legend=svg.selectAll('.legend')
          .data(color.domain())
          .enter()
          .append('g')
          .attr({
              class:'legend',
              transform:function(d,i){
                  return 'translate(-100,' + ((i*legendHeight)+180) + ')';
              }
          });
      legend.append('rect')
          .attr({
              width:legendRectSize,
              height:legendRectSize,
              rx:16,
              ry:16
          })
          .style({
              fill:color,
              stroke:color
          });
  
      legend.append('text')
          .attr({
              x:30,
              y:15
          })
          .text(function(d){
              return d;
          }).style({
              fill:'#237',
              'font-size':'14px'
          });
  };
  
  setTimeout(restOfTheData,1000);
}


chrome.history.search({
      text: '',
      startTime: kOneWeekAgo,
      maxResults: 1000
    }, constructHistory);

$('searchSubmit').onclick = function() {
  historyDiv.innerHTML = " ";
  infographicDiv.innerHTML = '';
  let searchQuery = document.getElementById('searchInput').value;
  chrome.history.search({
        text: searchQuery,
        startTime: kOneWeekAgo
      }, constructHistory)
}

$('deleteSelected').onclick = function() {
  let checkboxes = document.getElementsByTagName('input');
  for (var i =0; i<checkboxes.length; i++) {
    if (checkboxes[i].checked == true) {
        chrome.history.deleteUrl({url: checkboxes[i].value})
    }
  }
  location.reload();
}

$('removeAll').onclick = function() {
  chrome.history.deleteAll(function() {
    location.reload();
  });
}

$('seeAll').onclick = function() {
  location.reload();
}
$('selectAll').onclick = function(){
  let checkboxes = document.getElementsByTagName('input');
  for (var i =0; i<checkboxes.length; i++) {
    checkboxes[i].checked = true;
  }
  //location.reload();
}
var histories = [];
var visits = [];

chrome.history.search({text:'', maxResults:0}, function(historyItems) {
    var historiesProcessed = 0;
    for (var i = 0; i < historyItems.length; i++) {
        histories.push(historyItems[i]);
        chrome.history.getVisits({url: historyItems[i].url}, function(visitItems) {
            for (var i = 0; i < visitItems.length; i++) {
                visits.push(visitItems[i]);
                //console.log('|'+getMainDomain(visitItems[i].visitId) + '|' + visitItems[i].transition);
            }
            
            historiesProcessed++;
            if (historiesProcessed === historyItems.length) {
                console.log(visits.length + ' visits');
            }
        });
    }
    console.log(histories.length + ' histories');
    
    //console.log(historyItems);
}); 

function getDate(ms){
  let date = new Date(ms);// Milliseconds to date
  let d = new Date();
  let n = d.getTime();
  let ts = getSecondsToday();
  if(n-ms <=ts)
    return "Today " + date.toString().substr(16);
  else if(n-ms >=ts && n-ms <= 24*60*60*1000 + ts)
    return "Yesterday " + date.toString().substr(16);
  
  return (date.toString());
}

function getSecondsToday() {
  let now = new Date();

  let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let diff = now - today; // ms difference
  return Math.round(diff); // make seconds
}
function getMainDomain(url){
  let hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function shorten(str,n){
  const lenPerLine = 22;
  if(str.length > n*22){
    return str.substr(0,n*22)+'...';
  }
  return str;
}