//uri variables
var categoriesUri = 'http://192.168.160.58/netflix/api/categories';
var titlesUri = 'http://192.168.160.58/netflix/api/titles';
var imageUri = 'https://api.themoviedb.org/3/search/movie?api_key=0bc1da750e2a1eee63910ae9652e526f&query=';
var secure_base_url = '';

var numOfItems_carousel = 6;

$(document).ready(async function () {
  console.log("Hello world!");


  //Sets the num of items per carousel according to platform
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // true for mobile device
    numOfItems_carousel = 3;
  } else {
    // false for not mobile device
    numOfItems_carousel = 6;
  }

  //Gets the secure base url
  await ajaxHelper('https://api.themoviedb.org/3/configuration?api_key=0bc1da750e2a1eee63910ae9652e526f', 'GET').done(function (result) {
    secure_base_url = result.images.secure_base_url;
  });

  //This handles the navbar hide
  const checkpoint = 800;

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll <= checkpoint) {
      opacity = currentScroll / checkpoint;
    } else {
      opacity = 1;
    }
    $(".header").css("background-color", " rgba(20,20,20," + opacity + ")");
  });

  //Start by getting the categories to display
  var categories = await GetCategories();

  //This is for creating multiple categories
  for (i = 0; i < categories.length; i++) {
    await CreateCategories(categories[i]);
  }
  //CreateCategories(categories[0]);
});

//--- GET CATEGORIES
async function GetCategories() {
  console.log('Getting categories...');
  var composedUri = categoriesUri;

  _ajax = await ajaxHelper(composedUri, 'GET');

  return (_ajax.Categories);
}

async function CreateCategories(category) {

  var titles_to_display = await GetAvailableTitlesFromCategory(category);
  if (titles_to_display.length == 0)
    return;

  _name = category.Name;

  var carousel = document.createElement("div");
  carousel.id = _name;
  carousel.style = "padding-bottom: 5%;";

  var title = document.createElement("h2");
  title.className = "CategoryTitle";
  title.innerHTML = _name;

  var page = document.createElement("div");
  page.className = "multiple-items";

  //Folhas container
  for (j = 0; j < titles_to_display.length; j++) {
    CreateItem(titles_to_display[j], page);
  }

  carousel.appendChild(title);
  carousel.appendChild(page);
  parentDiv.appendChild(carousel);

  UpdateCarousel();
}

function UpdateCarousel() {
  $('.multiple-items').not('.slick-initialized').slick({
    infinite: true,
    slidesToShow: numOfItems_carousel,
    slidesToScroll: numOfItems_carousel
  });
}

class TitlePlusPoster {
  constructor(prof_api, movie_api) {
    this.prof_api = prof_api;
    this.movie_api = movie_api;
  }
}

async function GetAvailableTitlesFromCategory(category) {
  console.log('Getting titles from category...');

  var category_composedUri = categoriesUri + "/" + category.Id;

  var titles_list = [];

  try {
    var _ajax = await ajaxHelper(category_composedUri, 'GET');
  }
  catch {
    return titles_list;
  }


  for (k = 0; k < Math.min(_ajax.Titles.length, 24); k++) {

    var title = _ajax.Titles[k];

    var tiltes_composedUri = titlesUri + "/" + title.Id;

    try {
      var title_ajax = await ajaxHelper(tiltes_composedUri, 'GET');
    }
    catch {
      continue;
    }

    //Gets the image
    var hasImage = true;

    try {
      var search = await ajaxHelper(imageUri + title_ajax.Name + '&language=en-US&page=1', 'GET');
    }
    catch {
      continue;
    }

    //If there are no results, skip it
    if (search === undefined || search.results.length === 0) {
      hasImage = false;
    }
    else {
      //If the result doesnt contain the name, skip it.
      if ((!search.results[0].title.includes(title_ajax.Name))) {
        hasImage = false;
      }
      else {
        //If the image is null, skip it.
        if (search.results[0].poster_path === null || search.results[0].backdrop_path === null)
          hasImage = false;
      }
    }


    if (!hasImage)
      continue;

    var title_plus_poster = new TitlePlusPoster(title_ajax, search.results[0]);

    titles_list.push(title_plus_poster);
  }

  return (titles_list);
}

