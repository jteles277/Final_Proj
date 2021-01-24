

var categoryUri = 'http://192.168.160.58/netflix/api/Categories/';
var allMovies = 'http://192.168.160.58/netflix/api/Movies';
var allSeries = 'http://192.168.160.58/netflix/api/Series';

var categories = [];

var numOfMovies = 0;
var numOfSeries = 0;

$(document).ready(async function () {
    categories = await GetCategories();
    numOfMovies = await GetMovies();
    numOfSeries = await GetSeries();

    // Load the Visualization API and the corechart package.
    google.charts.load('current', { 'packages': ['corechart'] });

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);

    google.charts.setOnLoadCallback(drawChart2);

    loading.style.display = "none";
    table_content.style.display = "table";

    
});

/*    GET CATEGORIES    */
async function GetCategories() {

    console.log('Getting categories...');

    _ajax = await ajaxHelper(categoryUri, 'GET');

    return _ajax.Categories;
}

/*    GET MOVIES    */
async function GetMovies() {

    console.log('Getting categories...');

    var composedUri = allMovies + "?page=1" + "&pagesize=100000";

    _ajax = await ajaxHelper(composedUri, 'GET');

    return _ajax.TotalTitles;
}

/*    GET SERIES    */
async function GetSeries() {

    console.log('Getting categories...');

    var composedUri = allSeries + "?page=1" + "&pagesize=100000";

    _ajax = await ajaxHelper(composedUri, 'GET');

    return _ajax.TotalTitles;
}

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart() {

    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Titles');

    console.log(categories);
    for(i = 0;i < categories.length; i++){
        data.addRow([categories[i].Name,categories[i].Titles]);
    }

    // Set chart options
    var options = {
        'title': 'Titles by category',
        'width': 1100,
        'height': 1500,
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


    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Titles');

    data.addRow(['Movies',numOfMovies]);
    data.addRow(['Series',numOfSeries]);

    var options = {
        'width': 1100,
        'height': 300,
        title: 'Movies vs Series',
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