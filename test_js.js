//uri variables
var categoriesUri = 'http://192.168.160.58/netflix/api/categories';
var imageUri = 'https://api.themoviedb.org/3/search/movie?api_key=0bc1da750e2a1eee63910ae9652e526f&query=';
var secure_base_url = '';

$(document).ready(async function () {
  console.log("Hello world!");
  
  //Gets the secure base url
  await ajaxHelper('https://api.themoviedb.org/3/configuration?api_key=0bc1da750e2a1eee63910ae9652e526f', 'GET').done(function (result) {
    secure_base_url = result.images.secure_base_url;
  });

  //Start by getting the categories to display
  var categories = await GetCategories();

  console.log(categories);

  //This is for creating multiple categories
  categories.forEach(element => CreateCategories(element));
  //CreateCategories(categories[0]);

  //This handles the navbar hide
  const checkpoint = 800;

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll <= checkpoint) {
      opacity = currentScroll / checkpoint;
    } else {
      opacity = 1;
    }
    $(".header").css("background-color"," rgba(0,0,0,"+ opacity+")");
  });

});

//--- GET CATEGORIES
async function GetCategories() {
  console.log('Getting categories...');
  var composedUri = categoriesUri + "?page=" + 1 + "&pageSize=" + 30;

  _ajax = await ajaxHelper(composedUri, 'GET');

  return (_ajax.Categories);
}

async function CreateCategories(category) {

  var titles_to_display = await GetAvailableTitlesFromCategory(category);

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
    for (i = 0; i < titles_to_display.length; i++) {
        CreateItem(titles_to_display[i], page);
    }

    carousel.appendChild(title);
    carousel.appendChild(page);
    parentDiv.appendChild(carousel);

    $('.multiple-items').not('.slick-initialized').slick({
        infinite: true,
        slidesToShow: 6,
        slidesToScroll: 6
    });
}

class TitlePlusPoster {
  constructor(title, poster) {
    this.title = title;
    this.poster = poster;
  }
}

async function GetAvailableTitlesFromCategory(category) {
  console.log('Getting titles from category...');

  var composedUri = categoriesUri + "/" + category.Id;

  _ajax = await ajaxHelper(composedUri, 'GET');

  var titles_list = [];

  for (i = 0; i < Math.min(_ajax.Titles.length, 30); i++) {

    var title = _ajax.Titles[i];

    //If the name contains ?, skip it
    if (title.Name.includes("?"))
      continue;

    //If it already exists, skip it
    if (titles_list.indexOf(title) !== -1)
      continue;

    //Gets the image
    var hasImage = true;
    var img_path = "n/a";

    await ajaxHelper(imageUri + title.Name + '&language=en-US&page=1', 'GET').done(function (search) {

      console.log(search.results[0]);

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
    });

    if (!hasImage)
      continue;

    var title_plus_poster = new TitlePlusPoster(title, img_path);

    titles_list.push(title_plus_poster);
  }

  return (titles_list);
}

function CreateItem(title, _parentDiv) {
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
    _parentDiv.appendChild(itemDiv);
}

//--- GET TITLES
function GetTitlesByCategory(id, name) {
  //console.log('Getting titles of the category '+name+'...');
  var composedUri = self.categoriesUri() + "/" + id;
  ajaxHelper(composedUri, 'GET').done(function (data) {
    //console.log(data);
    return data;
  });
}

  //--- GET IMAGE
  function GetImageByID(id) {
    //console.log('Getting titles of the category '+name+'...');
    ajaxHelper('https://api.themoviedb.org/3/movie/'+id+'/images?api_key=0bc1da750e2a1eee63910ae9652e526f', 'GET').done(function (img) {
      console.log("IMG "+img)
    });
  }

//--- GET ID
function GetTitleID(title) {
  //console.log('Getting titles of the category '+name+'...');
  var composedUri = 'https://api.themoviedb.org/3/search/movie?api_key=0bc1da750e2a1eee63910ae9652e526f&query=' + title + '&page=1';
  ajaxHelper(composedUri, 'GET').done(function (data) {
    if (data != undefined && data.result != undefined && data.result[0].id != undefined)
      return data.results[0].id
    else
      return null;
  });
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
      //console.log("AJAX Call[" + uri + "] Fail...");
    }
  });
}