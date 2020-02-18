const router = require("express").Router();
const { check } = require("express-validator");
const { verify } = require("../middelware/tokenChecker");

const {
  getArtistByName,
  getArtistById,
  getSimilarArtistById,
  getArtistByVcaId,
  getFavoritePooleventsByUserId,
  postArtist,
  deleteArtist
} = require("../controller/spotifyController");


router.route("/name/:artistName")
  .get(getArtistByName)

router.route("/id/:artistId")
  .get(getArtistById)

router.route("/similar/id/:artistId")
  .get(getSimilarArtistById)

router.route("/artist/:vcaIdType/:vcaId")
  .get(getArtistByVcaId)

router.route("/suggestion/user/:id")
  .get(getFavoritePooleventsByUserId)

router.route("/")
  .post(postArtist)
  .delete(deleteArtist)




module.exports = router;
