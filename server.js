var express = require("express");
var cors = require("cors");
var app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var jwt = require("jsonwebtoken");
const secret = "Fullstack-login";

app.use(cors());
app.use(express.json());
// get the client
const mysql = require("mysql2");

var host = "localhost";
if (process.env.NODE_ENV == "production") {
  host = "mysql-server";
}

// create the connection to database
const connection = mysql.createConnection({
  host: host,
  user: "root",
  password: "1234",
  database: "mydb",
});

app.post("/authen", jsonParser, function (req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1]
    var decoded = jwt.verify(token, secret);
    res.json({ status: "OK", decoded});
  } catch (err) {
    res.json({ status: "error", message: err.message});
  }
});

app.post("/login", jsonParser, function (req, res, next) {
  connection.execute(
    "SELECT * FROM `users` WHERE `username` = ?",
    [req.body.username],
    function (err, results, fields) {
      if (err) { res.json({ status: "error", message: err }); return }
      if (results.length == 0) { res.json({ status: "error", message: "No user found" }); return }
      bcrypt.compare(req.body.password, results[0].password, function (err, result) {
        if (result) {
          var token = jwt.sign({ id: results[0].id}, secret, { expiresIn: '1h' });
          res.json({ status: "OK", message: "login success", token});
        } else {
          res.json({ status: "error", message: "login failed" });
        }
      });
    }
  );
}); 

app.get("/users", function (req, res, next) {
  connection.query("SELECT * FROM users", function (err, results, fields) {
    res.json(results);
  });
}); 

app.get("/users/:id", jsonParser, function (req, res, next) {
  const id = req.params.id;
  connection.query(
    "SELECT * FROM `users` WHERE `id` = ?",
    [id],
    function (err, results, fields) {
      res.json(results);
    }
  );
}); 

app.post("/users", jsonParser, function (req, res, next) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    connection.execute(
      "INSERT INTO `users`(`fname`, `lname`, `username`, `password`, `avatar`) VALUES (?,?,?,?,?)",
      [
        req.body.fname,
        req.body.lname,
        req.body.username,
        hash,
        req.body.avatar,
      ],
      function (err, results, fields) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "OK", message: "Create Ok" });
      }
    );
  });
});

app.put("/users", jsonParser, function (req, res, next) {
  connection.query(
    "UPDATE `users` SET `fname`=?,`lname`=?,`username`=?,`password`=?,`avatar`=? WHERE id = ?",
    [
      req.body.fname,
      req.body.lname,
      req.body.username,
      req.body.password,
      req.body.avatar,
      req.body.id,
    ],
    function (err, results, fields) {
      res.json(results);
    }
  );
}); 

app.delete("/users", jsonParser, function (req, res, next) {
  connection.query(
    "DELETE FROM `users` WHERE id = ?",
    [req.body.id],
    function (err, results, fields) {
      res.json(results);
    }
  );
});


app.post("/production", jsonParser, function (req, res, next) {
    connection.execute(
      "INSERT INTO `tbl_jobcard`(`modal`, `shift`, `exp`, `shipment`, `qty`, `datestar`, `dateend`, `ass_line`) VALUES (?,?,?,?,?,?,?,?)",
      [
        req.body.modal,
        req.body.shift,
        req.body.exp,
        req.body.shipment,
        req.body.qty,
        req.body.datestar,
        req.body.dateend,
        req.body.ass_line,
      ],
      function (err, results, fields) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "OK", message: "Create Ok" });
      }
    );
});

app.put("/production", jsonParser, function (req, res, next) {
  connection.query(
    "UPDATE `tbl_jobcard` SET `datestar`=?,`dateend`=? WHERE job = ?",
    [
      req.body.datestar,
      req.body.dateend,
      req.body.job
    ],
    function (err, results, fields) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json({ status: "OK", message: "Update Ok" });
    }
  );
});

app.get("/production", function (req, res, next) {
  connection.query("SELECT * FROM tbl_jobcard", function (err, results, fields) {
    res.json(results);
  });
}); 

app.get("/line", function (req, res, next) {
  connection.query("SELECT * FROM tb_mas_line", function (err, results, fields) {
    res.json(results);
  });
}); 

/* app.get("/model", function (req, res, next) {
  connection.query("SELECT * FROM tbl_mas_model", function (err, results, fields) {
    res.json(results);
  });
});  */

app.get("/model/:line", function (req, res, next) {
  //res.send(req.params);
  const {line} = req.params;
  connection.query(
    'SELECT * FROM tbl_mas_model WHERE line = ?',
    [line],
    function (err, results, fields) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json(results);
    }
  ); 
}); 
 
app.listen(3336, function () {
  console.log("CORS-enabled web server listening on port 3336");
});
