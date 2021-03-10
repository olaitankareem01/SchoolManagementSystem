import express from "express";
import bycryt from "bcrypt";
import session from "express-session";
import Authlib from "../models/auth.js";
import UsersManager from "../models/users.js";
const router = express.Router();
const usersmanager = new UsersManager();
import AuditLog from "../models/auditlog.js";
const auditLog = new AuditLog();
import RoleManager from "../models/roles.js";
const rolemanager = new RoleManager();
import User_roleManager from "../models/user_role.js";
import { users } from "../models/users.js";
const user_rolemanager = new User_roleManager();

router.get("/users/signup", function (req, res) {
  res.render("signup");
});

router.post("/users/signup", async function (req, res) {
  try {
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    console.log(firstname);
    let email = req.body.email;
    console.log(email);
    let phone_no = req.body.phone_no;
    let password = req.body.password1;
    let password2 = req.body.password2;
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    if (email.indexOf("@") < 0) {
      let message = "Email is invalid";
      res.render("usersignup", { message: message });
      return;
    }
    if (password != password2) {
      let message = "Your password does not match";
      res.render("usersignup", { message: message });
      return;
    }
    let existingUsersmail = await usersmanager.checkemail(email);
    console.log(existingUsersmail);
    if (existingUsersmail.length > 0) {
      let message = "This email has already been taken";
      res.render("signup", { message: message });
      return;
    }
    let hashedpassword = await bycryt.hash(password, 10);
    await usersmanager.create(
      firstname,
      lastname,
      email,
      phone_no,
      hashedpassword
    );
    let result1 = await usersmanager.getUserId(email);
    let user_id = result1[0].ID;
    let result2 = await rolemanager.getUserRoleId();
    let userrole_id = result2[0].ID;
    await user_rolemanager.create(user_id, userrole_id);
    let message = "Your account has been created";
    res.redirect("/users/login");
    auditLog.insertAuditLog(
      "User account created",
      `successful creation of account by ${ip} with email ${email}`,
      email
    );
  } catch (error) {
    res.status(500);
  }
});
//edits user details
router.get("/users/edit/:ID", async function (req, res) {
  let ID = req.params.ID;
  let user = await usersmanager.find(ID);
  console.log(user);
  res.render("edituser", { data: user, layout: "admin" });
});

router.post(
  "/users/edit",
  Authlib.auth,
  Authlib.requireAny([Authlib.isAdminRequest]),
  async function (req, res) {
    let ID = req.body.ID;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let phone_no = req.body.phone_no;
    let password = req.body.password1;
    let password2 = req.body.password2;
    if (email.indexOf("@") < 0) {
      let message = "Email is invalid";
      res.set("Content-Type", "application/json");
      res.send(message);
      return;
    }
    if (password != password2) {
      let message = "Your password does not match";
      res.set("Content-Type", "application/json");
      res.send(message);
      return;
    }
    let existingUsersmail = await usersmanager.checkemail(email);
    console.log(existingUsersmail);
    if (existingUsersmail) {
      let hashedpassword = await bycryt.hash(password, 10);
      usersmanager.update(
        ID,
        firstname,
        lastname,
        email,
        phone_no,
        hashedpassword
      );
      res.redirect("/users/login");
      const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      auditLog.insertAuditLog(
        "User account modified",
        `successful modification of account by ${ip} with email ${email}`,
        email
      );
      let message = "Your account has been updated";
      res.set("Content-Type", "application/json");
      res.send(message);
    }
  }
);
//assigns role to users
router.get(
  "/users/assignrole/:ID",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest),
  async function (req, res) {
    let result = await rolemanager.list();
    res.render("assignrole", { layout: "admin", data: result[0] });
  }
);

router.post(
  "/users/assignrole/:ID",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest),
  async function (req, res) {
    let user_id = req.params.ID;
    let role = req.body.title;
    let result = await rolemanager.getRoleId(role);
    let role_id = result[0].ID;
    await user_rolemanager.create(user_id, role_id);
    res.redirect("/usersroles");
  }
);

router.get(
  "/usersroles",
  Authlib.auth,
  Authlib.requireAny(Authlib.isRegistrarRequest, Authlib.isAdminRequest),
  async function (req, res) {
    let result = await user_rolemanager.list();
    res.render("userroles", { layout: "admin", data: result[0] });
  }
);

