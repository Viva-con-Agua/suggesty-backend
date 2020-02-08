const router = require("express").Router();
const { check } = require("express-validator");
const { verify } = require("../middelware/tokenChecker");

const {
  getArtistByVcaId,
  postArtist,
  deleteArtist,
  getFavoritePooleventsByUserId


} = require("../controller/suggestyController");


router.route("/:vcaIdType/:vcaId")
  .get(getArtistByVcaId)


router.route("/")
  .post(postArtist)
  .delete(deleteArtist)

router.route("/suggestyActions/:id")
  .get(getFavoritePooleventsByUserId)






module.exports = router;
