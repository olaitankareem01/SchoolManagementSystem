import express from "express";
import StudentManager from "../models/student.js";
const router = express.Router();
import Authlib from "../models/auth.js";
const studentmanager = new StudentManager();
import ClassManager from "../models/classes.js";
const classmanager = new ClassManager();
import multer from "multer";
import bodyparser from "body-parser";
import path from "path";
router.use(
  bodyparser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 100000,
  })
);

router.use("/uploads", express.static("./uploads"));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadImg = multer({ storage: storage });

//student registration route
router.get(
  "/registerstudent",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest, Authlib.isRegistrarRequest),
  async function (req, res) {
    let classes = await classmanager.list();
    res.render("studentreg", { layout: "admin", data: classes[0] });
  }
);

router.post(
  "/registerstudent",
  uploadImg.single("profileImageUrl"),
  async function (req, res) {
    let firstname = req.body.firstname;
    let middlename = req.body.middlename;
    let lastname = req.body.lastname;
    let sex = req.body.sex;
    let age = req.body.age;
    let address = req.body.address;
    let profileImageUrl = req.file.path;
    profileImageUrl = profileImageUrl.replace("\\", "\\\\");
    let dateofbirth = req.body.dateofbirth;
    let class_id = req.body.class_id;
    let admissiondate = req.body.admissiondate;
    console.log(admissiondate);
    let phoneno = req.body.phoneno;
    await studentmanager.create(
      firstname,
      middlename,
      lastname,
      dateofbirth,
      sex,
      age,
      address,
      class_id,
      admissiondate,
      phoneno,
      profileImageUrl
    );
    res.redirect("/studentslist");
  }
);
//students list
router.get(
  "/studentslist",
  Authlib.auth,
  Authlib.requireAny(
    Authlib.isAdminRequest,
    Authlib.isRegistrarRequest,
    Authlib.isPrincipalRequest
  ),
  async function (req, res) {
    let result = await studentmanager.list();
    res.render("studentslist", { layout: "admin", data: result });
  }
);

//edit student details
router.get(
  "/students/edit/:ID",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest, Authlib.isRegistrarRequest),
  async function (req, res) {
    let ID = req.params.ID;
    let student = await studentmanager.find(ID);
    if (student == null || student == undefined) {
      res.status(404).send("Student detail is not found");
    } else {
      res.render("Editstudentdetails", student);
    }
  }
);

router.post(
  "/students/edit/:ID",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest, Authlib.isRegistrarRequest),
  async function (req, res) {
    let ID = req.body.ID;
    let firstname = req.body.firstname;
    let middlename = req.body.middlename;
    let lastname = req.body.lastname;
    let sex = req.body.sex;
    let age = req.body.age;
    let address = req.body.address;
    let dateofbirth = req.body.dateofbirth;
    console.log(dateofbirth);
    let class_id = req.body.class_id;
    let admissiondate = req.body.admissiondate;
    console.log(admissiondate);
    let phoneno = req.body.phoneno;
    await studentmanager.update(
      ID,
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
    res.redirect("/studentslist");
  }
);

//delete student details
router.get(
  "/students/delete/:ID",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest),
  async function (req, res, next) {
    let ID = req.params.ID;
    let student = await studentmanager.find(ID);
    if (student == null || student == undefined) {
      res.status(404).send("Student detail is not found");
    } else {
      await studentmanager.Remove(ID);
      res.redirect("/studentslist");
    }
  }
);

//student profile
router.get("/students/profile/:id", async (req, res) => {
  let id = req.params.id;
  let studentInfo = await studentmanager.find(id);
  console.log(studentInfo);
  res.render("studentprofile", studentInfo);
});

export default router;
