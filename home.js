//Code by Bruno
//Uri Variables
var categoriesUri = 'http://192.168.160.58/netflix/api/categories';
var titlesUri = 'http://192.168.160.58/netflix/api/titles';
var imageUri = 'https://api.themoviedb.org/3/search/movie?api_key=0bc1da750e2a1eee63910ae9652e526f&query=';
var secure_base_url = '';

//Numbers of items to be displayed in the carousels. 3 items if it's mobile, 6 if it's a PC.
var numOfItems_carousel = 6;

//JSON file stringified of the cowboy bebop object.
var bebop_json = '{"prof_api":{"Id":80208951,"Name":"Cowboy Bebop","DateAdded":"2018-04-07T00:00:00","Description":"In 2071, roughly fifty years after an accident with a hyperspace gateway made the Earth almost uninhabitable, humanity has colonized most of the rocky planets and moons of the Solar System. Amid a rising crime rate, the Inter Solar System Police (ISSP) set up a legalized contract system, in which registered bounty hunters (also referred to as Cowboys) chase criminals and bring them in alive in return for a reward.","Duration":"26 Sessions","ReleaseYear":1998,"Rating":{"Id":6,"Code":"TV-MA","Titles":0},"Type":{"Id":1,"Name":"Movie","Titles":0},"Actors":[{"Id":1491,"Name":"Kouichi Yamadera","Titles":0},{"Id":5350,"Name":"Unsho Ishizuka","Titles":0},{"Id":4104,"Name":"Megumi Hayashibara","Titles":0},{"Id":8053,"Name":"Aoi Tada","Titles":0},{"Id":2516,"Name":"Norio Wakamoto","Titles":0},{"Id":18998,"Name":"Tyrone Keogh","Titles":0},{"Id":18997,"Name":"Xu Qing","Titles":0}],"Countries":[{"Id":14,"Name":"China","Titles":0},{"Id":26,"Name":"South Africa","Titles":0},{"Id":2,"Name":"United States","Titles":0}],"Directors":[{"Id":2425,"Name":"Shinichiro Watanabe","Titles":0}],"Categories":[{"Id":1,"Name":"Action & Adventure","Titles":0},{"Id":1,"Name":"Anime Series","Titles":0},{"Id":1,"Name":"Crime","Titles":0},{"Id":1,"Name":"Drama, more","Titles":0}]},"movie_api":{"adult":false,"backdrop_path":"/gu9VOyEmCLQZ0yPweOY0zIOgV3.jpg","genre_ids":[28,878,53,9648],"id":470114,"original_language":"en","original_title":"Cowboy Bebop","overview":"An assassin seeks redemption after being given a second chance at life.","popularity":17.676,"poster_path":"/w0MXP33x1bq48TDC7IaNqQ8nxcc.jpg","release_date":"1998-10-26","title":"Cowboy Bebop","video":false,"vote_average":8.4,"vote_count":427}}'

//Start here.
$(document).ready(async function () {
  console.log("Hello world!");

  //Feeds the JSON object to the cowboy bebop button.
  bebop_script.innerHTML = (bebop_json);

  //Sets the num of items per carousel according to platform
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // true for mobile device
    numOfItems_carousel = 3;
  } else {
    // false for not mobile device
    numOfItems_carousel = 6;
  }

  //Gets the secure base url. This is used to get the image urls.
  await ajaxHelper('https://api.themoviedb.org/3/configuration?api_key=0bc1da750e2a1eee63910ae9652e526f', 'GET').done(function (result) {
    secure_base_url = result.images.secure_base_url;
  });

  //This here handles the header behaviour. On top, the header is transparent but it gets more opaque as the user scrolls down.
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
  //-------------------------------------------------------------------------

  //Start by getting the categories to display
  var categories = await GetCategories();

  //This is for creating multiple categories
  for (i = 0; i < categories.length; i++) {
    await CreateCategories(categories[i]);
  }
});

/*    CATEGORIES    */
//Gets all the categories from the API and returns it.
async function GetCategories() {
  console.log('Getting categories...');
  var composedUri = categoriesUri;

  _ajax = await ajaxHelper(composedUri, 'GET');

  return (_ajax.Categories);
}

