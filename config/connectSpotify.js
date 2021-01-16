const mysql = require("mysql");
var unirest = require("unirest");

const connectSpotify = () => {

  var req = unirest("POST", "https://accounts.spotify.com/api/token");

  req.headers({
    "cache-control": "no-cache",
    "Authorization": "Basic " + process.env.SPOTIFY_AUTH
  });


  req.send("grant_type=client_credentials");




  req.end(function (res) {
    if (res.error) throw new Error(res.error);

    var access_token_spotify = res.body.access_token;
    console.log("spotify connected with token " + access_token_spotify);

    global.tokenSpotify = access_token_spotify;

    return access_token_spotify;

  });
}


module.exports = { connectSpotify };

