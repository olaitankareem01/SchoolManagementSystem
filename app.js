import express from "express";
import bodyparser from "body-parser";
import handlebars from "express-handlebars";
import path from "path";
// import cors from 'cors';

import nodemailer from "nodemailer";
import session from "express-session";
import userRouter from "./controllers/usercontroller.js";
import contactRouter from "./controllers/contactcontroller.js";
import roleRouter from "./controllers/rolecontroller.js";
import applicantRouter from "./controllers/applicantcontroller.js";
import studentRouter from "./controllers/studentcontroller.js";
import classRouter from "./controllers/classcontroller.js";
import categoryRouter from "./myapi/categorycontroller.js";
import AuditLog from "./models/auditlog.js";
import "handlebars-helpers";
import Authlib from "./models/auth.js";
import dotenv from 'dotenv'
const auditLog = new AuditLog();
const __dirname = path.resolve();
const app = express();
dotenv.config();
// var helpers = require('handlebars-helpers')();
const port = process.env.PORT;
app.use(express.static(__dirname + "/public"));
app.use(
  bodyparser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 100000,
  })
);

app.use(bodyparser.json());
// app.use(cors());
// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
app.use(
  session({
    saveUninitialized: true,
    secret: "123456",
    resave: true,
  })
);
app.set("view engine", "hbs");
app.engine(
  "hbs",
  handlebars({
    extname: "hbs",
  })
);
// handlebars.registerHelper('dateFormat', import('handlebars-dateformat'));

// const transporter = nodemailer.createTransport({
//   host: "smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: "751ddbcd1533e1",
//     pass: "08b708ed3a91d9",
//   },
// });

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//       host: 'smtp@gmail.com',
//     // /host: "outmail.abc.co.th",
//     port: 587,
//     auth: {

//         user: 'olaitankareem01@gmail.com',
//         pass: 'tsquare0601'
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// });

// const mailOptions = {
//   from: "olaitankareem01@gmail.com",
//   to: "kabdrahman01@gmail.com",
//   subject: "precious gift academys",
//   text: `Hi,Rahman, welcome to precious gift academy`,
// };

// transporter.sendMail(mailOptions, (err, data) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(data);
//   }
// });

app.get(
  "/getLogs",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest),
  async (req, res) => {
    let result = await auditLog.getLogs();
    res.render("logs", { layout: "admin", data: result[0] });
  }
);

app.get("/forbidden", function (req, res) {
  res.render("forbidden");
});

app.get("/*", function (req, res, next) {
  res.locals.name = req.session.name;
  res.locals.isLoggedIn = req.session.isLoggedIn;
  next();
});

app.get("/about", (req, res) => {
  res.render("aboutus");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/admin",
  Authlib.auth,
  Authlib.requireAny(Authlib.isOfficialRequest),
  function (req, res) {
    res.render("admindashboard", { layout: "admin" });
  }
);

app.listen(port, () => {
  console.log(`app listening at port:${port}`);
});

app.use(userRouter);
app.use(contactRouter);
app.use(roleRouter);
app.use(applicantRouter);
app.use(studentRouter);
app.use(classRouter);
app.use("/categories", categoryRouter);
