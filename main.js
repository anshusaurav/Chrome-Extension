

const kMillisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
const kOneWeekAgo = (new Date).getTime() - kMillisecondsPerWeek;
let historyDiv = document.getElementById('historyDiv');
let infoOneDiv = document.querySelector('#infoOne')
//let infoTwoDiv = document.querySelector('#infoTwo');
const kColors = ['#93385FFF', '#9F6B99FF', '#4F3466FF', '#a04c85'];//,'#008080','#15F4EE'];
let $ = document.getElementById.bind(document);
let mapDomain = new Map();
let mapTransition = new Map();
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
    let bgCard = template.content.querySelector('cardBackground, div');
    //console.dir(bgCard);
    checkbox.setAttribute('value', item.url);
    let favicon = document.createElement('img');
    let host = new URL(item.url).host;
    titleLink.href = item.url;
    let baseUrl = getMainDomain(item.url);
    console.log(baseUrl);
    // console.log('|'+getMainDomain(visitItems[i].visitId) + '|' + visitItems[i].transition);
    if(mapDomain.has(baseUrl)){
      mapDomain.set(baseUrl , mapDomain.get(baseUrl)+item.visitCount);
    } 
    else
    {
      mapDomain.set(baseUrl , item.visitCount);
    }
    // chrome.history.getVisits({url: item.url}, function(visitItems) {
    //   for (var j = 0; j < visitItems.length; j++) {
    //       //visits.push(visitItems[j]);
    //       if(mapTransition.get(visitItems[j].transition)){
    //         mapTransition.set(visitItems[j].transition, mapTransition.get(visitItems[j].transition)+1);
    //       }
    //       else{
    //         mapTransition.set(visitItems[j].transition, 1);
    //       }
    //   }
      
      
    // });
    
    titleLink.textContent = shorten(host,2)+'\n'+getDate(item.lastVisitTime);// + ' Total Visits: ' + item.visitCount + ' Total Typed: ' + item.typedCount;
    visittime.innerHTML = getDate(item.lastVisitTime);
    pageName.innerText = item.title;
    //bgCard.textContent = getUniqueAlph(getMainDomain(item.url));
    if (item.title == '') {
      pageName.innerText = host;
    }
    var clone = document.importNode(template.content, true);
    console.dir(clone);
    clone.querySelector('.removeButton, button')
      .addEventListener('click', function() {
        chrome.history.deleteUrl({url: item.url}, function() {
          location.reload();
        });
      });
    historyDiv.appendChild(clone);
  }
  let cn = 1;
  let sumClicks = 0;
  mapDomain.forEach( (value, key) => {
    //console.log(`${cn++}-->${key}: ${value}`); 
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
  mapDomain.forEach((value,key, mapDomain) =>{
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
  createFirstInfo('#infoOne',dataset);
  cn = 0;
  console.log('Size: ' +mapTransition.size);
  mapTransition.forEach( (value, key) => {
    console.log(`${cn++}-->${key}: ${value}`); 
    sumClicks+=value;
  });
  //createFirstInfo('#infoTwo', dataset);
  //console.log('Rest %:'+sumPercent);
  
}
function createFirstInfo(str,dataset){
  var pie=d3.layout.pie()
    .value(function(d){return d.percent})
    .sort(null)
    .padAngle(.03);
  
  var w=300,h=600;
  
  var outerRadius=w/2;
  var innerRadius=100;
  
  var color = d3.scale.category20b();
  console.log('color: '+color);
  var arc=d3.svg.arc()
    .outerRadius(outerRadius)
    .innerRadius(innerRadius);
  
  var svg=d3.select(str)
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
            return color(d.data.name);//shadeColor(d.color.percent);//color(d.data.name);
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
              fill:'#fff',
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
  infoOne.innerHTML = '';
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
            for (var j = 0; j < visitItems.length; j++) {
                visits.push(visitItems[j]);
                //console.log('|'+getMainDomain(historyItems[i].url) + '|' + visitItems[i].transition);
                if(mapTransition.get(visitItems[j].transition)){
                  mapTransition.set(visitItems[j].transition, mapTransition.get(visitItems[j].transition)+1);
                }
                else{
                  mapTransition.set(visitItems[j].transition, 1);
                }
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
function shadeColor(color, percent) {
  color = '#341252';
  var R = parseInt(color.substring(1,3),16);
  var G = parseInt(color.substring(3,5),16);
  var B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;  
  G = (G<255)?G:255;  
  B = (B<255)?B:255;  

  var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

  return "#"+RR+GG+BB;
}

function getUniqueAlph(str){
  if(str.toLowerCase().startsWith('www.'))
    return str.charAt(4);
  else
    return str.charAt(0);
}