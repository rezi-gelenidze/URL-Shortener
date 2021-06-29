const BASE_URL = window.location.origin;

// config data for doughnut chart
let data = {
  labels: [],
  datasets: [{
    label: 'Top links',
    data: [],
    backgroundColor: [
      '#E86850',
      '#a5e1ad',
      '#4ca1a3',
      '#faf2da',
      '#064420'
    ],
    hoverOffset: 2
  }],
};

let options = {
  aspectRatio: 1,
  plugins: {
    legend: {
      display: true,
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        color: '#ffffff',
        font: {
            size: 13
        }
      },
      position: 'right',
      title: {
        text: 'Top links',
        display: false,
        color: '#ffffff',
        font: {
            size: 18
        }
      }
    }
  }
};

// fetch data of all links
fetch('linkdata')
.then(response => response.json())
.then(links => {
    // declare global set links value globally
    window.links = links;

    // start processing data
    process();
});

function append_linkitem(link) {
  // create linkitem with template and append to linklist
  let template = document.querySelector('#linklist-item').content;
  let linklist = document.querySelector('#list');
  let index = linklist.querySelectorAll('.card').length;

  linklist.appendChild(document.importNode(template, true));
  createdNode = linklist.querySelector('.card:last-child');

  // fill listitem with data
  // truncate text if needed
  let title = link.title;
  let original = link.original;
  if (title.length > 20) {
    title = title.substr(0, 17) + '...'
  }
  if (original.length > 55) {
    original = original.substr(0, 52) + '...'
  }

  createdNode.querySelector('#listitem-title').innerHTML = title;
  createdNode.querySelector('#listitem-id').innerHTML = link.short_id;
  createdNode.querySelector('#listitem-original').innerHTML = original;
  createdNode.dataset.linkId = index;

  // active status
  let activeStatusField = createdNode.querySelector('#listitem-active');
  if (link.active) {
    activeStatusField.innerHTML = 'Active';
    activeStatusField.parentElement.querySelector('i').classList = 'text-success fas fa-circle';
  }
  else {
    activeStatusField.innerHTML = 'Inactive';
    activeStatusField.parentElement.querySelector('i').classList = 'text-danger fas fa-circle'; 
  }
}


function process() {
  // process data (first_to_load parameter is an index of link to load at first in manager panel)
  // iterate over links and feed page with data (linklist, statistics, linkmanage, etc.)
  let totalLinks = Object.keys(links).length;

  let totalClicks = 0;
  let totalActive = 0;

  let linklist = document.querySelector('#list');
  for (const [index, link] of Object.entries(links)) {
    totalClicks += link.clicks;

    // update total active counter if link is active
    if (link.active) {
      totalActive += 1;
    }

    append_linkitem(link);
  };

  // fill list of statistics
  document.querySelector('#created-count').innerHTML = totalLinks;
  document.querySelector('#active-count').innerHTML = totalActive;
  document.querySelector('#tot-click-count').innerHTML = totalClicks;

  // show statistics bar when page is visited
  $('#statistics-toggler').click();

  // if links exist, display chart
  // load first link or hide manager
  if (Object.keys(links).length) {


    if (totalClicks == 0) {
      document.querySelector('#toplinks').style.width = 'max-content';
      document.querySelector('#toplinks').innerHTML = '<h5>No data to display chart.</h5>';
    }
    else {
      let title;
      // feed doughnut chart with analytics data
      let toplinks = Object.values(links).sort(function(a, b) {
        return b.clicks - a.clicks;
      }).slice(0, 5);

      toplinks.forEach((link) => {
        title = link.title;
        if (title.length > 15) {
          title = title.slice(0, 15) + '...';
        }
        data.labels.push(title);
        data.datasets[0].data.push(link.clicks);
      });


      // create doughnut chart with given data
      new Chart("myChart", {
        type: "doughnut",
        data: data,
        options: options
      });
    }



    // load first_to_load index of link from sessionStorage (default -> 0)
    let first = sessionStorage.getItem('firstToLoad');
    if (!first) {
      first = 0;
    }
    load_link(first);

    // then remove variavble to load first item on next refresh
    sessionStorage.removeItem('firstToLoad');
  }
  else {
    // no links case
    document.querySelector('#toplinks').style.width = 'max-content';
    document.querySelector('#toplinks').innerHTML = '<h5>No data to display chart.</h5>';
    document.querySelector("#linkmanage").style.display = 'none';

    document.querySelector('#linklist-head h5').innerHTML = 'No links';
    document.querySelector('#linklist .responsive-toggler').style.display = 'none';
    window.onresize = () => {
      if (window.innerWidth <= 780) {
        document.querySelector('#linklist').style.width = '100%';
      }
    }
  }

  // call function that adds event listeners
  add_listeners();
  listen_cards();
}


