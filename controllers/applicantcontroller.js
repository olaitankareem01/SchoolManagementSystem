import express from "express";
import ApplicantManager from "../models/applicants.js";
import StudentManager from "../models/student.js";
import ClassManager from "../models/classes.js";
import AuditLog from "../models/auditlog.js";
import Authlib from "../models/auth.js";

const router = express.Router();
const applicantmanager = new ApplicantManager();
const classmanager = new ClassManager();
const studentmanager = new StudentManager();
const auditLog = new AuditLog();

router.get("/apply", async function (req, res) {
  let classes = await classmanager.list();
  res.render("applicationform", { data: classes[0] });
});

router.post("/apply", async function (req, res) {
  let firstname = req.body.firstname;
  let middlename = req.body.middlename;
  let lastname = req.body.lastname;
  let sex = req.body.sex;
  let age = req.body.age;
  let address = req.body.address;
  let dateofbirth = req.body.dateofbirth;
  let class_id = req.body.class_id;
  let phoneno = req.body.phoneno;
  try {
    await applicantmanager.create(
      firstname,
      middlename,
      lastname,
      dateofbirth,
      sex,
      age,
      class_id,
      address,
      phoneno
    );
  } catch (error) {
    res.status(500).send("An error occurred!");
  }

  let message = "congratulations";
  res.render("applicationform", { message: message });
  res.redirect("/");
});

router.get(
  "/listapplicants",
  Authlib.auth,
  Authlib.requireAny([Authlib.isOfficialRequest]),
  async function (req, res) {
    let result1 = await applicantmanager.list();
    let result2 = await applicantmanager.getClassNameList();

    console.log(result2);
    res.render("applicantslist", {
      layout: "admin",
      data1: result1,
      data2: result2,
    });
  }
);

router.get(
  "/application/admit/:ID",
  Authlib.auth,
  Authlib.requireAny([Authlib.isAdminorRegistrarRequest]),
  async function (req, res) {
    let ID = req.params.ID;
    try {
      await applicantmanager.admit(ID);
      let result = await applicantmanager.getAdmittedStudent(ID);
      let applicant_id = result[0].ID;
      let firstname = result[0].firstname;
      let middlename = result[0].middlename;
      let lastname = result[0].lastname;
      let sex = result[0].sex;
      let age = result[0].age;
      let address = result[0].address;
      let dateofbirth = result[0].dateofbirth
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      let class_id = result[0].class_id;
      let admissiondate = result[0].date_admitted
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      let phoneno = result[0].phoneno;
    } catch (error) {
      res.sendStatus(500);
    }

    try {
      await studentmanager.registerSuccessfulApplicant(
        applicant_id,
        firstname,
        middlename,
        lastname,
        dateofbirth,
        sex,
        age,
        address,
        class_id,
        admissiondate,
        phoneno
      );
      res.redirect("/admissionlist");
    } catch (error) {
      res.status(500).send("An error occurred!");
    }
  }
);

router.get(
  "/application/delete/:ID",
  Authlib.auth,
  Authlib.requireAny([Authlib.isAdminRequest]),
  async function (req, res) {
    let ID = req.params.ID;
    let applicant = await applicantmanager.find(ID);
    let ApplicantEmail = applicant.email;
    if (applicant == null || applicant == undefined) {
      res.status(404).send("Applicant detail is not found");
    } else {
      await applicantmanager.Remove(ID);
      res.redirect("/listapplicants");
      let email = req.session.email;
      const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      auditLog.insertAuditLog(
        " Applicant Detail deleted",
        `The details of the applicant ${ApplicantEmail} by  ${ip} with email ${email}`,
        email
      );
    }
  }
);

router.get("/admissionlist", Authlib.auth, async function (req, res) {
  try {
    let result = await applicantmanager.listAdmitted();
    res.render("admissionlist", { data: result[0] });
  } catch (error) {
    res.sendStatus(500);
  }
});

export default router;
