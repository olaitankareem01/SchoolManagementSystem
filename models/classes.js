import connection from "../database/dbconnection.js";

export default class ClassManager {
  async find(ID) {
    let findquery = `SELECT * FROM classes WHERE ID = ${ID}`;
    let result = await connection.query(findquery);
    return result[0][0];
  }

  create(classname, category) {
    let currentdate = new Date()
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "");
    let insertQuery = `INSERT INTO classes ( class_name, class_category_id, date_created ) VALUES('${classname}', '${category}', '${currentdate}')`;
    connection.query(insertQuery);
  }

  async list() {
    let selectQuery = `select c.*,cc.name from classes c left join class_category cc on c.class_category_id = cc.ID`;
    let result = await connection.query(selectQuery);
    return result;
  }
  async listByCategoryId(categoryId) {
    let selectQuery = `SELECT * FROM classes WHERE is_deleted = ${0} and class_category_id = ${categoryId}`;
    let result = await connection.query(selectQuery);
    return result[0];
  }

  async update(ID, classname, category) {
    try {
      let currentdate = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      let updateQuery = `UPDATE classes SET class_name = '${classname}',class_category = '${category}',last_modified = '${currentdate}' where ID = ${ID}`;
      await connection.query(updateQuery);
    } catch (error) {
      res.status(500);
    }
  }

  async Remove(ID) {
    let currentdate = new Date()
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "");
    let deleteQuery = `UPDATE classes SET is_deleted = ${1}, date_deleted = '${currentdate}' WHERE ID = ${ID}`;
    let result = await connection.query(deleteQuery);
    return result;
  }
}

export class Class {
  constructor(ID, classname, category) {
    this.ID = ID;
    this.classname = classname;
    this.category = category;
  }
}
