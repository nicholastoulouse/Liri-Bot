// in windows type git bash
// On mac only, rename .env to env.sh
// on command line or in git bash
// source env.sh
// every time I rerun my app or leave my terminal, run source env.sh to expose environmental variables to node
// windows needs gitbash

var axios = require("axios");
var moment = require('moment'); // https://momentjs.com/docs/
var Spotify = require("node-spotify-api");

(function commandline(){

  var nodeArgs = process.argv;
  var mediaName = nodeArgs.slice(3).join("+"); // For multi-word input of songs, movies, or concerts
  var command = process.argv[2]; // valid: concert-this, movie-this, spotify-this-song, do-what-it-says

  switch (command) { // via command, route API calls
    case 'concert-this':
      concert(mediaName);
      break;
    case 'movie-this':
      movie(mediaName);
      break;
    case 'spotify-this-song':
      music(mediaName);
      break;
    case 'do-what-it-says':
    automated();
      break;
    default:
      console.log('Sorry, ' + command + ' is not input a valid command with media' + mediaName + '.');
  }
})();

function concert(mediaName) { // Bands in town API docs: https://app.swaggerhub.com/apis/Bandsintown/PublicAPI/3.0.0#/artist%20information/artist
  // 1. Sample REST call: https://rest.bandsintown.com/artists/U2?app_id=0242e0a48d5ec6e18d97ed83ff461572
  // 2. Sample REST call: "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp"
  var app_id = "?app_id=" + "0242e0a48d5ec6e18d97ed83ff461572";
  var bandsintownUrl = "https://rest.bandsintown.com/artists/" + mediaName + "/events" + app_id;
  console.log("bit url ", bandsintownUrl);
  axios.get(bandsintownUrl).then(function(response) {
    var stdoutInfo = "";
    console.log("***** " + mediaName.replace("+", " ").toUpperCase() + " *****" + " tour schedule: ");
    for (let prop in response) {
      if(prop === "data"){
        var resp = response[prop];
        resp.forEach(event => {
          // console.log("****************", event);
          stdoutInfo = "";
          let nameOfVenue, venuLocation, timeOfEvent, dateOfEvent; // "MM/DD/YYYY"
          nameOfVenue = event.venue.name;
          venuLocation = event.venue.city + ", " + ((event.venue.region)? event.venue.region : event.venue.country);
          dateOfEvent = moment.parseZone(event.datetime).utc().format('L'); // moment().format('L'); // moment().format('LTS');
          timeOfEvent = moment.parseZone(event.datetime).utc().format('LTS');
          nameOfVenue = event.venue.name;
          stdoutInfo = venuLocation + " at the " + nameOfVenue + " on " + dateOfEvent + " performing at " + timeOfEvent + "."; 
          console.log(stdoutInfo);
        });
      }
    }
    dateOfEvent = moment().utc().format('L');
    timeOfEvent = moment().utc().format('LTS');    
    log("Music searched for artist " + mediaName + " on " + dateOfEvent + " at " + timeOfEvent + ".");
  }).catch(function(e) {
    console.log(e);
  });
}

function movie(mediaName) { // Search OMDB API for movies
  var omdbUrl = "http://www.omdbapi.com/?t=" + mediaName + "&y=&plot=short&apikey=trilogy";
  axios.get(omdbUrl).then(function(response) {

        dateOfEvent = moment().utc().format('L');
        timeOfEvent = moment().utc().format('LTS');

        if ( Boolean(response.data.Response) === false || response.data.Response === undefined){
          log("movie-this " + mediaName + " --MOVIE SEARCH UNSPECIFIED-- " + " on " +  dateOfEvent + " at " + timeOfEvent + ".");
        } else {
          var title = response.data.Title;
          var yr = response.data.Year;
          var imdbRating = response.data.imdbRating;
          var rtRating = response.data.Ratings[1].Source + " rating " + response.data.Ratings[1].Value;
          var countryProduced = response.data.Country;
          var language = response.data.Language;
          var actors = response.data.Actors;
          var plot = response.data.Plot;
          console.log("The movie " + title + " produced in " + countryProduced + " filmed in " + language + " in the year " + yr + " starring " + actors + " has an imdb rating of " + imdbRating + " and a rotten tomatoes rating of " + rtRating + "." + "A brief synopsis of the plot is as follows: " + plot);
          log("movie-this " + mediaName + " searched on " + dateOfEvent + " at " + timeOfEvent + "."); 
        }
  }).catch(function(e) {
  console.log(e);
  });
}

function music(mediaName) {
  console.log("media name ", mediaName);
  // Search spotify API for song name
  // Artist(s), The song's name, A preview link of the song from Spotify, The album that the song is from
  // If no song is provided then your program will default to "The Sign" by Ace of Base.
  // var SPOTIFY_ID = "e5ba24428ae8452899ce78586f3716f7"; // vs. process.env.SPOTIFY_ID
  //console.log(process.env.SPOTIFY_ID);
  // var SPOTIFY_SECRET = "71e18962b2e14756b19b5e00aa0b110f"; // vs. process.env.SPOTIFY_SECRET
  //console.log(process.env.SPOTIFY_SECRET);
  var sampleTrackId = "11dFghVXANMlKmJXsNCbNl"; // The sign by Ace of Base
  var spotify = new Spotify({
    id: process.env.SPOTIFY_ID,
    secret: process.env.SPOTIFY_SECRET
  });
  if(!mediaName){
    var defaultSong = "The sign";
    var defaultArtist = "Ace of Base";
  } else {
    var defaultSong = mediaName.replace("+", " ");
  }
  // track object (full): album, uri, artists, name (of track)
  var album, sfyPlayTuneUrl;
  var singers = "";
  spotify.search({ type: 'track', query: defaultSong }, function(err, response) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }
    var data = response.tracks.items;
    // console.log("***** DATA: *****", response.tracks);
    //console.log("****************", data.album[0].artists[0]);
    data.forEach(record => { // log the one most viable to the user search 
      if ( typeof mediaName !== undefined && record.artists[0].name === defaultArtist ){ // "Ace of Base"
        singers = record.artists[0]["name"];
        album = record.name.toString();
        sfyPlayTuneUrl = record.uri.toString();
        console.log(singers, " performed ", defaultSong, " on the album ", album, " listen here: ", sfyPlayTuneUrl);
        return;
      } else {
        record.artists.forEach(musician => {
          singers.concat(musician.name + ", ");
        });
        album = record.name.toString();
        sfyPlayTuneUrl = record.uri.toString();
      }
      console.log(singers, " performed ", defaultSong, " on the album ", album, " listen to the song: ", sfyPlayTuneUrl);
    });
  });
  log("song " + mediaName + " searched on ");
}

function automated() {

  var dataArr = new Array;
  var fs = require("fs");
  fs.readFile("random.txt", "utf8", function(error, data) {
    if (error) {
      return console.log(error);
    }
    console.log(data);
    dataArr = data.split(","); // split data with commas to be more readable
  });
  mediaName = dataArr[1];
  music();
  log("do-what-it-says: " + mediaName + ". ");
}

function log(action) {

  var fs = require("fs");
  var instant = moment().format();

  console.log(instant);
  // Next, we store the text given to us from the command line.
  var text = action + " " + instant + ".";

  // Next, we append the text into the "sample.txt" file.
  // If the file didn't exist, then it gets created on the fly.
  fs.appendFile("log.txt", text, function(err) {
    // If an error was experienced we will log it.
    if (err) {
      console.log(err);
    } else {
      console.log("Content Added!");
    }
  });
}