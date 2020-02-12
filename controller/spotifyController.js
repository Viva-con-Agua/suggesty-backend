const {connectSpotify} = require("../config/connectSpotify");
var unirest = require("unirest");
const Axios = require("axios");

var placeholderImage = 'https://upload.wikimedia.org/wikipedia/en/e/ee/Unknown-person.gif';

// @desc get poolevent by id
// @route GET /api/v1/:id
// @access Public
exports.getArtistByName = (req, res) => {

  var artistName = req.params.artistName;

  connectSpotify();

  var req2 = unirest("GET", "https://api.spotify.com/v1/search");

  req2.query({
    "q": artistName,
    "type": "artist"
  });

  req2.headers({
    "Authorization": "Bearer " + global.tokenSpotify
  });


  req2.end(function (ress) {
    if (ress.error) {
      res.status(400).json({
        success: false,
        message: `Error getArtistByName: ${ress.error}`
      });
      throw new Error(ress.error)
    }
    ;

    var resultArtist = [];

    for (var x = 0; x < ress.body.artists.items.length; x++) {
      var artist = ress.body.artists.items[x];


      var newArtist = {
        "artistName": artist.name,
        "artistId": artist.id
      };

      if (typeof artist.images[0] !== 'undefined' && artist.images[0] !== null) {
        newArtist.artistImage = artist.images[0].url;
      } else {
        newArtist.artistImage = placeholderImage;
      }
      resultArtist.push(newArtist);
    }

    res.status(200).json({
      success: true,
      data: resultArtist
    });
  });

};

// @desc get poolevent by id
// @route GET /api/v1/:id
// @access Public
exports.getArtistById = (req, res) => {

  //var artistId = "6wWVKhxIU2cEi0K81v7HvP";

  var artistId = req.params.artistId;
  var req2 = unirest("GET", "https://api.spotify.com/v1/artists/" + artistId);

  req2.headers({
    "Authorization": "Bearer " + global.tokenSpotify
  });

  req2.end(function (ress) {

    if (ress.error) {
      res.status(400).json({
        success: false,
        message: `Error getArtistByName: ${ress.error}`
      });
      throw new Error(ress.error)
    }
    ;

    var artist = ress.body;
    var newArtist = {
      "artistName": artist.name,
      "artistId": artist.id
    };

    if (typeof artist.images[0] !== 'undefined' && artist.images[0] !== null) {
      newArtist.artistImage = artist.images[0].url;
    } else {
      newArtist.artistImage = placeholderImage;
    }

    res.status(200).json({
      success: true,
      data: newArtist
    });


  });

};


// @desc get poolevent by id
// @route GET /api/v1/:id
// @access Public
exports.getSimilarArtistById = (req, res) => {


  var artistId = req.params.artistId;
  var req2 = unirest("GET", "https://api.spotify.com/v1/artists/" + artistId + "/related-artists");


  req2.headers({
    "Authorization": "Bearer " + global.tokenSpotify
  });

  req2.end(function (ress) {

    if (ress.error) {
      res.status(400).json({
        success: false,
        message: `Error getArtistByName: ${ress.error}`
      });
      throw new Error(ress.error)
    }
    ;


    var resultArtist = [];

    for (var x = 0; x < ress.body.artists.length; x++) {
      var artist = ress.body.artists[x];


      var newArtist = {
        "artistName": artist.name,
        "artistId": artist.id
      };

      if (typeof artist.images[0] !== 'undefined' && artist.images[0] !== null) {
        newArtist.artistImage = artist.images[0].url;
      } else {
        newArtist.artistImage = placeholderImage;
      }
      resultArtist.push(newArtist);
    }

    res.status(200).json({
      success: true,
      data: resultArtist
    });
  });

};

// @desc get poolevent by id
// @route GET /api/v1/:id
// @access Public
exports.getArtistByVcaId = (req, res) => {

  connectSpotify();

  var vcaId = req.params.vcaId;
  var vcaIdType = req.params.vcaIdType;

  global.conn.query(
    `SELECT * FROM vcaartist p WHERE vcaId='${vcaId}' AND vcaType='${vcaIdType}';`,
    (error, resp) => {
      if (error) {
        res.status(400).json({
          success: false,
          message: `Error in putPoolEvent: ${error.message}`
        });
      } else {

        var artistList = "";

        if (resp.length == 0) {
          res.status(200).json({
            success: true,
            data: []
          });
        } else {

          for (var x = 0; x < resp.length && x <= 50; x++) {
            artistList = resp[x].artistId + "," + artistList;
          }
          artistList = artistList.substring(0, artistList.length - 1);


          //var artistId = req.params.artistId;
          var req2 = unirest("GET", "https://api.spotify.com/v1/artists?ids=" + artistList);
          req2.headers({"Authorization": "Bearer " + global.tokenSpotify});
          req2.end(function (ress) {

            if (ress.error) {
              res.status(400).json({
                success: false,
                message: `Error getArtistByName: ${ress.error}`
              });
              throw new Error(ress.error)
            }
            ;


            var artists = [];
            for (var x = 0; x < ress.body.artists.length; x++) {

              if (typeof ress.body.artists[x] !== 'undefined' && ress.body.artists[x]) {
                var artist = ress.body.artists[x];

                var newArtist = {
                  "artistName": artist.name,
                  "artistId": artist.id
                };

                if (typeof artist.images[0] !== 'undefined' && artist.images[0] !== null) {
                  newArtist.artistImage = artist.images[0].url;
                } else {
                  newArtist.artistImage = placeholderImage;
                }

                artists.push(newArtist);
              }
            }

            res.status(200).json({
              success: true,
              data: artists
            });
          });
        }
      }
    }
  );
};


// @desc get poolevent by id
// @route GET /api/v1/poolevent/:id
// @access Public
exports.getFavoritePooleventsByUserId = async (req, res) => {
  try {
    var userId = req.params.id;
    const joinResult = await fetchJoin(userId);
    var artistList = [];

    for(var j = 0; j < joinResult.length; j++){
      var actionId = joinResult[j].vcaId;
      var artistId = joinResult[j].artistId;
      const artistResult = await fetchArtist(artistId);
      var artistName = artistResult.artists[0].name;
      var artist = {"artistName": artistName,
                    "artistId": artistId,
                    "actionId": actionId};

      artistList.push(artist);
    }
    res.status(200).json({
      success: true,
      data: artistList
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error
    });
  }
};





function fetchArtist(artistId) {
  return new Promise(resolve => {
    var req2 = unirest("GET", "https://api.spotify.com/v1/artists?ids=" + artistId);
    req2.headers({"Authorization": "Bearer " + global.tokenSpotify});
    req2.end(function (ress) {
      resolve(ress.body);
      if (ress.error) {
        res.status(400).json({
          success: false,
          message: `Error getArtistByName: ${ress.error}`
        });
        throw new Error(ress.error)
      }
    });
  });
}

function fetchJoin(userId) {
  return new Promise(resolve => {
    global.conn.query(
      `SELECT action.vcaId, action.artistId
    FROM vcaartist AS user
    JOIN vcaartist AS action
    ON action.artistId = user.artistId
    where user.vcaId="`+userId+`" and user.vcaType="USER" and action.vcaType="ACTION";`,
      (error, resp) => {
        resolve(resp);
      });
  })
}





