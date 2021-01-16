//uri variables
var allMovies = 'http://192.168.160.58/netflix/api/Movies';
var allSeries = 'http://192.168.160.58/netflix/api/Series';


var searchActorUri = 'http://192.168.160.58/netflix/api/search/Actors?name=';
var searchCategoriesUri = 'http://192.168.160.58/netflix/api/search/Categories?name=';
var searchDirectorsUri = 'http://192.168.160.58/netflix/api/search/Directors?name=';
var searchTitlesUri = 'http://192.168.160.58/netflix/api/search/Titles?name=';
var searchCountryUri = 'http://192.168.160.58/netflix/api/search/Countries?name=';

var actorUri = 'http://192.168.160.58/netflix/api/Actors/';
var categoryUri = 'http://192.168.160.58/netflix/api/Categories/';
var directorsUri = 'http://192.168.160.58/netflix/api/Directors/';
var titlesUri = 'http://192.168.160.58/netflix/api/Titles/';
var countryUri = 'http://192.168.160.58/netflix/api/Countries/';


var imageUri = 'https://api.themoviedb.org/3/search/movie?api_key=0bc1da750e2a1eee63910ae9652e526f&query=';
var secure_base_url = '';

var titles_added = [];

$(document).ready(async function () {
    console.log("Hello world!");

    loading.style = "display: inline";

    //Gets the secure base url
    await ajaxHelper('https://api.themoviedb.org/3/configuration?api_key=0bc1da750e2a1eee63910ae9652e526f', 'GET').done(function (result) {
        secure_base_url = result.images.secure_base_url;
    });

    var _search = (localStorage.getItem("searchInput"));

    //Only movies
    if (_search === "Movies") {
        ShowMovies();
        return;
    }

    //Only series
    if (_search === "Series") {
        ShowSeries();
        return;
    }

    Search(_search);

});

async function ShowMovies(){
    console.log('Getting all movies...');
    var composedUri = allMovies + "?page="+getRandomInt(1,30)+"&pagesize=100";

    _ajax = await ajaxHelper(composedUri, 'GET');

    GetTitleWPoster(_ajax.Titles);
}

async function ShowSeries(){
    console.log('Getting all series...');
    var composedUri = allSeries + "?page="+getRandomInt(1,30)+"&pagesize=100";

    _ajax = await ajaxHelper(composedUri, 'GET');

    GetTitleWPoster(_ajax.Titles);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function Search(_search) {
    var _total = [];

    var actors = await GetActors(_search);
    var categories = await GetCategories(_search);
    var directors = await GetDirectors(_search);
    var titles = await GetTitles(_search);
    var country = await GetCountries(_search);
}

//--- GET ACTORS
async function GetActors(_term) {

    console.log('Getting actors...');
    var composedUri = searchActorUri + _term;

    _ajax = await ajaxHelper(composedUri, 'GET');


    for (a = 0; a < _ajax.length; a++) {
        _result = await ajaxHelper(actorUri + _ajax[a].Id, 'GET');

        GetTitleWPoster(_result.Titles);
    }
}

//--- GET CATEGORIES
async function GetCategories(_term) {

    console.log('Getting categories...');
    var composedUri = searchCategoriesUri + _term;

    _ajax = await ajaxHelper(composedUri, 'GET');

    for (a = 0; a < _ajax.length; a++) {
        _result = await ajaxHelper(categoryUri + _ajax[a].Id, 'GET');

        GetTitleWPoster(_result.Titles);
    }
}

//--- GET DIRECTORS
async function GetDirectors(_term) {

    console.log('Getting directors...');
    var composedUri = searchDirectorsUri + _term;

    _ajax = await ajaxHelper(composedUri, 'GET');

    for (a = 0; a < _ajax.length; a++) {
        _result = await ajaxHelper(directorsUri + _ajax[a].Id, 'GET');

        GetTitleWPoster(_result.Titles);
    }
}

//--- GET TITLES
async function GetTitles(_term) {
    console.log('Getting titles...');
    var composedUri = searchTitlesUri + _term;

    _ajax = await ajaxHelper(composedUri, 'GET');

    GetTitleWPoster(_ajax);
}

//--- GET COUNTRY
async function GetCountries(_term) {
    console.log('Getting countries...');
    var composedUri = searchCountryUri + _term;

    _ajax = await ajaxHelper(composedUri, 'GET');

    for (a = 0; a < _ajax.length; a++) {
        _result = await ajaxHelper(countryUri + _ajax[a].Id, 'GET');

        GetTitleWPoster(_result.Titles);
    }
}

async function GetTitleWPoster(titles) {
    for (i = 0; i < titles.length; i++) {

        var title = titles[i];

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

        titles_added.indexOf(title_ajax.Name) === -1 ? titles_added.push(title_ajax.Name) : console.log("This item already exists");

        CreateItem(title_plus_poster);
    }
    loading.style = "display: none";
}

class TitlePlusPoster {
    constructor(prof_api, movie_api) {
      this.prof_api = prof_api;
      this.movie_api = movie_api;
    }
  }

function CreateItem(title) {
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
  parentGrid.appendChild(anchor);
}

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

//Search
$(document).on("click", "#search-button", function () {

    var _input = $("#search-input").val();

    if (_input != null && _input.trim() !== '') {
        localStorage.setItem("searchInput", _input);
        window.location.replace("search.html");
    }

});

//Only movies
function OnlyMovies () {
    localStorage.setItem("searchInput", "Movies");
    window.location.replace("search.html");
  };
  
  //Only series
  function OnlySeries () {
    localStorage.setItem("searchInput", "Series");
    window.location.replace("search.html");
  };

  
//Open Modal
function ModalOpen(tag) {
    $('#Modal').modal('show');
  
    var title = (JSON.parse(tag.getElementsByTagName('script')[0].innerHTML));
  console.log(title)
  
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
  
      if(a >= 5)
      {
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