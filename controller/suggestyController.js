const { connectSpotify } = require("../config/connectSpotify");
const {fetchSimilarArtists} = require("../controller/spotifyController")

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
        res.status(200).json({
          success: true,
          data: resp
        });
      }
    }
  );
};



