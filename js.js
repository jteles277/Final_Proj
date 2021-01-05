$(document).ready(function () {
  console.log("Hello world!");
  ko.applyBindings(new vm());
});

var vm = function () {
  console.log('ViewModel initiated...');

  //---Local variables
  var self = this;
  self.titleUri = ko.observable('http://192.168.160.58/netflix/api/titles');
  self.categoriesUri = ko.observable('http://192.168.160.58/netflix/api/categories');
  self.categoriesUri = ko.observable('http://192.168.160.58/netflix/api/categories');
  self.secure_base_url = ko.observable('');

  //--- GET CATEGORIES
  console.log('Getting categories...');
  var composedUri = self.categoriesUri() + "?page=" + 1 + "&pageSize=" + 10;
  ajaxHelper(composedUri, 'GET').done(function (data) {
    //console.log(data);
    data.Categories.forEach(element => create_label(element));
  });

  //--- GET TITLES
  function GetTitlesByCategory(id, name) {
    //console.log('Getting titles of the category '+name+'...');
    var composedUri = self.categoriesUri() + "/" + id;
    ajaxHelper(composedUri, 'GET').done(function (data) {
      //console.log(data);
      return data;
    });
  }

  //GET SECURE BASE URL
  ajaxHelper('https://api.themoviedb.org/3/configuration?api_key=0bc1da750e2a1eee63910ae9652e526f', 'GET').done(function (result) {
    self.secure_base_url = result.secure_base_url;
  });

  //--- GET ID
  function GetTitleID(title) {
    //console.log('Getting titles of the category '+name+'...');
    var composedUri = 'https://api.themoviedb.org/3/search/movie?api_key=0bc1da750e2a1eee63910ae9652e526f&query='+title+'&page=1';
    ajaxHelper(composedUri, 'GET').done(function (data) {
      if(data != undefined && data.result != undefined && data.result[0].id != undefined)
      return data.results[0].id
      else
      return null;  
    });
  }

  //--- GET IMAGE
  function GetImageByID(id) {
    //console.log('Getting titles of the category '+name+'...');
    ajaxHelper('https://api.themoviedb.org/3/movie/'+id+'/images?api_key=0bc1da750e2a1eee63910ae9652e526f', 'GET').done(function (img) {
      console.log("IMG "+img)
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

  function create_label(category) {
    var list_parent = document.createElement("ul");
    var label = document.createElement("Label");
    label.innerHTML = category.Name;
    var list_child = document.createElement("ul");

    var composedUri = self.categoriesUri() + "/" + category.Id;
    ajaxHelper(composedUri, 'GET').done(function (data) {
      for (i = 0; i < Math.min(data.Titles.length, 10); i++) {
        var newItem = document.createElement("li");
        newItem.innerHTML = data.Titles[i].Id + " | " + data.Titles[i].Name;
        list_child.appendChild(newItem);

        var id = GetTitleID(data.Titles[i].Name)
        /*if (id != null){
          console.log(id)
          GetImageByID(id)
        }*/
      }
    });
    label.appendChild(list_child);
    list_parent.appendChild(label);
    parentDiv.appendChild(list_parent);
  }

}