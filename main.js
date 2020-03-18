

const kMillisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
const kOneWeekAgo = (new Date).getTime() - kMillisecondsPerWeek;
let historyDiv = document.getElementById('historyDiv');
const kColors = ['#89CFF0', '#ADD8E6', '#CB4EE', '#1F75FE','#008080','#15F4EE'];
let $ = document.getElementById.bind(document);

function constructHistory(historyItems) {
  let template = $('historyTemplate');
  for (let item of historyItems) {
    let displayDiv = template.content.querySelector("#history, div");
    let randomColor = kColors[Math.floor(Math.random() * kColors.length)];
    displayDiv.style.backgroundColor = randomColor;
    let titleLink = template.content.querySelector('.titleLink, a');
    titleLink.style.backgroundColor = randomColor;
    let pageName = template.content.querySelector('.pageName, p');
    let removeButton = template.content.querySelector('.removeButton, button');
    let checkbox = template.content.querySelector('.removeCheck, input');
    checkbox.setAttribute('value', item.url);
    let favicon = document.createElement('img');
    let host = new URL(item.url).host;
    titleLink.href = item.url;

    //favicon.src = 'chrome://favicon/' + item.url;
    titleLink.textContent = host+' '+getDate(item.lastVisitTime);

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
  }
}
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

chrome.history.search({
      text: '',
      startTime: kOneWeekAgo,
      maxResults: 1000
    }, constructHistory);

$('searchSubmit').onclick = function() {
  historyDiv.innerHTML = " "
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