/*    CREATE CATEGORIES    */
//Creates the carousels for each category.
async function CreateCategories(category) {

  //Gets all the titles of said category.
  var titles_to_display = await GetAvailableTitlesFromCategory(category);

  //If there are no titles associeted with said category, stop here. Category carousel will not be created.
  if (titles_to_display.length == 0)
    return;

  //Gets the category name.
  _name = category.Name;

  //Creates the carousel HTML elements programatically
  var carousel = document.createElement("div");
  carousel.id = _name;
  carousel.style = "padding-bottom: 5%;";

  var title = document.createElement("h2");
  title.className = "CategoryTitle";
  title.innerHTML = _name;

  var page = document.createElement("div");
  page.className = "multiple-items";

  //Creates each item of said category.
  for (j = 0; j < titles_to_display.length; j++) {
    CreateItem(titles_to_display[j], page);
  }

  //Sets up the carousel accordingly.
  carousel.appendChild(title);
  carousel.appendChild(page);
  parentDiv.appendChild(carousel);

  //Now enables the carousel. This is a Slick thing.
  EnableCarousel();
}

/*
Custom class that will be used later. This is basically the title object from the ITW Api with the TMDB Api in one single object for ease.
We do this because we need the poster / backdrop image path for displaying.
*/
class TitlePlusPoster {
  constructor(prof_api, movie_api) {
    this.prof_api = prof_api;
    this.movie_api = movie_api;
  }
}

/*
This function will go through each item from the category and will see if it qualifies for being displayed.
If it is qualified, then return it plus the poster / backdrop image path that will be used later.
*/
async function GetAvailableTitlesFromCategory(category) {
  console.log('Getting titles from category...');

  //Gets all the titles from said category. If it catches an error, abort.
  var category_composedUri = categoriesUri + "/" + category.Id;
  var titles_list = [];
  try {
    var _ajax = await ajaxHelper(category_composedUri, 'GET');
  }
  catch {
    return titles_list;
  }


  //Now, loops through each title from the category.
  //We only display up to 24 items. Display all the items would take too long.
  for (k = 0; k < Math.min(_ajax.Titles.length, 24); k++) {

    //Gets the reference for the currently iterating title.
    var title = _ajax.Titles[k];

    //Gets the complete information about the item through anothher Ajax Fetch. If it catches an error, skip to the next item of the array.
    var tiltes_composedUri = titlesUri + "/" + title.Id;
    try {
      var title_ajax = await ajaxHelper(tiltes_composedUri, 'GET');
    }
    catch {
      continue;
    }

    //We fetch the TMDB for the given title. If it catches an error, skip to the next item of the array.
    try {
      var search = await ajaxHelper(imageUri + title_ajax.Name + '&language=en-US&page=1', 'GET');
    }
    catch {
      continue;
    }

    //If there are no results, skip it.
    if (search === undefined || search.results.length === 0)
      continue;
    //If the result doesnt contain the name, skip it.
    if ((!search.results[0].title.includes(title_ajax.Name)))
      continue;
    //If the image is null, skip it.
    if (search.results[0].poster_path === null || search.results[0].backdrop_path === null)
      continue;

    //If it made it this far, then it qualifies. Make the TitlePlusPoster object with both API's object.
    var title_plus_poster = new TitlePlusPoster(title_ajax, search.results[0]);
    //Add it to the result array.
    titles_list.push(title_plus_poster);
  }

  //Return array with all the availables titles.
  return (titles_list);
}

//We are using this Jquery library called Slick to make carousels. Way fewer elements and classes than Bootstrap.
function EnableCarousel() {
  $('.multiple-items').not('.slick-initialized').slick({
    infinite: true,
    slidesToShow: numOfItems_carousel,
    slidesToScroll: numOfItems_carousel
  });
}

//This fuction creates the item HTML that's inside the carousel.
function CreateItem(title, _parentDiv) {

  //Gets the name.
  var _name = title.prof_api.Name;

  //Creates the HTML elements.
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

  //Sets it up accordingly.
  _itemDesc.appendChild(_title);
  itemDiv.appendChild(_itemDesc);
  itemDiv.appendChild(_img);
  anchor.appendChild(itemDiv);
  anchor.appendChild(script);
  _parentDiv.appendChild(anchor);
}

