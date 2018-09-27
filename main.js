var express = require("express");
var app = express();
var fs = require("fs");
var template = require("./lib/template.js");
var path = require("path");
var sanitizeHtml = require("sanitize-html");
var qs = require("querystring");
var bodyParser = require("body-parser");
var compression = require("compression");

// use middleware => request의 body에 접근 가능하도록 한다.
app.use(bodyParser.urlencoded({ extended: false }));
// source compress
app.use(compression());
// * 모든요청을 받지만 get방식만 받도록 함.
app.get("*", function(request, response, next) {
  //
  fs.readdir("./data", function(error, files) {
    request.list = files;
    next();
  });
});

// route, routing
// app.get('/', (req, res) => res.send("Hello World"));
app.get("/", function(request, response) {
  //
  var title = "Welcome";
  var description = "Hello Node.js";
  var list = template.list(request.list);
  var html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}`,
    `<a href="/create">create</a>`
  );
  response.writeHead(200);
  response.end(html);
});

app.get("/page/:pageId", function(request, response) {
  //
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function(err, description) {
    var title = request.params.pageId;
    var sanitizedTitle = sanitizeHtml(title);
    var sanitizeDescription = sanitizeHtml(description);
    var list = template.list(request.list);
    var html = template.HTML(
      sanitizedTitle,
      list,
      `<h2>${sanitizedTitle}</h2>${sanitizeDescription}`,
      ` <a href="/create">create</a> 
          <a href="/update/${sanitizedTitle}">update</a>
          <form action="/delete_process" method="post">
            <input type="hidden" name="pageId" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>`
    );
    response.send(html);
  });
});

app.get("/create", (request, response) => {
  //
  var title = "WEB - create";
  var list = template.list(request.list);
  var html = template.HTML(
    title,
    list,
    `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p><textarea name="description" placeholder="description"></textarea></p>
        <p><input type="submit"></p>
      </form>
      `,
    ``
  );
  response.send(html);
});

app.post("/create_process", (request, response) => {
  //
  var post = request.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, "utf8", function(err) {
    response.redirect(`/?id=${title}`);
  });
});

app.get("/update/:pageId", (request, response) => {
  //
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function(err, description) {
    var title = request.params.pageId;
    var sanitizedTitle = sanitizeHtml(title);
    var sanitizeDescription = sanitizeHtml(description);
    var list = template.list(request.list);
    var html = template.HTML(
      title,
      list,
      `        
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${sanitizedTitle}">
          <p><input type="text" name="title" placeholder="title" value=${sanitizedTitle}></p>
          <p><textarea name="description" placeholder="description">${sanitizeDescription}</textarea></p>
          <p><input type="submit"></p>
        </form>
        `,
      `<a href="/create">create</a> <a href="/update/${sanitizedTitle}">update</a>`
    );
    response.send(html);
  });
});

app.post("/update_process", (request, response) => {
  //
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function(err) {
    fs.writeFile(`data/${title}`, description, "utf8", function(err) {
      response.redirect(`/page/${title}`);
    });
  });
});

app.post("/delete_process", (request, response) => {
  //
  var post = request.body;
  var id = post.pageId;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function(error) {
    response.redirect("/");
  });
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));
