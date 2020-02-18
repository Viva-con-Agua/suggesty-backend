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
exports.getSimilarArtistById = async (req, res) => {


  var artistId = req.params.artistId;


  const resultFetchSimilarArtists = await fetchSimilarArtists(artistId);

  if (resultFetchSimilarArtists.success == false) {
    res.status(400).json({
      success: false,
      data: resultFetchSimilarArtists.data
    });
  } else {

    var resultArtist = [];

    for (var x = 0; x < resultFetchSimilarArtists.data.artists.length; x++) {
      var artist = resultFetchSimilarArtists.data.artists[x];

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
  }


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
    //console.log(joinResult);
   // console.log(joinResult.length);
    var artistList = [];

    for (var j = 0; j < joinResult.length; j++) {
      var actionId = joinResult[j].vcaId;
      var artistId = joinResult[j].artistId;
      var recursionDepth = joinResult[j].recursionDepth;
      var heuristicArtistId = joinResult[j].heuristicArtistId;

      const artistPoolEventResult = await fetchArtist(artistId);
      var artistPoolEventName = artistPoolEventResult.data.artists[0].name;

      const artistHeuristicResult = await fetchArtist(heuristicArtistId);
      var artistHeuristicName = artistHeuristicResult.data.artists[0].name;

      var artist = {
        "artistName": artistPoolEventName,
        "artistId": artistId,
        "actionId": actionId,
        "recursionDepth": recursionDepth,
        "artistHeuristicName": artistHeuristicName
      };

      artistList.push(artist);
    }
    res.status(200).json({
      success: true,
      data: artistList
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      error: error
    });
  }
};