//This fuction is called when the user seraches for something.
function SearchBar() {

  //We make a reference of the form input...
  var _input = $("#search").val();

  //And if it's empty, we load the search HTML page and pass the search term over as a local storage item.
  if (_input != null && _input.trim() !== '') {
    localStorage.setItem("searchInput", _input);
    window.location.replace("search.html");
  }

};

//This function is called when we want to search for all the movies in the DB.
function OnlyMovies() {
  localStorage.setItem("searchInput", "Movies");
  window.location.replace("search.html");
};

//This function is called when we want to search for all the series in the DB.
function OnlySeries() {
  localStorage.setItem("searchInput", "Series");
  window.location.replace("search.html");
};

//This handles the mute-unmute behaviour from the video.
function Mute_Unmute() {
  video_banner.muted = !video_banner.muted;

  video_sound.src = video_banner.muted ? "images/mute.png" : "images/unmute.png";
};

//This fuction opens up the modal as well as sets up all the data.
function ModalOpen(tag) {
  $('#Modal').modal('show');

  //Gets the title thats being held in a script tag inside the title carousel item.
  var title = (JSON.parse(tag.getElementsByTagName('script')[0].innerHTML));

  //Sets up the backdrop image.
  $("#modal-backdrop").attr("src", secure_base_url + '/w500' + title.movie_api.backdrop_path);

  //Sets up the title, description, rating, release year, duration and the PG.
  $("#modal-title").text(title.prof_api.Name);
  $("#modal-description").text(title.prof_api.Description);
  $("#modal-rating").text(title.movie_api.vote_average + "★");
  $("#modal-year").text(title.prof_api.ReleaseYear);
  $("#modal-year").text(title.prof_api.ReleaseYear);
  $("#modal-duration").text(title.prof_api.Duration);
  $("#modal-pg").text(title.prof_api.Rating.Code);

  //Sets up the actors. Max of 5 actors.
  var _actors = "";

  if (title.prof_api.Actors == 0)
    _actors = "No cast";
  for (a = 0; a < title.prof_api.Actors.length; a++) {
    _actors = _actors + (title.prof_api.Actors[a].Name);
    if (a != title.prof_api.Actors.length - 1)
      _actors = _actors + ", ";

    if (a >= 5) {
      _actors = _actors + "more";
      break;
    }
  }

  _actors = _actors.trimEnd(',');
  $("#modal-elenco").text(_actors);

  //Sets up the categories. Max of 5 categories.
  var _categories = "";

  for (a = 0; a < title.prof_api.Categories.length; a++) {
    _categories = _categories + (title.prof_api.Categories[a].Name);
    if (a != title.prof_api.Categories.length - 1)
      _categories = _categories + ", ";

    if (a >= 5) {
      _categories = _categories + "more";
      break;
    }
  }
  _categories = _categories.trimEnd(',');
  $("#modal-categories").text(_categories);

  //Sets up the directors. Max of 5 directors.
  var _directors = "";

  if (title.prof_api.Directors.length == 0)
    _directors = "No diretor";
  for (a = 0; a < title.prof_api.Directors.length; a++) {
    _directors = _directors + (title.prof_api.Directors[a].Name);
    if (a != title.prof_api.Directors.length - 1)
      _directors = _directors + ", ";

    if (a >= 5) {
      _directors = _directors + "more";
      break;
    }
  }
  _directors = _directors.trimEnd(',');
  $("#modal-directors").text(_directors);

  //Makes it so that the user cannot scroll as long as the modal is open.
  $('html, body').css({
    'overflowY': 'hidden'
  });

}

//This function is called when the modal is closed and makes it so the user can scroll again.
$(document).on('hide.bs.modal', '#Modal', function () {
  $('html, body').css({
    'overflowY': 'auto', 'overflowX': 'hidden'
  });
});

//Internal function that makes it easier to make ajax fetches.
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