var Queue = require('better-queue');

const {queueFunction} = require("../controller/spotifyController");


const createJobQueue = () => {
  try {
    // console.log("Related artists queue created");
    var q = new Queue(queueFunction,
      {
        priority: function (input, cb) {
          return cb(null, input.prio);
        }
        ,
        concurrent: 1

      });
    global.jobQueue = q;









  } catch (error) {
    throw error;
  }
};


module.exports = {createJobQueue};