// @desc  create favorite
// @route POST /api/v1/favorite
// @access Private
exports.postArtist = async (req, res) => {


  var vcaId = req.body.vcaId;
  var artistId = req.body.artistId;
  var vcaType = req.body.vcaType;




  var insertArray = [];
  insertArray.push(vcaId);
  insertArray.push(artistId);
  insertArray.push(vcaType);

  const resultAddArtist = await addArtist(insertArray);

  if (resultAddArtist.success == false) {
    res.status(400).json({
      success: false,
      data: resultAddArtist.data
    });
  } else {

    const resultFetchSimilarArtists = await fetchSimilarArtists(artistId);

    var resultArtist = [];

    for (var x = 0; x < resultFetchSimilarArtists.data.artists.length; x++) {
      var artist = resultFetchSimilarArtists.data.artists[x];

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


    var insertHeuristicArray = [];

    var newHeuristic = [];
    var recursionDepth = 0;
    newHeuristic.push([vcaId,artistId,vcaType,artistId, recursionDepth]);
    //insertHeuristicArray.push(newHeuristic);

    for (var x = 0; x < resultFetchSimilarArtists.data.artists.length; x++) {
      var artist = resultFetchSimilarArtists.data.artists[x];
      var recursionDepth = 1;
      newHeuristic.push([vcaId,artist.id,vcaType,artistId,recursionDepth]);

      const resultFetchSimilarArtists2 = await fetchSimilarArtists(artist.id);
      //console.log(resultFetchSimilarArtists2);

      for (var y = 0; y < resultFetchSimilarArtists2.data.artists.length; y++) {
        var artist2 = resultFetchSimilarArtists2.data.artists[y];
        var recursionDepth2 = 2;
        newHeuristic.push([vcaId, artist2.id, vcaType, artistId, recursionDepth2]);
      }

    }

    const resultAddHeuristicArtist = await addHeuristicArtist(newHeuristic);
    //console.log(resultAddHeuristicArtist.data);

  }


};

// @desc delete favorite by id
// @route DELETE /api/v1/favorite/:id
// @access Private
exports.deleteArtist = async (req, res) => {
  var vcaId = req.body.vcaId;
  var artistId = req.body.artistId;
  var vcaType = req.body.vcaType;

  const resultRemoveArtist = await removeArtist(vcaId, artistId, vcaType);

  if (resultRemoveArtist.success == false) {
    res.status(400).json({
      success: false,
      data: resultRemoveArtist.data
    });
  } else {
    const resultRemoveHeuristicArtists = await removeHeuristicArtist(vcaId, artistId, vcaType);
    if (resultRemoveHeuristicArtists.success == false) {
      res.status(400).json({
        success: false,
        data: resultRemoveHeuristicArtists.data
      });
    } else {
      res.status(200).json({
        success: true,
        data: resultRemoveHeuristicArtists.data
      });
    }

  }



};


function fetchArtist(artistId) {
  return new Promise(resolve => {
    var req2 = unirest("GET", "https://api.spotify.com/v1/artists?ids=" + artistId);
    req2.headers({"Authorization": "Bearer " + global.tokenSpotify});
    req2.end(function (ress) {
      if (ress.error) {
        resolve({success: false, data: ress.error});
        throw new Error(ress.error);
      } else {
        //console.log(ress.body);
        resolve({success: true, data: ress.body});
      }
    });
  });
}

function fetchJoin(userId) {
  return new Promise(resolve => {
    global.conn.query(
      `SELECT action.vcaId, action.artistId, user.heuristicArtistId, min(user.recursionDepth) AS recursionDepth
    FROM vcaartistheuristic AS user
    JOIN vcaartistheuristic AS action
    ON action.artistId = user.artistId
    where user.vcaId="` + userId + `" and user.vcaType="USER" and action.vcaType="ACTION" and action.recursionDepth="0" 
    GROUP BY action.vcaId;`,
      (error, resp) => {
        resolve(resp);
      });
  })
}


//exports.fetchSimilarArtists = async (rartistId) => {
function fetchSimilarArtists(artistId) {
  return new Promise(resolve => {
    var req2 = unirest("GET", "https://api.spotify.com/v1/artists/" + artistId + "/related-artists");
    req2.headers({"Authorization": "Bearer " + global.tokenSpotify});
    req2.end(function (ress) {
      if (ress.error) {
        resolve({success: false, data: ress.error});
        throw new Error(ress.error);
      } else {
        resolve({success: true, data: ress.body});
      }
    });
  });
}

function addArtist(insertArray) {
  return new Promise(resolve => {
    const sql = `INSERT INTO vcaartist (vcaId, artistId, vcaType) VALUES (?,?,?)`;
    global.conn.query(sql, insertArray, (error, favorite) => {
      //global.conn.query(sql, body, (error, favorite) => {
      if (error) {
        console.log(error.message);
        resolve({success: false, data: error.message});
        throw new Error(error.message);
      } else {
        resolve({success: true, data: favorite});
      }
    });
  })
}

function addHeuristicArtist(insertArray) {
  console.log(insertArray.length);
  return new Promise(resolve => {
    const sql = `INSERT INTO vcaartistheuristic (vcaId, artistId, vcaType, heuristicArtistId, recursionDepth) VALUES ?`;
    global.conn.query(sql, [insertArray], (error, favorite) => {
      if (error) {
        console.log(error.message);
        resolve({success: false, data: error.message});
        throw new Error(error.message);
      } else {
        resolve({success: true, data: favorite});
      }
    });
  })
}

function removeArtist(vcaId, artistId, vcaType) {
  return new Promise(resolve => {
    const sql = `DELETE FROM vcaartist WHERE vcaId='${vcaId}' AND artistId='${artistId}' and vcaType='${vcaType}';`;
    global.conn.query(sql, [vcaId, artistId, vcaType], (error, favorite) => {
      if (error) {
        console.log(error.message);
        resolve({success: false, data: error.message});
        throw new Error(error.message);
      } else {
        resolve({success: true, data: favorite});
      }
    });
  })
}

function removeHeuristicArtist(vcaId, artistId, vcaType) {
  return new Promise(resolve => {
    const sql = `DELETE FROM vcaartistheuristic WHERE vcaId='${vcaId}' AND heuristicArtistId='${artistId}' and vcaType='${vcaType}';`;
    global.conn.query(sql, [vcaId, artistId, vcaType], (error, favorite) => {
      if (error) {
        console.log(error.message);
        resolve({success: false, data: error.message});
        throw new Error(error.message);
      } else {
        resolve({success: true, data: favorite});
      }
    });
  })
}






