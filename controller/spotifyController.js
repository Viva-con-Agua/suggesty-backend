const {connectSpotify} = require("../config/connectSpotify");
var unirest = require("unirest");
const Axios = require("axios");


var placeholderImage = 'https://www.mhkcpas.com/wp-content/uploads/2019/05/face-placeholder.gif';

var arrayVersuche = [];

for(var i = 0; i <= 40; i++){
  arrayVersuche.push(0);
}



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

  const ress = await runSpotifyRequestNewLoop(method, uri, qry, 10);

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

  const ress = await runSpotifyRequestNewLoop(method, uri, qry, 10);

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
  const resultFetchSimilarArtists = await runSpotifyRequestNewLoop(method, uri, qry, 10);


  if (resultFetchSimilarArtists.success == false) {
    res.status(400).json({
      success: false,
      data: resultFetchSimilarArtists.data
    });
  } else {

    try {

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

    } catch (e) {
      console.log(resultFetchSimilarArtists);
    }

  }

};

// @desc get poolevent by id
// @route GET /api/v1/:id
// @access Public
exports.getArtistByVcaId = async (req, res) => {

  var vcaId = req.params.vcaId;
  var vcaIdType = req.params.vcaIdType;

  console.log("Run");

  //  `SELECT * FROM vcaartistheuristic p WHERE vcaId='${vcaId}' AND vcaType='${vcaIdType}' and recursionDepth=0;`,


  global.conn.query(
    `SELECT * FROM recommendations p WHERE Vca_Id='${vcaId}' AND Vca_Type='${vcaIdType}';`,
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


          var numberOfCalls = Math.ceil(resp.length / 50);

          var artistListArray = [];


          for (var a = 0; a < numberOfCalls; a++) {
            artistList = "";
            for (var x = (a * 50); x < resp.length && x < ((a + 1) * 50); x++) {
              artistList = resp[x].Spotify_Id + "," + artistList;
            }
            artistList = artistList.substring(0, artistList.length - 1);
            artistListArray.push(artistList);

          }

          var ressArray = [];
          for (var x = 0; x < artistListArray.length; x++) {
            var method = "GET";
            var uri = "https://api.spotify.com/v1/artists?ids=" + artistListArray[x];
            var qry = {};
            const ress = await runSpotifyRequestNewLoop(method, uri, qry, 10);
            ressArray.push(ress);
          }


          for (var x = 0; x < ressArray.length; x++) {
            var ress = ressArray[x];
            if (!ress.success) {
              res.status(400).json({
                success: false,
                message: `Error getArtistByName: ${ress.error}`
              });
              throw new Error(ress.error)
            }
          }

          var artists = [];

          for (var a = 0; a < ressArray.length; a++) {
            var ress = ressArray[a];

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
          }
          res.status(200).json({
            success: true,
            data: artists
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
      var actionId = joinResult[j].recommendedAction;
      var artistId = joinResult[j].actionArtist;
      var recursionDepth = joinResult[j].recDepth;
      var heuristicArtistId = joinResult[j].userFav;

      var uri = "https://api.spotify.com/v1/artists?ids=" + artistId;
      var method = "GET";
      var qry = {};
      const artistPoolEventResult = await runSpotifyRequestNewLoop(method, uri, qry, 10);
      var artistPoolEventName = artistPoolEventResult.data.artists[0].name;

      var uri2 = "https://api.spotify.com/v1/artists?ids=" + heuristicArtistId;
      var method2 = "GET";
      var qry2 = {};
      const artistHeuristicResult = await runSpotifyRequestNewLoop(method2, uri2, qry2, 10);
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

// @desc get poolevent by id
// @route GET /api/v1/poolevent/:id
// @access Public
exports.getPopularPoolevents = async (req, res) => {
  try {
    const joinResult = await fetchPopularEvents();
    //console.log(joinResult);
    // console.log(joinResult.length);
    var artistList = [];

    for (var j = 0; j < joinResult.length; j++) {
      var artistId = joinResult[j].Spotify_Id;

      var uri = "https://api.spotify.com/v1/artists?ids=" + artistId;
      var method = "GET";
      var qry = {};
      const artistPoolEventResult = await runSpotifyRequestNewLoop(method, uri, qry, 10);
      var artistPopularName = artistPoolEventResult.data.artists[0].name;
      var artistPopularPicture = placeholderImage;

      //  console.log(artistPoolEventResult.data.artists[0].images.length );
      if (artistPoolEventResult.data.artists[0].images.length > 0) {
        artistPopularPicture = artistPoolEventResult.data.artists[0].images[0].url;
      }


      var artist = {
        "artistName": artistPopularName,
        "artistPicture": artistPopularPicture,
        "artistId": artistId
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


  //var newHeuristic2 = [];
  //newHeuristic2.push([vcaId, artistId, vcaType, artistId, 0]);
  //const resAddArtistRec0 = await addHeuristicArtist(newHeuristic2);

  var newHeuristic2Last = [];
  newHeuristic2Last.push([vcaId, vcaType, artistId]);
  const redAddRecommendation = await addHeuristicArtistLast(newHeuristic2Last);

  res.status(200).json({
    success: true,
    data: []
  });

  var artExists = await similarArtistExists(artistId);
  if (artExists) {
    console.log("Rechnerei nicht notwendig!");
  } else {
    //console.log("Shit! Rechnerei geht los");
    var newSimilarArtists = [];
    newSimilarArtists.push([artistId, artistId, 0]);


    const addSimilarArtistDept0 = await addSimilarArtistLast(newSimilarArtists);


    // RECURSION DEPTH 0
    var method = "GET";
    var qry = {};
    var uri = "https://api.spotify.com/v1/artists/" + artistId + "/related-artists";
    const resSimilarArtistsRec0 = await runSpotifyRequestNewLoop(method, uri, qry, 1);
    //console.log("resSimilarArtistsRec0 " + resSimilarArtistsRec0.data.artists.length);

    // RECURSION DEPTH 1
    var promises = [];
    for (var i = 0; i < resSimilarArtistsRec0.data.artists.length; i++) {
      var art = resSimilarArtistsRec0.data.artists[i];
      var method = "GET";
      var qry = {};
      var uri = "https://api.spotify.com/v1/artists/" + art.id + "/related-artists";
      var promise = runSpotifyRequestNewLoop(method, uri, qry, 1);
      promises.push(promise);
    }
    var resSimilarArtistsRec1 = await Promise.all(promises);


    // RECURSION DEPTH 2
    var promises2 = [];
    for (var i = 0; i < resSimilarArtistsRec1.length; i++) {
      for (var j = 0; j < resSimilarArtistsRec1[i].data.artists.length; j++) {
        var art = resSimilarArtistsRec1[i].data.artists[j];
        var method = "GET";
        var qry = {};
        var uri = "https://api.spotify.com/v1/artists/" + art.id + "/related-artists";
        var promise = runSpotifyRequestNewLoop(method, uri, qry, 1);
        promises2.push(promise);
      }
    }
    var resSimilarArtistsRec2 = await Promise.all(promises2);
    //console.log("resSimilarArtistsRec2 " + resSimilarArtistsRec2.data.artists.length);


    var insertArray = [];


    // INSERT ARTISTS WITH REC1
    for (var i = 0; i < resSimilarArtistsRec0.data.artists.length; i++) {
      var art = resSimilarArtistsRec0.data.artists[i];
      insertArray.push([artistId, art.id, 1]);
    }

    // INSERT ARTISTS WITH REC2
    for (var i = 0; i < resSimilarArtistsRec1.length; i++) {
      for (var j = 0; j < resSimilarArtistsRec1[i].data.artists.length; j++) {
        var art2 = resSimilarArtistsRec1[i].data.artists[j];
        insertArray.push([artistId, art2.id, 2]);
      }
    }

    const resAddArtistRec12 = await addSimilarArtistLast(insertArray);
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


};

// @desc delete favorite by id
// @route DELETE /api/v1/favorite/:id
// @access Private
exports.deleteArtist = async (req, res) => {

  for(var x = 0; x < arrayVersuche.length; x++){
    console.log("X " + x + " Versuche " + arrayVersuche[x]);
  }



  var vcaId = req.body.vcaId;
  var artistId = req.body.artistId;
  var vcaType = req.body.vcaType;

  const resultRemoveArtist = await removeHeuristicArtistLast(vcaId, vcaType, artistId);


  if (resultRemoveArtist.success == false) {
    res.status(400).json({
      success: false,
      data: resultRemoveArtist.data
    });
  } else {
    res.status(200).json({
      success: true,
      data: resultRemoveArtist.data
    });
  }

  /*
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
  */

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
      `SELECT actions.Vca_Id as recommendedAction,  joinUserSimilarArtists.similarDepth as recDepth,
      joinUserSimilarArtists.userFavorite as userFav, actions.Spotify_Id as actionArtist from recommendations as actions
     INNER JOIN 

    (SELECT similar_artists.Spotify_Id as userFavorite, similar_artists.Similar_Spotify_Id as similarUserFavorite, similar_artists.Depth as similarDepth
    FROM recommendations as user
    INNER JOIN similar_artists ON user.Spotify_Id = similar_artists.Spotify_Id
    where user.Vca_Id = "` + userId + `") as joinUserSimilarArtists

    ON joinUserSimilarArtists.similarUserFavorite = actions.Spotify_Id
    where actions.Vca_Type="ACTION"
    GROUP BY actions.Vca_Id;`,
      (error, resp) => {
        resolve(resp);
      });
  })
  /*

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
*/
}

function fetchPopularEvents() {
  return new Promise(resolve => {
    global.conn.query(
      `SELECT count(Spotify_Id) as counter, Spotify_Id FROM recommendations WHERE VcA_Type="ACTION" GROUP BY Spotify_Id;`,
      (error, resp) => {
        resolve(resp);
      });
  })
  /*

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
*/
}


function similarArtistExists(spotifyId) {
  return new Promise(resolve => {
    global.conn.query(
      `SELECT COUNT(*) AS counter FROM similar_artists p WHERE Spotify_Id='${spotifyId}' AND Similar_Spotify_Id='${spotifyId}' AND Depth=0;`,
      (error, resp) => {
        //console.log(resp[0].counter);
        if (resp[0].counter > 0) {
          resolve(true);
        } else {
          resolve(false)
        }
      });
  })
}

function artistExists(vcaId, artistId, vcaIdType, heuristicArtistId, recursionDepth) {
  return new Promise(resolve => {
    global.conn.query(
      `SELECT COUNT(*) AS counter FROM vcaartistheuristic p WHERE vcaId='${vcaId}' AND artistId='${artistId}' AND vcaType='${vcaIdType}' and heuristicArtistId='${heuristicArtistId}' and recursionDepth='${recursionDepth}';`,
      (error, resp) => {
        //console.log(resp[0].counter);
        if (resp[0].counter > 0) {
          resolve(true);
        } else {
          resolve(false)
        }
      });
  })
}

function addHeuristicArtist123(insertArray) {
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

function addHeuristicArtistLast(insertArray) {
  //console.log(insertArray.length);
  return new Promise(resolve => {
    const sql = `INSERT IGNORE INTO recommendations (Vca_Id, Vca_Type, Spotify_Id) VALUES ?`;
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

function addSimilarArtistLast(insertArray) {
  //console.log(insertArray.length);
  return new Promise(resolve => {

    // console.log(insertArray);

    if (insertArray.length > 0) {
      const sql = `INSERT IGNORE INTO similar_artists (Spotify_Id, Similar_Spotify_Id, Depth) VALUES ?`;
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
    } else {
      resolve({success: true, data: insertArray});
    }
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

function removeHeuristicArtistLast(vcaId, vcaType, artistId) {
  return new Promise(resolve => {
    const sql = `DELETE FROM recommendations WHERE Vca_Id='${vcaId}' AND Spotify_Id='${artistId}' and Vca_Type='${vcaType}';`;
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

function runSpotifyRequestNewLoop(method, uri, qry, prio) {
  return new Promise(async resolve => {
    var answer = "";
    var x = 0;
    while (true) {

      arrayVersuche[x] = arrayVersuche[x] + 1;

      if(x>=0) {
      //  console.log("Versuch " + x);
      }
      x = x + 1;
      const ress = await runSpotifyRequestNewLoopInside(method, uri, qry, prio);
      if (!ress.error) {
       // console.log("success " + uri);

        var answer = {success: true, data: ress.body};

        resolve(answer);
        //answer = ress.body;
        break;
      } else {
        //console.log("no success " + uri);




      }
    }
    resolve(answer);
  })
}


function runSpotifyRequestNewLoopInside(method, uri, qry, prio) {
  return new Promise(async resolve => {
    var input = {};
    input.method = method;
    input.uri = uri;
    input.qry = qry;
    input.prio = prio;


    global.jobQueue.push(input)
      .on('finish', function (result) {

        resolve(result);

        /*

        if (!result.error) {
          console.log("erfolgreich");
          var answer = {success: true, data: result.body};
          resolve(answer);
        }

        if (result.error) {
          // nur kurz
          resolve(answer);
        }
        */
      })


    // if (result.error) throw new Error(result.error);


    // return answer;

  })
  /*
  return new Promise(async resolve => {
    var answer = {};

    for (var x = 0; x < 5; x++) {
      const res = await runSpotifyRequestNew(method, uri, qry);

      //if(res.toString().indexOf("API rate") > -1) {
        //console.log(res);
       // console.log("FEIERABEND");
      //}

      if(!res.error){
        console.log("erfolgreich");
      }
      //if (res.error) throw new Error(res.error);
      if (res.error){
       // console.log("FEEEEEEEEEEEEEEEEEEEEHLER!!!!!!!!!!!!!");
       // console.log(res.body);
        var errorBody = JSON.parse(res.body);

        console.log(errorBody.error.status);
      // if (res.body.hasOwnProperty('error')) {
        var errorCode = errorBody.error.status;
        var errorMessage = errorBody.error.status + " " + errorBody.error.message;

        console.log(errorMessage);
        answer.data = errorMessage;
        answer = {success: false, data: errorMessage};




        if (errorCode == "401") {
          console.log("connecten");
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
  */

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


  var answer = "";

  var method = input.method;
  var qry = input.qry;
  var uri = input.uri;

  var req2 = unirest(method, uri);
  req2.query(qry);


  req2.headers({
    //"Authorization": "Bearer BQBPgGtzA8S5DsgDxrApAvNVZ2vn_jlPt1IEAT5vE3ez3nxPh-9v6FFDTwwyfz3su-Hi06xQ9JvX6UldMw4"
    "Authorization": "Bearer " + global.tokenSpotify
  });

  req2.end(function (ress) {
    if (ress.error) {
      //  console.log(ress);
      try {
        var errorBody = JSON.parse(ress.body);
        var errorCode = errorBody.error.status;

        console.log(errorCode);

        if (errorCode == 429) {
          var retryAfterInSeconds = ress['headers']['retry-after'];
          //console.log("Try again in " + retryAfterInSeconds + " Seconds");
          (async () => await await sleep(3 * retryAfterInSeconds * 1000));
        }

        if (errorCode == "401") {
          console.log("connecten");
          connectSpotify();
        }

      } catch (e) {
        console.log("ECONNRESET");
        console.log("connecten");
        connectSpotify();
        //throw "ECONNRESET";
       // (async () => await await sleep(16 * 1000));
      }
      // throw new Error(ress.error)
    }
    cb(null, ress);

    // resolve(ress);
  })
  // cb(null, answer);

  /*

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
  */
}


function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}


