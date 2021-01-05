//uri variables
var categoriesUri = 'http://192.168.160.58/netflix/api/categories';
var secure_base_url = '';

$(document).ready(function () {
  console.log("Hello world!");


  //Gets the secure base url
  ajaxHelper('https://api.themoviedb.org/3/configuration?api_key=0bc1da750e2a1eee63910ae9652e526f', 'GET').done(function (result) {
    secure_base_url = result.images.secure_base_url;
  });

  //Start by getting the categories to display
  var categories = GetCategories();
});

//--- GET CATEGORIES
function GetCategories() {
  console.log('Getting categories...');
  var composedUri = categoriesUri + "?page=" + 1 + "&pageSize=" + 30;
  ajaxHelper(composedUri, 'GET').done(function (data) {
    //console.log(data);
    //return data.Categories;
    data.Categories.forEach(element => create_image(element));
  });
}

function create_image(category) {
  //Creates the list that will hold the category label as well as the titles list
  var outer_list = document.createElement("ul");
  //Creates the category label
  var label = document.createElement("Label");
  //Sets up the label text to match the category
  label.innerHTML = category.Name;
  //Creates a inner list that will hold the titles of the category
  var inner_list = document.createElement("ul");

  //Creates all the titles labels
  var composedUri = categoriesUri + "/" + category.Id;
  ajaxHelper(composedUri, 'GET').done(function (title) {
    //Loops through each title in a given category and creates an image.
    for (i = 0; i < Math.min(title.Titles.length, 10); i++) {
      var _name = title.Titles[i].Name;

console.log(_name);

      //Gets the image
      ajaxHelper('https://api.themoviedb.org/3/search/movie?api_key=0bc1da750e2a1eee63910ae9652e526f&query=' + _name + '&page=1', 'GET').done(function (search) {

        if(search.results.length != 0 && search.results[0].poster_path != null){
        var img_path = secure_base_url + '/w500' + search.results[0].poster_path;
        console.log(img_path);

        var titleImg = document.createElement("img");
        titleImg.src = img_path;
        titleImg.alt = _name;

        inner_list.appendChild(titleImg);

        }
      });
    }
  });

  //Makes the category label and the titles list child of the outer list.
  outer_list.appendChild(label);
  outer_list.appendChild(inner_list);

  //Makes the outer list, that holds everything, a child of the div that holds all the categories.
  parentDiv.appendChild(outer_list);
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