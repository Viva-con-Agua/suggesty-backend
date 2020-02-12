const { connectSpotify } = require("../config/connectSpotify");

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


// @desc  create favorite
// @route POST /api/v1/favorite
// @access Private
exports.postArtist = (req, res) => {


  var vcaId = req.body.vcaId;
  var artistId = req.body.artistId;
  var vcaType = req.body.vcaType;

  const sql = `INSERT INTO vcaartist (vcaId, artistId, vcaType) VALUES (?, ?, ?)`;
  global.conn.query(sql, [vcaId, artistId, vcaType], (error, favorite) => {
  //global.conn.query(sql, body, (error, favorite) => {
    if (error) {
      res.status(400).json({
        success: false,
        messaage: error.message
      });
    } else {

      res.status(200).json({
        success: true,
        data: favorite
      });

    }
  });
};

// @desc delete favorite by id
// @route DELETE /api/v1/favorite/:id
// @access Private
exports.deleteArtist = (req, res) => {
  var vcaId = req.body.vcaId;
  var artistId = req.body.artistId;
  var vcaType = req.body.vcaType;

  const sql = `DELETE FROM vcaartist WHERE vcaId='${vcaId}' AND artistId='${artistId}' and vcaType='${vcaType}';`;
  global.conn.query(sql, (error, resp) => {
    if (error) {
      res.status(400).json({
        success: false,
        message: `Error in deleteArtist ${error.message}`
      });
    } else {
      res.status(200).json({
        success: true,
        data: resp
      });
    }
  });
};