function load_link(link_id) {
  // load link in manager by id
  let view = document.querySelector('#linkmanage');
  view.dataset.loadedLink = link_id;
  let link = links[link_id];

  // fill data
  view.querySelector('#managed-title').innerHTML = link.title;
  view.querySelector('#managed-original').innerHTML = link.original;
  view.querySelector('#managed-short').innerHTML = link.short_id;
  view.querySelector('#managed-clicks').innerHTML = link.clicks;

  view.querySelector('#managed-date').innerHTML = link.date_created;

  // set active switch button
  let activeLabel = view.querySelector('#switch-text');
  let activeSwitch = view.querySelector('#switch-inp');

  if (link.active) {
    activeLabel.innerHTML = 'Active';
    activeSwitch.checked = true;
  }
  else {
    activeLabel.innerHTML = 'Inactive';
    activeSwitch.checked = false;
  }
}
       
function listen_cards() {
  // listen cards onclick to load link in manger
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (event) => {
      let manager = document.querySelector('#linkmanage');
      // prevent reloading already loaded link
      if (card.dataset.linkId != manager.dataset.loadedLink) {
        // hide responsive linklist if displayed over manager
        let linklist = document.querySelector('#linklist');
        if (linklist.classList.contains('grow')) {
          linklist.classList.replace('grow', 'shrink');
        }

        // load link
        load_link(card.dataset.linkId);

        // trigger animation restart
        let manager = document.querySelector('#linkmanage');
        manager.classList.remove("animate"); 
        // trigger a DOM reflow 
        void manager.offsetWidth; 
        manager.classList.add("animate");   
      }
    })
  });
}


function add_listeners() {
  // linklist search bar functionality
  const searchbox = document.querySelector('#searchbox');
  const settingsForm = document.querySelector('#settingsForm');
  let text, option, target;

  searchbox.addEventListener('keyup', () => {
    text = searchbox.value;
    
    // check settings to determine "search by" type
    option = settingsForm.querySelector('input[name="radio"]:checked').value;

    // remove all linkitems
    let linkitems = document.querySelectorAll('.card')
    linkitems.forEach(element => element.remove());

    // search
    for (const link of Object.values(links)) {
      
      if (option == 'title') { target = link.title; }
      else if (option == 'original') { target = link.original; }
      else if (option == 'short') { target = link.short_id }

      if (target.toLowerCase().includes(text.toLowerCase())) {
        append_linkitem(link);
        listen_cards();
      }
    }
  })

  // create new link
  document.querySelectorAll('.create-new').forEach(btn => btn.onclick = () => {
    displayPopup(width='90%');

    popup_cont = document.querySelector('.popup-content');
    content = document.querySelector('#pop-create-markup').content;
    popup_cont.appendChild(document.importNode(content, true));

    let form = document.querySelector('#manage-create-form');

    // when form cancel button is clicked
    form.querySelector('#cancel-new').onclick = function() {
      popup.style.display = 'none';
      popup.querySelector('#maincontent').remove();
    }

    form.onsubmit = () => {
      let form_data = new FormData(form);
      const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      
      fetch('/new', {
        method: 'POST',
        body: JSON.stringify({
            title: form_data.get('title'),
            original: form_data.get('original')
        }), 
        headers: {'X-CSRFToken':csrftoken}
      }).then((response) => {
        if (response.status == 201) {
          let popup = document.querySelector('.popup-window');
          popup.style.display = 'none';
          popup.querySelector('#maincontent').remove();

          // load created link at first after refresh
          let id = document.querySelectorAll('.card').length;
          sessionStorage.setItem('firstToLoad', id);

          location.reload();
        }
        else if (response.status == 400) {
          notify('Invalid request (Check if link 500 limit is not crossed).', 'fail')
        }
        else if (response.status == 500) {
          notify('Internal server error.', 'fail');
        }
        else {
          notify('Unexpected error occured.', 'fail');
        }
      });

      return false;
    }
  })

  // panel manager responsive sizing
  document.querySelectorAll('.responsive-toggler').forEach(el => el.onclick = () => {
    // if link list show/hide button is clicked

    let linklist = document.querySelector('#linklist');

    // if linklist is displayed, hide
    if (linklist.classList.contains('grow')) {
      linklist.classList.replace('grow', 'shrink');
    }
    // if link list is shrinked previously, show
    else if (linklist.classList.contains('shrink')) {
      linklist.classList.replace('shrink', 'grow');
    }
    else {
      // if first time, show
      linklist.classList += 'grow';
    }

    window.onresize = () => {
      // reset class when screen is wide
      if (window.innerWidth > 780) {
        linklist.classList = '';
      }
    }
  })

}


