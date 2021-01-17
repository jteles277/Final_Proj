//Code by Bruno. Hire me
//Uri Variables
var allMovies = 'http://192.168.160.58/netflix/api/Movies';
var allSeries = 'http://192.168.160.58/netflix/api/Series';

//Uri search variables
var searchActorUri = 'http://192.168.160.58/netflix/api/search/Actors?name=';
var searchCategoriesUri = 'http://192.168.160.58/netflix/api/search/Categories?name=';
var searchDirectorsUri = 'http://192.168.160.58/netflix/api/search/Directors?name=';
var searchTitlesUri = 'http://192.168.160.58/netflix/api/search/Titles?name=';
var searchCountryUri = 'http://192.168.160.58/netflix/api/search/Countries?name=';

//Uri variables for more information
var actorUri = 'http://192.168.160.58/netflix/api/Actors/';
var categoryUri = 'http://192.168.160.58/netflix/api/Categories/';
var directorsUri = 'http://192.168.160.58/netflix/api/Directors/';
var titlesUri = 'http://192.168.160.58/netflix/api/Titles/';
var countryUri = 'http://192.168.160.58/netflix/api/Countries/';

//TMDB Uris.
var imageUri = 'https://api.themoviedb.org/3/search/movie?api_key=0bc1da750e2a1eee63910ae9652e526f&query=';
var secure_base_url = '';

//This is array containing the name of the added titles so that we can keep track of them and not add things more than once.
var titles_added = [];

//Start here.
$(document).ready(async function () {
  console.log("Hello world!");

  //Makes the loading dots visible.
  loading.style = "display: inline";

  //Gets the secure base url. This is used to get the image urls.
  await ajaxHelper('https://api.themoviedb.org/3/configuration?api_key=0bc1da750e2a1eee63910ae9652e526f', 'GET').done(function (result) {
    secure_base_url = result.images.secure_base_url;
  });

  //Gets the search term that has been stored.
  var _search = (localStorage.getItem("searchInput"));
  console.log("Search for term:" + _search)

  //If it's do display only movies, then do it.
  if (_search === "Movies") {
    movies_label.className = "active";
    ShowMovies();
    return;
  }

  //If it's do display only series, then do it.
  if (_search === "Series") {
    series_label.className = "active";
    ShowSeries();
    return;
  }

  //If not, just search for the term.
  Search(_search);

});

/*    SHOW MOVIES    */
async function ShowMovies() {
  //Gets a slice of 100 items from all the movies and creates it.
  console.log('Getting all movies...');
  var composedUri = allMovies + "?page=1" + "&pagesize=1000";

  _ajax = await ajaxHelper(composedUri, 'GET');

  //Shuffles the array so that it does not always display items in the same order.
  (shuffleArray(_ajax.Titles));

  GetAvailableTitles(_ajax.Titles);
}

async function ShowSeries() {
  //Gets a slice of 100 items from all the series and creates it.
  console.log('Getting all series...');
  var composedUri = allSeries + "?page=1" + "&pagesize=1000";

  _ajax = await ajaxHelper(composedUri, 'GET');

  //Shuffles the array so that it does not always display items in the same order.
  (shuffleArray(_ajax.Titles));

  GetAvailableTitles(_ajax.Titles);
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
}


/*    SEARCH TITLES    */
async function Search(_search) {
  //Search for the term in all of the below methods.

  await GetActors(_search);
  await GetCategories(_search);
  await GetDirectors(_search);
  await GetTitles(_search);
  await GetCountries(_search);
}

/*    GET ACTORS    */
async function GetActors(_term) {

  console.log('Getting actors...');
  var composedUri = searchActorUri + _term;

  _ajax = await ajaxHelper(composedUri, 'GET');

  //Gets all actors found with given term, then loop through all the movies they did and generate them.
  for (a = 0; a < _ajax.length; a++) {
    _result = await ajaxHelper(actorUri + _ajax[a].Id, 'GET');

    GetAvailableTitles(_result.Titles);
  }
}

/*    GET CATEGORIES    */
async function GetCategories(_term) {

  console.log('Getting categories...');
  var composedUri = searchCategoriesUri + _term;

  _ajax = await ajaxHelper(composedUri, 'GET');

  //Gets all categories found with given term, then loop through all the movies and generate them.
  for (a = 0; a < _ajax.length; a++) {
    _result = await ajaxHelper(categoryUri + _ajax[a].Id, 'GET');

    GetAvailableTitles(_result.Titles);
  }
}

/*    GET DIRECTORS    */
async function GetDirectors(_term) {

  console.log('Getting directors...');
  var composedUri = searchDirectorsUri + _term;

  _ajax = await ajaxHelper(composedUri, 'GET');

  //Gets all directors found with given term, then loop through all the movies they did and generate them.
  for (a = 0; a < _ajax.length; a++) {
    _result = await ajaxHelper(directorsUri + _ajax[a].Id, 'GET');

    GetAvailableTitles(_result.Titles);
  }
}

/*    GET TITLES    */
async function GetTitles(_term) {
  console.log('Getting titles...');
  var composedUri = searchTitlesUri + _term;

  _ajax = await ajaxHelper(composedUri, 'GET');

  //Generate all the titles found.
  GetAvailableTitles(_ajax);
}

/*    GET COUNTRIES    */
async function GetCountries(_term) {
  console.log('Getting countries...');
  var composedUri = searchCountryUri + _term;

  _ajax = await ajaxHelper(composedUri, 'GET');

  //Gets all countries found with given term, then loop through all the movies they did and generate them.
  for (a = 0; a < _ajax.length; a++) {
    _result = await ajaxHelper(countryUri + _ajax[a].Id, 'GET');

    GetAvailableTitles(_result.Titles);
  }
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
async function GetAvailableTitles(titles) {
    //Now, loops through each title.
  for (i = 0; i < titles.length; i++) {

    //Gets the reference for the currently iterating title.
    var title = titles[i];

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
    //If the title was not already added, add it and generate it.
    if (!titles_added.includes(title_ajax.Name))
      titles_added.push(title_ajax.Name);
    else
      break;
    CreateItem(title_plus_poster);

  }
  //Turns off the loading dots.
  loading.style = "display: none";
}

//This fuction creates the item HTML that's inside the grid.
function CreateItem(title) {

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
  parentGrid.appendChild(anchor);
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
