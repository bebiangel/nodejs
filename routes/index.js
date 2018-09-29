var express = require("express");
var router = express.Router();
var template = require("../lib/template.js");

router.get("/", function(request, response) {
  //
  var title = "Welcome";
  var description = "Hello Node.js";
  var list = template.list(request.list);
  var authStatusUI = request.authStatusUI;
  var html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:300px; display:block;">
      `,
    `<a href="/topic/create">create</a>`,
    authStatusUI
  );
  response.send(html);
});

module.exports = router;