// notification system
function notify(text, type) {
    if (type == 'success') {
      $(".notify").toggleClass("active");
      $('.notify').css('background', 'rgba(0, 153, 68, 0.6)');
      $("#notify-bar").toggleClass("success");
      $("#notify-bar").html(text)

      setTimeout(function(){
        $(".notify").removeClass("active");
        $("#notify-bar").removeClass("success");
      },1500);

    }
    else if (type == 'fail') {
      $(".notify").addClass("active");
      $('.notify').css('background', 'rgba(207, 0, 15, 0.6)');
      $("#notify-bar").addClass("failure");
      $("#notify-bar").html(text)

      
      setTimeout(function(){
        $(".notify").removeClass("active");
        $("#notify-bar").removeClass("failure");

      },1500);
    }
}


function displayPopup(width='90%', height='max-content') {
  popup = document.querySelector('.popup-window');
  popup.style.display = 'grid';

  // set width/height styles of popup
  let container = popup.querySelector('.popup-content');
  container.style.width = width;
  container.style.height = height;

  // add listeners
  var close = document.querySelector('.close');   // close button

  close_function = function() {
    popup.style.display = 'none';
    popup.querySelector('#maincontent').remove();
  }

  // When close button is clicked
  close.onclick = close_function

  window.onclick = function(event) {
    // When the user clicks anywhere outside, close it
    if (event.target == popup) {
      close_function()
    }
  }
}

