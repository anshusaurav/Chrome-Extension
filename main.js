

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
  
  for (let item of historyItems) 
  if(item.title != 'History')
  {
    let displayDiv = template.content.querySelector(".history, div");
    let randomColor = kColors[Math.floor(Math.random() * kColors.length)];
    displayDiv.style.backgroundColor = randomColor;
    let titleLink = template.content.querySelector('.titleLink, a');
    //titleLink.style.backgroundColor = 'transparent';
    
    let pageName = template.content.querySelector('.pageName, p');
    let visitTimer = template.content.querySelector('.visitTimer, p');
    let removeButton = template.content.querySelector('.removeButton, button');
    let checkbox = template.content.querySelector('.removeCheck, input');
    let bgCard = template.content.querySelector('.cardBackground, div');
    let bgSpan =  template.content.querySelector('.bgSpan, span');
    //bgCard.textContent = getUniqueAlph(getMainDomain(item.url));
    //console.dir(bgCard);
    checkbox.setAttribute('value', item.url);
    let favicon = document.createElement('img');
    let host = new URL(item.url).host;
    titleLink.href = item.url;
    let baseUrl = getMainDomain(item.url);
    //console.log(baseUrl);
    // console.log('|'+getMainDomain(visitItems[i].visitId) + '|' + visitItems[i].transition);
    if(mapDomain.has(baseUrl)){
      mapDomain.set(baseUrl , mapDomain.get(baseUrl)+item.visitCount);
    } 
    else
    {
      mapDomain.set(baseUrl , item.visitCount);
    }
   
    titleLink.textContent = `${host}`;// + ' Total Visits: ' + item.visitCount + ' Total Typed: ' + item.typedCount;
    //visitTimer.textContent = ''+getDate(item.lastVisitTime);
    pageName.innerText = `${shorten(item.title,2)} \n ${getDate(item.lastVisitTime)}`;
    
    console.log('BUGCARD ' + getUniqueAlph(getMainDomain(item.url)));
    bgSpan.innerHTML = getUniqueAlph(getMainDomain(item.url));
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
      console.dir(clone);
    historyDiv.appendChild(clone);
    //console.log('BUGCARD ' + getUniqueAlph(getMainDomain(item.url)));
  console.dir(bgCard)
  
  }
  
  let cn = 1;
  let sumClicks = 0;
  mapDomain.forEach( (value, key) => {
    //console.log(`${cn++}-->${key}: ${value}`); 
    sumClicks+=value;
  });

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
  //console.log(data);
  let boolDoWeNeedMore = false;
  data.sort((a,b)=>{
    return a['percent']-b['percent'];
  }).reverse();
  let dataset = [];
  let sumPercent = 0.0;
  for(let i = 0; i < data.length; i++){
      sumPercent += data[i]['percent'];
  }

  for(let i = 0; i <Math.min(data.length,8); i++){
    dataset.push(data[i]);
    sumPercent-=data[i]['percent'];
  }
  console.log('Others sum: '+sumPercent + ' length: '+data.length);
  if(data.length > 8){
    dataset.push({name: 'Others', percent: sumPercent});
  }
  console.log(dataset);
  createFirstInfo('#infoOne',dataset);
  cn = 0;
  mapTransition.forEach( (value, key) => {
    sumClicks+=value;
  });
}
function createFirstInfo(str,dataset){
  var pie=d3.layout.pie()
    .value(function(d){return d.percent})
    .sort(null)
    .padAngle(.03);
  
  var w=300,h=820;
  
  var outerRadius=w/2;
  var innerRadius=100;
  var color = d3.scale.category20b().range(['#4F3466FF', '#93385FFF', '#9F6B99FF', '#a04c85','#008080','#34655a','#437013', '#95C362', '#267257', '#AA6A39']);//['#0b1307', '#203815', '#365d22', '#7bc158', '#98cf7d', '#d3eac7']);
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
            return (color(d.data.name));
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
              'font-size':'14px'
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

// $('removeAll').onclick = function() {
//   chrome.history.deleteAll(function() {
//     location.reload();
//   });
// }

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
                //console.log(visits.length + ' visits');
            }
        });
    }
    console.log(histories.length + ' histories');
    
    //console.log(historyItems);
}); 
//:33 GMT+0530 (India Standard Time)
function getDate(ms){
  let date = new Date(ms);// Milliseconds to date
  let d = new Date();
  let n = d.getTime();
  let ts = getSecondsToday();
  if(n-ms <=ts)
    return "Today " + date.toString().slice(16,date.toString().length-34);
  else if(n-ms >=ts && n-ms <= 24*60*60*1000 + ts)
    return "Yesterday " + date.toString().slice(16,date.toString().length-34);
  
  return (date.toString().slice(0,date.toString().length-34));
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
  const lenPerLine = 32;
  if(str.length > n*lenPerLine){
    return str.substr(0,n*lenPerLine)+'...';
  }
  return str;
}
// function shadeColor(color, percent) {
//   color = '#341252';
//   var R = parseInt(color.substring(1,3),16);
//   var G = parseInt(color.substring(3,5),16);
//   var B = parseInt(color.substring(5,7),16);

//   R = parseInt(R * (percent) / 100);
//   G = parseInt(G * (percent) / 100);
//   B = parseInt(B * (percent) / 100);

//   R = (R<255)?R:255;  
//   G = (G<255)?G:255;  
//   B = (B<255)?B:255;  

//   var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
//   var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
//   var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
//   console.log('COLOR #'+RR+GG+BB + " " + percent);
//   return "#"+RR+GG+BB;
// }
// function shadeColor(col, amt){
//   var usePound = false;
//   col = '#66c2a5';
//   amt = 50-amt;
//   if (col[0] == "#") {
//       col = col.slice(1);
//       usePound = true;
//   }

//   var num = parseInt(col,16);

//   var r = (num >> 16) + amt;

//   if (r > 255) r = 255;
//   else if  (r < 0) r = 0;

//   var b = ((num >> 8) & 0x00FF) + amt;

//   if (b > 255) b = 255;
//   else if  (b < 0) b = 0;

//   var g = (num & 0x0000FF) + amt;

//   if (g > 255) g = 255;
//   else if (g < 0) g = 0;

//   return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
// }
function getUniqueAlph(str){
  //console.log(str);
  if(str.trim().length ==0)
  return 'A';
  let arr = str.split('.');
  return arr[arr.length-2].charAt(0).toUpperCase();
  // if(str.toLowerCase().startsWith('www.'))
  //   return str.charAt(4).toUpperCase();
  // else
  //   return str.charAt(0).toUpperCase();
}