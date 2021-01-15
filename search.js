//uri variables
var allMovies = 'http://192.168.160.58/netflix/api/Movies';
var allSeries = 'http://192.168.160.58/netflix/api/Series';


var searchActorUri = 'http://192.168.160.58/netflix/api/search/Actors?name=';
var searchCategoriesUri = 'http://192.168.160.58/netflix/api/search/Categories?name=';
var searchDirectorsUri = 'http://192.168.160.58/netflix/api/search/Directors?name=';
var searchTitlesUri = 'http://192.168.160.58/netflix/api/search/Titles?name=';
var searchCountryUri = 'http://192.168.160.58/netflix/api/search/Countries?name=';

var imageUri = 'https://api.themoviedb.org/3/search/movie?api_key=0bc1da750e2a1eee63910ae9652e526f&query=';
var secure_base_url = '';

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

    GetTitleWPoster(_ajax);
}

//--- GET CATEGORIES
async function GetCategories(_term) {
    console.log('Getting categories...');
    var composedUri = searchCategoriesUri + _term;

    _ajax = await ajaxHelper(composedUri, 'GET');

    GetTitleWPoster(_ajax);
}

//--- GET DIRECTORS
async function GetDirectors(_term) {
    console.log('Getting directors...');
    var composedUri = searchDirectorsUri + _term;

    _ajax = await ajaxHelper(composedUri, 'GET');

    GetTitleWPoster(_ajax);
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

    GetTitleWPoster(_ajax);
}

async function GetTitleWPoster(titles) {
    for (i = 0; i < titles.length; i++) {

        var title = titles[i];

        //Gets the image
        var hasImage = true;
        var img_path = "n/a";


        try {
            var search = await ajaxHelper(imageUri + title.Name + '&language=en-US&page=1', 'GET');
        }
        catch {
            continue;
        }

        console.log(search);

        //If there are no results, skip it
        if (search === undefined || search.results.length === 0) {
            hasImage = false;
        }
        else {
            //If the result doesnt contain the name, skip it.
            if ((!search.results[0].title.includes(title.Name))) {
                hasImage = false;
            }
            else {
                //If the image is null, skip it.
                if (search.results[0].poster_path === null)
                    hasImage = false;
                else
                    //Finally, gets the image path
                    img_path = secure_base_url + '/w500' + search.results[0].poster_path;
            }
        }


        if (!hasImage)
            continue;

        var title_plus_poster = new TitlePlusPoster(title, img_path);

        CreateItem(title_plus_poster);
    }
    loading.style = "display: none";
}

class TitlePlusPoster {
    constructor(title, poster) {
        this.title = title;
        this.poster = poster;
    }
}

function CreateItem(title) {
    //Creates all the titles labels
    //Loops through each title in a given category and creates an image.
    var _name = title.title.Name;
    var _duration = title.title.Duration;

    var itemDiv = document.createElement("div");
    itemDiv.className = "item";

    var _img = document.createElement("img");
    _img.src = title.poster;
    _img.alt = _name;

    var _itemDesc = document.createElement("div");
    _itemDesc.className = "itemDesc";

    var _title = document.createElement("h4");
    _title.className = "FilmTitle";
    _title.innerHTML = _name;

    _itemDesc.appendChild(_title);
    itemDiv.appendChild(_itemDesc);
    itemDiv.appendChild(_img);
    parentGrid.appendChild(itemDiv);
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