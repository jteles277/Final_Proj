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
    //Creates all the titles labels
    var composedUri = categoriesUri + "/" + category.Id;
    ajaxHelper(composedUri, 'GET').done(function (title) {
        //Loops through each title in a given category and creates an image.
        for (i = 0; i < 6; i++) {
            var _name = title.Titles[i].Name;
            var _duration = title.Titles[i].Duration;

            //console.log(_name);

            var div0 = document.createElement("div");
            div0.className = "col-md-2 peepee";
            div0.style = "padding-left: 0px;";

            var div1 = document.createElement("div");
            div1.className = "vid row text-center";
            
            var div2 = document.createElement("div");
            div2.id = _name;
            div2.className = "Int col-md-11 offset-1 xpto";
            div2.style = "word-wrap: break-word;";

            var div_empty = document.createElement("div");
            div_empty.className = "Empt";

            var div_inf = document.createElement("div");
            div_inf.className = "Inf";

            var list = document.createElement("ul");

            var li_name = document.createElement("li");
            li_name.innerHTML = "Name: "+_name;
            var li_duration = document.createElement("li");
            li_duration.innerHTML = "Duration: " + _duration;
            var li_type = document.createElement("li");
            li_type.innerHTML = "Type:";
            var li_button = document.createElement("li");

            var expand_button = document.createElement("button");
            expand_button.className = "btn btn-light";
            expand_button.style = "margin-left: 70%;";
            expand_button.type = "button";
            expand_button.data_toggle = "modal";
            expand_button.data_target = "#myModal";
            expand_button.innerHTML = "V";

            li_button.appendChild(expand_button);
            list.appendChild(li_name);
            list.appendChild(li_duration);
            list.appendChild(li_type);
            list.appendChild(li_button);
            div_inf.appendChild(list);
            div2.appendChild(div_inf);
            div2.appendChild(div_empty);
            div1.appendChild(div2);
            div0.appendChild(div1);
            parentDiv.appendChild(div0);

            //Gets the image
            ajaxHelper('https://api.themoviedb.org/3/search/movie?api_key=0bc1da750e2a1eee63910ae9652e526f&query=' + _name + '&page=1', 'GET').done(function (search) {

                if (search.results.length != 0 && search.results[0].poster_path != null) {
                    var img_path = secure_base_url + '/w500' + search.results[0].poster_path;
                    console.log(img_path);

                    div2.style.background_image = "https://image.tmdb.org/t/p//w500/vES8WAzjowrMT8gwnoEaCioZXXk.jpg";

                    $(".peepee").css({"background-image": "url('"+img_path+"')"});

                    div2.alt = _name;
        }
      });
    }
  });
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