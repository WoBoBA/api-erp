var Db = require("./dboperations");
var Line = require("./line");
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.use("/api", router);

var port = process.env.PORT || 8090;
app.listen(port);
console.log("Order API is runnning at " + port);

router.use((request, response, next) => {
  //console.log("middleware");
  next();
});

router.route("/lines").get((request, response) => {
  Db.getlines().then((data) => {
    response.json(data[0]);
  });
});

router.route("/lines").post((request, response) => {
  let datas = { ...request.body };
  Db.addline(datas).then((data) => {
    response.status(200).json(data);
    //console.log(order);
  });
});

router.route("/lines").put((request, response) => {
    let datas = { ...request.body };
    Db.updatline(datas).then((data) => {
      response.status(200).json(data);
      //console.log(order);
    });
  });

router.route("/lines/:id").get((request, response) => {
  Db.getline(request.params.id).then((data) => {
    response.json(data[0]);
  });
});