router.get(
  "/deleteuserrole/:ID",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest),
  async function (req, res) {
    let ID = req.params.ID;
    await user_rolemanager.Remove(ID);
    res.redirect("/usersroles");
  }
);

//renders login form
router.get("/users/login", function (req, res) {
  res.render("login");
});
//submits login details
router.post("/users/login", async function (req, res) {
  let email = req.body.email;
  let password = req.body.password;
  // const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  let user = await usersmanager.findByEmail(email);
  var redirectionUrl = "/";
  if (user == null || user == undefined) {
    let message = "Incorrect email or password";
    res.render("login", { message: message });
    return;
  } else {
    let isCorrect = await bycryt.compare(password, user.password);
    if (isCorrect == true) {
      req.session.userid = user.ID;
      req.session.user = user;
      req.session.isLoggedIn = true;
      req.session.name = `${user.firstname}`;
      req.session.email = user.email;
      let roles = await usersmanager.getRoles(user.ID);
      req.session.roles = roles || [];
      res.redirect(redirectionUrl);
    } else {
      let message = "Incorrect email or password";
      res.render("login", { message: message });
      try {
        auditLog.insertAuditLog(
          "Failed Login",
          `failed login from ${ip} with email ${email}`,
          email
        );
      } catch (error) {
        res.send(500);
      }

      return;
    }
  }
});
//gets the list of all users
router.get(
  "/users/list",
  Authlib.auth,
  Authlib.requireAny(
    Authlib.isAdminRequest,
    Authlib.isRegistrarRequest,
    Authlib.isPrincipalRequest
  ),
  async function (req, res) {
    let result = await usersmanager.list();
    res.render("userslist", {
      data: result[0],
      layout: "admin",
    });
  }
);

//logout route
router.get("/users/logout", async (req, res) => {
  if (req.session.userid) {
    delete req.session.userid;
    req.session.isLoggedIn = false;
    res.redirect("/users/login");
  } else {
    let email = req.session.email;
    res.redirect("/");
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    auditLog.insertAuditLog(
      "Logout",
      `logout from ${ip} with email ${email}`,
      email
    );
  }
});

//user details
router.get("/users/:id", async function (req, res) {
  let ID = req.params.id;
  let id = Number(ID);
  let user = await usersmanager.getUserDetails(id);
  res.render("edituser", user);
});

// router.put('/users/:id', async function (req, res) {
//     let ID = req.params.id;
//     // let ID = Number(id);
//     // let user = await usersmanager.getUserDetails(id);
//     // res.set('Content-Type', 'application/json');
//     // res.status(200).send(user);
//     let firstname = req.body.firstname;
//     console.log(firstname);
//     let lastname = req.body.lastname;
//     let email = req.body.email;
//     console.log(email);
//     let phone_no = req.body.phone_no;
//     let password = req.body.password1;
//     let password2 = req.body.password2;
//     if (email.indexOf('@') < 0) {
//         let message = "Email is invalid";
//         res.set('Content-Type', 'application/json');
//         res.send(message);
//         return;
//     }
//     if (password != password2) {
//         let message = "Your password does not match";
//         res.set('Content-Type', 'application/json');
//         res.send(message);
//         return;
//     }
//     let existingUsersmail = await usersmanager.checkemail(email);
//     console.log(existingUsersmail);
//     if (existingUsersmail) {
//         let hashedpassword = await bycryt.hash(password, 10);
//         await usersmanager.update(ID, firstname, lastname, email, phone_no, hashedpassword);
//         //res.redirect('/users/login');
//         //  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//         //  auditLog.insertAuditLog('User account modified', `successful modification of account by ${ip} with email ${email}`, email);
//         let message = "Your account has been updated";
//         res.set('Content-Type', 'application/json');
//         res.send(message);
//     }
// });
// //api to delete a user

// router.delete('/users/:id', async function (req, res) {
//     let id = req.params.id;
//     let ID = Number(id);
//     let user = await usersmanager.getUserDetails(ID);
//     console.log(user);
//     // var found = false;
//     // if (!found && user.ID == ID) {
//     await usersmanager.Remove(ID);
//     res.set('Content-Type', 'application/json');
//     let message = 'Deletion was successful'
//     res.send(message);
//     //console.log('Deletion was successful');
//     // }
//     // else{
//     //        res.set('Content-Type', 'application/json');
//     //     res.send('Error Ocurred');
//     // }
// });
export default router;
