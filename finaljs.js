//uri variables
var categoriesUri = 'http://192.168.160.58/netflix/api/categories';
var imageUri = 'https://api.themoviedb.org/3/search/movie?api_key=0bc1da750e2a1eee63910ae9652e526f&query=';
var secure_base_url = '';
var temp = 0;

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
  //categories.forEach(element => CreateCategories(element));
  CreateCategories(categories[0]);
  //create_image(categories[0]);

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
  var num_of_pages = Math.ceil(titles_to_display.length / 6);

  _name = category.Name;

  //Bloco de categoria
  var div0 = document.createElement("div");
  div0.className = "container";
  div0.style = "width: 100%; padding-left: 0px; padding-right: 0px; margin:0px; max-width: 9600px;";

  //Carrosel
  var div1 = document.createElement("div");
  div1.id = "carousel"+category.Id;
  div1.className = "carousel slide";
  div1.style = "height: auto;";
  div1.setAttribute("data-ride","carousel")
  div1.setAttribute("data-interval","false")

  //Title
  var title = document.createElement("h5");
  title.className = "Cat";
  title.innerHTML = _name;

  //Pontinhos list
  var pontinho_list = document.createElement("ol");
  pontinho_list.className = "carousel-indicators";
  pontinho_list.style = "padding-top: 100px;";

  //Folhas container
  var page_container = document.createElement("div");
  page_container.className = "carousel-inner";
  CreatePages(titles_to_display ,num_of_pages, pontinho_list, page_container, div1.id);

  //Prev button
  var prevButton = document.createElement("a");
  prevButton.className = "carousel-control-prev";
  prevButton.href = "#"+div1.id;
  prevButton.setAttribute("role","button");
  prevButton.setAttribute("data_slide","prev");
  prevButton.style = "width: 80px; padding-top: 100px;";

  var span1_prev = document.createElement("span");
  span1_prev.className = "carousel-control-prev-icon";
  span1_prev.aria_hidden = true;

  var span2_prev = document.createElement("span");
  span2_prev.className = "sr-only";
  span2_prev.innerHTML = "Previous";

  //Next button
  var nextButton = document.createElement("a");
  nextButton.className = "carousel-control-next";
  nextButton.href = "#"+div1.id;
  nextButton.setAttribute("role","button");
  nextButton.setAttribute("data_slide","next");
  nextButton.style = "width: 80px; padding-top: 100px;";

  var span1_next = document.createElement("span");
  span1_next.className = "carousel-control-next-icon";
  span1_next.aria_hidden = true;

  var span2_next = document.createElement("span");
  span2_next.className = "sr-only";
  span2_next.innerHTML = "Next";

  //-------------

  nextButton.appendChild(span1_next);
  nextButton.appendChild(span2_next);

  prevButton.appendChild(span1_prev);
  prevButton.appendChild(span2_prev);

  div1.appendChild(title);

  div1.appendChild(pontinho_list);

  div1.appendChild(page_container);

  div1.appendChild(prevButton);
  div1.appendChild(nextButton);

  div0.appendChild(div1);
  parentBody.appendChild(div0);
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

function CreatePages(titles, num_of_pages, pontinho_list, page_container, carouselId) {
  for (i = 0; i < num_of_pages; i++) {
    //Pontinhos item
    var pontinho_item = document.createElement("li");
    pontinho_item.data_target = "#"+carouselId;
    pontinho_item.data_slide_to = i;
    if (i == 0)
      pontinho_item.className = "active";

    pontinho_list.appendChild(pontinho_item);

    //Create pages
    var div0 = document.createElement("div");
    if (i == 0)
      div0.className = "carousel-item active";
    else
      div0.className = "carousel-item";

    var div1 = document.createElement("div");
    div1.className = "row";
    div1.style = "padding-top: 38px; height: 450px;";

    var div2 = document.createElement("div");
    div2.className = "container-fluid";
    div2.style = "padding-top: 100px;";

    var div3 = document.createElement("div");
    div3.className = "row";
    div3.style = "padding-left: 12%; padding-right: 10%;";

    div2.appendChild(div3);
    div1.appendChild(div2);
    div0.appendChild(div1);
    page_container.appendChild(div0);

    //Create items
    var start = 6*i;
    titles_from_page = titles.slice(start, start + 6);

    console.log(i + " | " + titles_from_page.length);

    //CreateItem(titles_from_page, div3);
    for (j = 0; j < titles_from_page.length; j++) {
      CreateItem(titles_from_page[j].title, div3);
    }
  }
}

function CreateItem(title, parentDiv) {
  //Creates all the titles labels
  //Loops through each title in a given category and creates an image.
    var _name = title.Name;
    var _duration = title.Duration;
    temp = temp + 1;
    var _id = temp;

    var div0 = document.createElement("div");
    div0.className = "col-md-2";
    div0.style = "padding-left: 0px;";

    var div1 = document.createElement("div");
    div1.className = "vid row text-center";

    var div2 = document.createElement("div");
    div2.id = _id;
    div2.className = "Int col-md-11 offset-1";
    div2.style = "word-wrap: break-word;";

    var div_empty = document.createElement("div");
    div_empty.className = "Empt";

    var div_inf = document.createElement("div");
    div_inf.className = "Inf";

    var list = document.createElement("ul");

    var li_name = document.createElement("li");
    li_name.innerHTML = "Name: " + _name;
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