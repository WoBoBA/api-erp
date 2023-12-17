const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const jwt = require("jsonwebtoken");
const secret = "Fullstack-login";
require('dotenv').config()

app.use(cors());
app.use(express.json());
// get the client
const mysql = require("mysql2");
//const sql = require("mssql");

const host = "::";
if (process.env.NODE_ENV == "production") {
  host = "mysql-server";
} 

/* const pool = new sql.ConnectionPool({
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true, // Disable SSL verification
  },
})

pool.connect(err => {
  if (err) {
    console.log(err)
  } else {
    console.log("OK")
  }
   
}) */

// create the connection to database
 const connection = mysql.createConnection({
  host: host,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_NAME,
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
      "INSERT INTO `tbl_jobcard`(`modal`, `shift`, `exp`, `shipment`, `qty`, `datestar`, `dateend`, `ass_line`, `alternate`, `status`) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [
        req.body.modal,
        req.body.shift,
        req.body.exp,
        req.body.shipment,
        req.body.qty,
        req.body.datestar,
        req.body.dateend,
        req.body.ass_line,
        req.body.alternate,
        req.body.status,
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

app.get("/model", function (req, res, next) {
  connection.query("SELECT * FROM tbl_mas_model", function (err, results, fields) {
    res.json(results);
  });
});

app.get("/model/:line", function (req, res, next) {
  //res.send(req.params);
  const {line} = req.params;
  connection.query(
    'SELECT model_name FROM tbl_mas_model WHERE line = ?',
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

app.get("/production/:line/:model/:datestar", function (req, res, next) {
  //res.send(req.params);
  const {line, model, datestar} = req.params;
  connection.query(
    'SELECT job,modal,shift,exp,shipment,qty,datestar,line_name,alternate,status FROM view_jobcard  where ass_line = ? and modal = ? and datestar = ? and status = 0',
    [line, model, datestar],
    function (err, results, fields) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json(results);
    }
  );  
}); 

app.get("/bam/:job", function (req, res, next) {
  //res.send(req.params);
  const {job} = req.params;
  connection.query(
    'SELECT job,bam_code,qty,req FROM view_jobcard_ban WHERE job = ?',
    [job],
    function (err, results, fields) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json(results);
    }
  );  
}); 

app.get("/alternate/:model", function (req, res, next) {
  //res.send(req.params);
  const {model} = req.params;
  connection.query(
    'SELECT distinct alternate FROM bill_of_material WHERE itempart = ? AND isactive = 1',
    [model],
    function (err, results, fields) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      res.json(results);
    }
  ); 
}); 

app.get("/jobbam/:job/:qty", function (req, res, next) {
  //res.send(req.params);
  const {job,qty} = req.params;
  connection.query(
    'CALL get_job_bam (?, ?)',
    [job,qty],
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