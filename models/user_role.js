import connection from "../database/dbconnection.js";

export default class User_roleManager {
  async find(ID) {
    let findquery = `SELECT * FROM user_role WHERE ID = ${ID}`;
    let result = await connection.query(findquery);
    return result[0][0];
  }

  async create(user_id, role_id) {
    let insertQuery = `INSERT INTO user_role (user_id,role_id) VALUES( ${user_id}, ${role_id})`;
    await connection.query(insertQuery);
  }
  async list() {
    let selectQuery = `select ur.id,u.email,u.firstname,r.title from user_role ur inner join users u inner join roles r where u.id = ur.user_id and r.id = ur.role_id and u.is_deleted = ${0} and r.is_deleted = ${0};`;
    let result = await connection.query(selectQuery);
    return result;
  }

  update(ID, user_id, role_id) {
    let updateQuery = `UPDATE user_role SET user_id = ${user_id}, role_id = ${role_id} where ID = ${ID}`;
    connection.query(updateQuery);
  }

  async Remove(ID) {
    let currentdate = new Date()
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "");
    let deleteQuery = `UPDATE user_role SET is_deleted = ${1} WHERE ID = ${ID}`;
    let result = await connection.query(deleteQuery);
    return result;
  }
}

export class User_role {
  constructor(ID, user_id, role_id) {
    this.ID = ID;
    this.user_id = user_id;
    this.role_id = role_id;
  }
}
