var express = require("express");
var app = express();
var fs = require("fs");
var bodyParser = require("body-parser");
var compression = require("compression");
var topicRouter = require("./routes/topic");
var indexRouter = require("./routes/index");
//
var cookie = require("cookie");
var helmet = require("helmet");
app.use(helmet());

function authIsOwner(request, response) {
  //
  var cookies = {};
  var isOwner = false;
  if (request.headers.cookie !== undefined) {
    cookies = cookie.parse(request.headers.cookie);
  }
  if (cookies.email === "jwhan@gmail.com" && cookies.password === "1234") {
    isOwner = true;
  }
  return isOwner;
}

// public directory 안에서 찾는다.
app.use(express.static("public"));
// use middleware => request의 body에 접근 가능하도록 한다.
app.use(bodyParser.urlencoded({ extended: false }));
// source compress
app.use(compression());
// * 모든요청을 받지만 get방식만 받도록 함.
app.get("*", function(request, response, next) {
  //
  var authStatusUI = `<a href="/topic/login">login</a>`;
  var isOwner = authIsOwner(request, response);
  if (isOwner) {
    authStatusUI = `<a href="/topic/logout_process">logout</a>`;
  }
  fs.readdir("./data", function(error, files) {
    request.list = files;
    request.authStatusUI = authStatusUI;
    next();
  });
});

// route, routing
// app.get('/', (req, res) => res.send("Hello World"));
app.use("/", indexRouter);

// 하위 router는 topic이 필요없다.
app.use("/topic", topicRouter);

app.use((request, response, next) => {
  response.status(404).send(`Sorry can't find that!`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));
