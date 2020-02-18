const router = require("express").Router();
const { check } = require("express-validator");
const { verify } = require("../middelware/tokenChecker");

const {
  getArtistByVcaId,
  getFavoritePooleventsByUserId


} = require("../controller/suggestyController");



router.route("/:vcaIdType/:vcaId")
  .get(getArtistByVcaId)











module.exports = router;
