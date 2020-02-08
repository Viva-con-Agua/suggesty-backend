const { connectMysql } = require("./config/connectMysql");
const { connectSpotify } = require("./config/connectSpotify");
const eventEmitter = require("./service/eventEmitter");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan")("dev");
const express = require("express");
const suggesty2 = require("./routes/suggesty")
const spotify = require("./routes/spotify")
const socket = require("./socket");
const dotenv = require("dotenv");
const cors = require("cors");
require("colors");

dotenv.config({ path: "./config/.env" });

const app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

socket(io);
eventEmitter();

if (process.env.NODE_ENV == "dev") {
  app.use(morgan);
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
connectMysql();
connectSpotify();
app.use(cors());


app.use("/suggesty/api/v1/vca", suggesty2);
app.use("/suggesty/api/v1/spotify", spotify);


const port = process.env.PORT || 5001;

server.listen(port, () => {
  console.log(
    `App running in ${process.env.NODE_ENV} mode on port ${port}`.green.bold
  );
});
