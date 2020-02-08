const { EventEmitter } = require("events");

const initEmitter = () => {
  try {
    global.em = new EventEmitter();
    em.setMaxListeners(0);
  } catch (error) {
    console.log(`error in initEmitter ${error.message}`);
  }
};

module.exports = initEmitter;
