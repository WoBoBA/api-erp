const config = require("./dbconfig");
const sql = require("mssql");

async function getlines() {
  try {
    let pool = await sql.connect(config);
    let products = await pool
      .request()
      .query("SELECT * from mas_line where isactive = 1");
    return products.recordsets;
  } catch (error) {
    console.log(error);
  }
}

async function getline(id) {
  try {
    let pool = await sql.connect(config);
    let product = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * from mas_line where lineid = @id");
    return product.recordsets;
  } catch (error) {
    console.log(error);
  }
}

async function addline(data) {
  try {
    let pool = await sql.connect(config);
    let insertline = await pool
      .request()
      .input("linename", sql.NVarChar, data.linename)
      .input("lineprocess", sql.NVarChar, data.lineprocess)
      .input("isactive", sql.Int, data.isactive)
      .execute("insertline");
    return insertline;
  } catch (err) {
    console.log(err);
  }
}

async function updatline(data) {
    try {
      let pool = await sql.connect(config);
      let updateline = await pool
        .request()
        .input("linename", sql.NVarChar, data.linename)
        .input("lineprocess", sql.NVarChar, data.lineprocess)
        .input("isactive", sql.Int, data.isactive)
        .input("lineid", sql.Int, data.lineid)
        .execute("updateline");
      return updateline;
    } catch (err) {
      console.log(err);
    }
  }


module.exports = {
    getlines:  getlines,
    getline:  getline,
    addline:  addline,
    updatline: updatline
  }