function CreateItem(title, _parentDiv) {
  //Creates all the titles labels
  //Loops through each title in a given category and creates an image.

  var _name = title.prof_api.Name;

  var anchor = document.createElement("a");
  anchor.setAttribute("onClick", "ModalOpen(this);");
  anchor.href = "javascript:void(0);";

  var script = document.createElement("script");
  script.innerHTML = JSON.stringify(title);

  var itemDiv = document.createElement("div");
  itemDiv.className = "item";

  var _img = document.createElement("img");
  _img.src = secure_base_url + '/w500' + title.movie_api.poster_path;
  _img.alt = _name;

  var _itemDesc = document.createElement("div");
  _itemDesc.className = "itemDesc";

  var _title = document.createElement("h4");
  _title.className = "FilmTitle";
  _title.innerHTML = _name;

  _itemDesc.appendChild(_title);
  itemDiv.appendChild(_itemDesc);
  itemDiv.appendChild(_img);
  anchor.appendChild(itemDiv);
  anchor.appendChild(script);
  _parentDiv.appendChild(anchor);
}

//Search
$(document).on("click", "#search-button", function () {

  var _input = $("#search-input").val();

  if (_input != null && _input.trim() !== '') {
    localStorage.setItem("searchInput", _input);
    window.location.replace("search.html");
  }

});

//Only movies
function OnlyMovies() {
  localStorage.setItem("searchInput", "Movies");
  window.location.replace("search.html");
};

//Only series
function OnlySeries() {
  localStorage.setItem("searchInput", "Series");
  window.location.replace("search.html");
};

//Mute-unmute
function Mute_Unmute() {
  video_banner.muted = !video_banner.muted;

  video_sound.src = video_banner.muted ? "images/mute.png" : "images/unmute.png";
};

//Open Modal
function ModalOpen(tag) {
  $('#Modal').modal('show');

  var title = (JSON.parse(tag.getElementsByTagName('script')[0].innerHTML));
  console.log(title.prof_api)

  $("#modal-backdrop").attr("src", secure_base_url + '/w500' + title.movie_api.backdrop_path);

  $("#modal-title").text(title.prof_api.Name);
  $("#modal-description").text(title.prof_api.Description);
  $("#modal-rating").text(title.movie_api.vote_average + "★");
  $("#modal-year").text(title.prof_api.ReleaseYear);
  $("#modal-year").text(title.prof_api.ReleaseYear);
  $("#modal-duration").text(title.prof_api.Duration);

  var _actors = "";

  if (title.prof_api.Actors == 0)
    _actors = "Nenhum elenco";
  for (a = 0; a < title.prof_api.Actors.length; a++) {
    _actors = _actors + (title.prof_api.Actors[a].Name);
    if (a != title.prof_api.Actors.length - 1)
      _actors = _actors + ", ";

    if (a >= 5) {
      _actors = _actors + "mais";
      break;
    }
  }

  _actors = _actors.trimEnd(',');
  $("#modal-elenco").text(_actors);

  var _categories = "";

  for (a = 0; a < title.prof_api.Categories.length; a++) {
    _categories = _categories + (title.prof_api.Categories[a].Name);
    if (a != title.prof_api.Categories.length - 1)
      _categories = _categories + ", ";

    if (a >= 5) {
      _categories = _categories + "mais";
      break;
    }
  }
  _categories = _categories.trimEnd(',');
  $("#modal-categories").text(_categories);

  var _directors = "";

  if (title.prof_api.Directors.length == 0)
    _directors = "Nenhum diretor";
  for (a = 0; a < title.prof_api.Directors.length; a++) {
    _directors = _directors + (title.prof_api.Directors[a].Name);
    if (a != title.prof_api.Directors.length - 1)
      _directors = _directors + ", ";

    if (a >= 5) {
      _directors = _directors + "mais";
      break;
    }
  }
  _directors = _directors.trimEnd(',');
  $("#modal-directors").text(_directors);

  $("#modal-pg").text(title.prof_api.Rating.Code);

  $('html, body').css({
    overflow: 'hidden'
  });

}

$(document).on('hide.bs.modal', '#Modal', function () {
  $('html, body').css({
    overflow: 'auto'
  });
});

//--- Internal functions
function ajaxHelper(uri, method, data) {
  return $.ajax({
    type: method,
    url: uri,
    dataType: 'json',
    contentType: 'application/json',
    data: data ? JSON.stringify(data) : null,
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("AJAX Call[" + uri + "] Fail...");
    }
  });
}