function urlOps(operation) {
  // url management functionalities (copy, redirect, qrcode, edit, remove)
  let id = document.querySelector('#linkmanage').dataset.loadedLink;
  let link_data = links[id];
  let link = BASE_URL + '/' + link_data.short_id;
  let popup_cont;
  let content;

  if (operation == 'copy'){
    const el = document.createElement('textarea');
    el.value = link;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
  else if (operation == 'redirect') {
    if (BASE_URL == '127.0.0.1:8000') {
      window.location.href = link_data.short_id;
    } 
    else {
      window.location.href = link;
    }
  }
  else if (operation == 'qrcode') {
    displayPopup();

    popup_cont = document.querySelector('.popup-content');
    content = document.querySelector('#pop-qr-markup').content;
    popup_cont.appendChild(document.importNode(content, true));

    popup_cont.querySelector('h5').innerHTML = `Generated QR code of "${link_data.title}".`;

    qr_link = popup_cont.querySelector('a.link');
    qr_link.innerHTML = link;
    qr_link.setAttribute('href', link);

    var qrcode = new QRCode('qrcode', {
      text: link,
      width: 200,
      height: 200,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
  }
  else if (operation == 'edit') {
    displayPopup(width='90%');

    popup_cont = document.querySelector('.popup-content');
    content = document.querySelector('#pop-edit-markup').content;
    popup_cont.appendChild(document.importNode(content, true));

    popup_cont.querySelector('h5').innerHTML = `Edit link "${link_data.title}".`;

    popup_cont.querySelector('#edit-title').value = link_data.title;
    popup_cont.querySelector('#edit-original').value = link_data.original;

    let form = document.querySelector('#manage-edit-form');

    form.onsubmit = () => {
      let form_data = new FormData(form);
      const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      
      fetch(`/edit/${link_data.pk}`, {
        method: 'PUT',
        body: JSON.stringify({
            title: form_data.get('title'),
            original: form_data.get('original')
        }), 
        headers: {'X-CSRFToken':csrftoken}
      }).then((response) => {
        if (response.status == 204) {
          let popup = document.querySelector('.popup-window')
          popup.style.display = 'none';
          popup.querySelector('#maincontent').remove();

          // set value in session storage of first_to_load to load this link on refresh
          sessionStorage.setItem('firstToLoad', id);

          location.reload();
        }
        else if (response.status == 400) {
          notify('Invalid request.', 'fail')
        }
        else if (response.status == 500) {
          notify('Internal server error.', 'fail');
        }
        else {
          notify('Unexpected error occured.', 'fail');
        }
      });

      return false;
    }
  }
  else if (operation == 'remove') {
    displayPopup(width='90%');

    popup_cont = document.querySelector('.popup-content');
    content = document.querySelector('#pop-remove-markup').content;
    popup_cont.appendChild(document.importNode(content, true));

    popup_cont.querySelector('h5').innerHTML = `
      Are you sure you want to permanently <span class='text-danger'>remove</span> "${link_data.title}"?
    `;

    // fill data
    document.querySelector('#remove-datalist li:nth-child(1) span').innerHTML = link_data.original;
    document.querySelector('#remove-datalist li:nth-child(2) span').innerHTML = link_data.short_id;
    document.querySelector('#remove-datalist li:nth-child(3) span').innerHTML = link_data.clicks;

    // when form cancel button is clicked
    document.querySelector('#cancel-remove').onclick = function() {
      popup.style.display = 'none';
      popup.querySelector('#maincontent').remove();
    }

    document.querySelector('#manage-remove-form').onsubmit = () => {
      const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
      fetch(`/edit/${link_data.pk}`, {
        method: 'DELETE',
        headers: {'X-CSRFToken':csrftoken}
      })
      .then((response) => {
        if (response.status == 204) {
          let popup = document.querySelector('.popup-window')
          popup.style.display = 'none';
          popup.querySelector('#maincontent').remove();

          location.reload();
        }
        else if (response.status == 500) {
          notify('Internal server error.', 'fail');
        }
        else {
          notify('Unexpected error occured.', 'fail');
        }
      });
    }
  }
  else if (operation == 'toggleActive') {
    const toggler = document.querySelector('#switch-inp');
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(`/activetoggle/${link_data.pk}`,{
      method: 'PUT',

      headers: {'X-CSRFToken':csrftoken}
    })
    .then((response) => {
      if (response.status == 204) {     
        // set value in session storage of first_to_load to load this link on refresh
        sessionStorage.setItem('firstToLoad', id);
        
        location.reload();
      }
      else if (response.status == 400) {
        notify('Bad request.', 'fail');
      }
      else if (response.status == 500) {
        notify('Internal server error.', 'fail');
      }
      else {
        notify('Unexpected error occured.', 'fail');
      }
    });
  }
}

// manager buttons click listener
document.querySelector('#manage-copy').onclick = () => urlOps('copy');
document.querySelector('#manage-redirect').onclick = () => urlOps('redirect');
document.querySelector('#manage-qr').onclick = () => urlOps('qrcode');
document.querySelector('#manage-edit').onclick = () => urlOps('edit');
document.querySelector('#manage-remove').onclick = () => urlOps('remove');
document.querySelector('#switch-inp').onclick = () => urlOps('toggleActive');


