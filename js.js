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

  //--- GET TILES
  
  console.log('Getting categories...');
  var composedUri = self.categoriesUri() + "?page=" + 1 + "&pageSize=" + 10;
  ajaxHelper(composedUri, 'GET').done(function (data) {
    //console.log(data);
    data.Categories.forEach(element => create_label(element));
  });

  //--- Internal functions
  function GetTitlesByCategory(id,name) {
    //console.log('Getting titles of the category '+name+'...');
    var composedUri = self.categoriesUri() + "/" + id;
    ajaxHelper(composedUri, 'GET').done(function (data) {
      //console.log(data);
      return data;
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
      for (i = 0; i <  Math.min(data.Titles.length,10); i++) {
        var newItem = document.createElement("li");
        newItem.innerHTML = data.Titles[i].Name; 
        list_child.appendChild(newItem);
      } 
    });

    label.appendChild(list_child);
    list_parent.appendChild(label);
    parentDiv.appendChild(list_parent);/*
    console.log(category)
    console.log(titles)
    console.log("----")*/
  }

}