

var categoryUri = 'http://192.168.160.58/netflix/api/Categories/';

var categories = [];

$(document).ready(async function () {

    categories = await GetCategories();

    // Load the Visualization API and the corechart package.
    google.charts.load('current', { 'packages': ['corechart'] });

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);

    google.charts.setOnLoadCallback(drawChart2);


    
});

/*    GET CATEGORIES    */
async function GetCategories() {

    console.log('Getting categories...');

    _ajax = await ajaxHelper(categoryUri, 'GET');

    return _ajax.Categories;
}

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart() {

    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');

    console.log(categories);
    for(i = 0;i < categories.length; i++){
        data.addRow([categories[i].Name,categories[i].Titles]);
    }

    // Set chart options
    var options = {
        'title': 'Titles by category',
        'width': 1100,
        'height': 300,
        'is3D':true,
        colors: ['red', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6'],

        legendTextStyle: { color: '#141414' },
        titleTextStyle: { color: 'white' },
        vAxis: {
            textStyle: { color: 'white' },
          },
        hAxis: {
            textStyle: { color: 'white' },
          },
        backgroundColor: '#141414',
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}
function drawChart2() {

    var data = google.visualization.arrayToDataTable([
      ['Task', 'Hours per Day'],
      ['Work',     11],
      ['Work',     11],
    ]);

    var options = {
        title: 'Movies vs Show',
        colors: ['red', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6'],
        legendTextStyle: { color: '#141414' },
        titleTextStyle: { color: 'white' },
        vAxis: {
            textStyle: { color: 'white' },
          },
        hAxis: {
            textStyle: { color: 'white' },
          },
        backgroundColor: '#141414',
        'is3D':true,

    };

    var chart = new google.visualization.PieChart(document.getElementById('piechart'));

    chart.draw(data, options);
  }

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