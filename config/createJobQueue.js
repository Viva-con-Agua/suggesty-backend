var Queue = require('better-queue');

const {queueFunction} = require("../controller/spotifyController");




const createJobQueue = () => {
  try {
    console.log("Related artists queue created");
    var q = new Queue(queueFunction);
    global.jobQueue = q;


  } catch (error) {
    throw error;
  }
};

module.exports = { createJobQueue };
