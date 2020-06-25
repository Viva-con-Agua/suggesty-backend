const {connectSpotify} = require("../config/connectSpotify");
var unirest = require("unirest");
const Axios = require("axios");


var placeholderImage = 'https://upload.wikimedia.org/wikipedia/en/e/ee/Unknown-person.gif';


// @desc get poolevent by id
// @route GET /api/v1/:id
// @access Public
exports.getArtistByName = async (req, res) => {

  var artistName = req.params.artistName;


  var uri = "https://api.spotify.com/v1/search";
  var method = "GET";
  var qry = {
    "q": artistName,
    "type": "artist"
  };

  const ress = await runSpotifyRequestNewLoop(method, uri, qry);

  if (ress.success) {

    var resultArtist = [];

    for (var x = 0; x < ress.data.artists.items.length; x++) {
      var artist = ress.data.artists.items[x];


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
  } else {
    res.status(400).json({
      success: false,
      data: ress.data
    });
  }
};

// @desc get poolevent by id
// @route GET /api/v1/:id
// @access Public
exports.getArtistById = async (req, res) => {

  //var artistId = "6wWVKhxIU2cEi0K81v7HvP";
  var artistId = req.params.artistId;

  var uri = "https://api.spotify.com/v1/artists/" + artistId;
  var method = "GET";
  var qry = {};

  const ress = await runSpotifyRequestNewLoop(method, uri, qry);

  if (!ress.success) {
    res.status(400).json({
      success: false,
      message: `Error getArtistByName: ${ress.data}`
    });
    throw new Error(ress.data)
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


  //});

};


// @desc get poolevent by id
// @route GET /api/v1/:id
// @access Public
exports.getSimilarArtistById = async (req, res) => {


  var artistId = req.params.artistId;

  var method = "GET";
  var qry = {};
  var uri = "https://api.spotify.com/v1/artists/" + artistId + "/related-artists";
  const resultFetchSimilarArtists = await runSpotifyRequestNewLoop(method, uri, qry);


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
exports.getArtistByVcaId = async (req, res) => {

  var vcaId = req.params.vcaId;
  var vcaIdType = req.params.vcaIdType;

  global.conn.query(
    `SELECT * FROM vcaartistheuristic p WHERE vcaId='${vcaId}' AND vcaType='${vcaIdType}' and recursionDepth=0;`,
    async (error, resp) => {
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

          var method = "GET";
          var uri = "https://api.spotify.com/v1/artists?ids=" + artistList;
          var qry = {};
          const ress = await runSpotifyRequestNewLoop(method, uri, qry);

          if (!ress.success) {
            res.status(400).json({
              success: false,
              message: `Error getArtistByName: ${ress.error}`
            });
            throw new Error(ress.error)
          } else {

            var artists = [];
            for (var x = 0; x < ress.data.artists.length; x++) {

              if (typeof ress.data.artists[x] !== 'undefined' && ress.data.artists[x]) {
                var artist = ress.data.artists[x];

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
          }
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

      var uri = "https://api.spotify.com/v1/artists?ids=" + artistId;
      var method = "GET";
      var qry = {};
      const artistPoolEventResult = await runSpotifyRequestNewLoop(method, uri, qry);
      var artistPoolEventName = artistPoolEventResult.data.artists[0].name;

      var uri2 = "https://api.spotify.com/v1/artists?ids=" + heuristicArtistId;
      var method2 = "GET";
      var qry2 = {};
      const artistHeuristicResult = await runSpotifyRequestNewLoop(method2, uri2, qry2);
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


  var newHeuristic2 = [];
  newHeuristic2.push([vcaId, artistId, vcaType, artistId, 0]);
  const resAddArtistRec0 = await addHeuristicArtist(newHeuristic2);

  res.status(200).json({
    success: true,
    data: []
  });



  // RECURSION DEPTH 0
  var method = "GET";
  var qry = {};
  var uri = "https://api.spotify.com/v1/artists/" + artistId + "/related-artists";
  const resSimilarArtistsRec0 = await runSpotifyRequestNewLoop(method, uri, qry);

  // RECURSION DEPTH 1
  var promises = [];
  for(var i = 0; i < resSimilarArtistsRec0.data.artists.length; i++){
    var art = resSimilarArtistsRec0.data.artists[i];
    var method = "GET";
    var qry = {};
    var uri = "https://api.spotify.com/v1/artists/" + art.id + "/related-artists";
    var promise = runSpotifyRequestNewLoop(method, uri, qry);
    promises.push(promise);
  }
  var resSimilarArtistsRec1 = await Promise.all(promises);
  console.log(resSimilarArtistsRec1.length);

  // RECURSION DEPTH 2
  var promises2 = [];
  for(var i = 0; i < resSimilarArtistsRec1.length; i++){
    for (var j = 0; j < resSimilarArtistsRec1[i].data.artists.length; j++){
      var art = resSimilarArtistsRec1[i].data.artists[j];
      var method = "GET";
      var qry = {};
      var uri = "https://api.spotify.com/v1/artists/" + art.id + "/related-artists";
      var promise = runSpotifyRequestNewLoop(method, uri, qry);
      promises2.push(promise);
    }
  }
  var resSimilarArtistsRec2 = await Promise.all(promises2);
  console.log(resSimilarArtistsRec2.length);


  var insertArray = [];


  // INSERT ARTISTS WITH REC1
  for(var i = 0; i < resSimilarArtistsRec0.data.artists.length; i++) {
    var art = resSimilarArtistsRec0.data.artists[i];
    insertArray.push([vcaId, art.id, vcaType, artistId, 1]);
  }

  // INSERT ARTISTS WITH REC2
  for(var i = 0; i < resSimilarArtistsRec1.length; i++) {
    for (var j = 0; j < resSimilarArtistsRec1[i].data.artists.length; j++) {
      var art2 = resSimilarArtistsRec1[i].data.artists[j];
      insertArray.push([vcaId, art2.id, vcaType, artistId, 2]);
    }
  }


  var artExists = await artistExists(vcaId, artistId, vcaType, artistId, 0)
  console.log(artExists);
  if(artExists){
    const resAddArtistRec12 = await addHeuristicArtist(insertArray);
  } else {
    console.log("Zwischendurch gelöscht");
  }

 // console.log(insertArray);


 //const resultAddHeuristicArtist = await addHeuristicArtist(insertArray);

  /*
  var promises2 = [];
  for(var i = 0; i < resArray.length; i++){
    var method = "GET";
    var qry = {};
    var uri = "https://api.spotify.com/v1/artists/" + artistId + "/related-artists";

    var promise = runSpotifyRequestNewLoop(method, uri, qry);
    promises2.push(promise);
  }
*/



  if (false) {
    var insertHeuristicArray = [];


    // Add artist (recursionDepth = 0);
    var newHeuristic = [];
    var recursionDepth = 0;
    newHeuristic.push([vcaId, artistId, vcaType, artistId, recursionDepth]);

    for (var x = 0; x < resSimilarArtistsRec0.data.artists.length; x++) {
      newHeuristic.push([vcaId, resSimilarArtistsRec0.data.artists[x].id, vcaType, artistId, 1]);
    }

    const resultAddHeuristicArtist = await addHeuristicArtist(newHeuristic);


    for (var x = 0; x < resSimilarArtistsRec0.data.artists.length; x++) {
      var artist = resSimilarArtistsRec0.data.artists[x];
      var recursionDepth = 1;

      var input = {};
      input.vcaId = vcaId;
      input.artistId = artist.id;
      input.vcaType = vcaType;
      input.heuristicArtistId = artistId; // AUSGANGSBASIS
      input.recursionDepth = 2;

      global.jobQueue.push(input, function (err, result) {

        //console.log(result.success);

        if (result.success) {

          for (var y = 0; y < result.data.length; y++) {

            var newInput = {};
            newInput.vcaId = result.data[y][0];
            newInput.artistId = result.data[y][1];
            newInput.vcaType = result.data[y][2];
            newInput.heuristicArtistId = result.data[y][3];
            newInput.recursionDepth = 3;


            /*
                        global.jobQueue.push(newInput, function (err2, result2) {
                          console.log(result2.success);
                        });
            */


          }
        }
      });


      /*

      MOVED TO QUEUE
      newHeuristic.push([vcaId, artist.id, vcaType, artistId, recursionDepth]);

      var method = "GET";
      var qry = {};
      var uri = "https://api.spotify.com/v1/artists/" + artist.id + "/related-artists";
      const resultFetchSimilarArtists2 = await runSpotifyRequestNewLoop(method,uri,qry);

      for (var y = 0; y < resultFetchSimilarArtists2.data.artists.length; y++) {
        var artist2 = resultFetchSimilarArtists2.data.artists[y];
        var recursionDepth2 = 2;
        newHeuristic.push([vcaId, artist2.id, vcaType, artistId, recursionDepth2]);
      }

      */

    }
  }
  /* MOVED TO QUEUE
  const resultAddHeuristicArtist = await addHeuristicArtist(newHeuristic);
  */


  //console.log(resultAddHeuristicArtist.data);


};

// @desc delete favorite by id
// @route DELETE /api/v1/favorite/:id
// @access Private
exports.deleteArtist = async (req, res) => {
  var vcaId = req.body.vcaId;
  var artistId = req.body.artistId;
  var vcaType = req.body.vcaType;

  const resultRemoveArtist = await removeHeuristicArtist(vcaId, artistId, vcaType);



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

/*
function fetchArtist123(artistId) {
  return new Promise(resolve => {

    var uri = "https://api.spotify.com/v1/artists?ids=" + artistId;
    var method = "GET";
    var qry = {};


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
*/

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

function addArtistTrash(insertArray) {
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

function artistExists(vcaId, artistId, vcaIdType, heuristicArtistId, recursionDepth) {
  return new Promise(resolve => {
    global.conn.query(
      `SELECT COUNT(*) AS counter FROM vcaartistheuristic p WHERE vcaId='${vcaId}' AND artistId='${artistId}' AND vcaType='${vcaIdType}' and heuristicArtistId='${heuristicArtistId}' and recursionDepth='${recursionDepth}';`,
      (error, resp) => {
        console.log(resp[0].counter);
        if(resp[0].counter>0){
          resolve(true);
        } else {
          resolve(false)
        }
      });
  })
}

function addHeuristicArtist(insertArray) {
  //console.log(insertArray.length);
  return new Promise(resolve => {
    const sql = `INSERT IGNORE INTO vcaartistheuristic (vcaId, artistId, vcaType, heuristicArtistId, recursionDepth) VALUES ?`;
    global.conn.query(sql, [insertArray], (error, favorite) => {
      if (error) {
        console.log(error.message);
        resolve({success: false, data: error.message});
        throw new Error(error.message);
      } else {
        resolve({success: true, data: insertArray});
        //resolve({success: true, data: favorite});
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


function runSpotifyRequestNewLoop(method, uri, qry) {
  return new Promise(async resolve => {
    var answer = {};

    for (var x = 0; x < 5; x++) {
      const res = await runSpotifyRequestNew(method, uri, qry);
      if (res.body.hasOwnProperty('error')) {
        var errorCode = res.body.error.status;
        var errorMessage = res.body.error.status + " " + res.body.error.message;

        console.log(errorMessage);
        answer.data = errorMessage;
        answer = {success: false, data: errorMessage};

        if (errorCode == "401") {
          connectSpotify();
        }
        if (errorCode == "429") {
          var retryAfterInSeconds = res['headers']['retry-after'];
          console.log("Try again in " + retryAfterInSeconds + " Seconds");
          await sleep(2 * retryAfterInSeconds * 1000);
        }
      } else {
        answer = {success: true, data: res.body};
        break;
      }
    }

    resolve(answer);
  })
}

function runSpotifyRequestNew(method, uri, qry) {
  return new Promise(resolve => {

    var req2 = unirest(method, uri);
    req2.query(qry);


    req2.headers({
      //"Authorization": "Bearer BQBPgGtzA8S5DsgDxrApAvNVZ2vn_jlPt1IEAT5vE3ez3nxPh-9v6FFDTwwyfz3su-Hi06xQ9JvX6UldMw4"
      "Authorization": "Bearer " + global.tokenSpotify
    });

    req2.end(function (ress) {
      if (ress.error) {
        //throw new Error(ress.error)
      }
      resolve(ress);
    })
  })


}


// ADD RELATED ARTISTS TO DB
exports.queueFunction = async (input, cb) => {

  var newHeuristic = [];

  var vcaId = input.vcaId;
  var vcaArtistId = input.artistId;
  var vcaType = input.vcaType;
  var heuristicArtistId = input.heuristicArtistId;
  var recursionDepth = input.recursionDepth;


  var method = "GET";
  var qry = {};
  var uri = "https://api.spotify.com/v1/artists/" + vcaArtistId + "/related-artists";
  const resultFetchSimilarArtists2 = await runSpotifyRequestNewLoop(method, uri, qry);


  for (var y = 0; y < resultFetchSimilarArtists2.data.artists.length; y++) {
    var artist2 = resultFetchSimilarArtists2.data.artists[y];
    newHeuristic.push([vcaId, artist2.id, vcaType, heuristicArtistId, recursionDepth]);
  }

  const resultAddHeuristicArtist = await addHeuristicArtist(newHeuristic);

  var result = resultAddHeuristicArtist;

  cb(null, result);

}


function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}


