import express from "express";
import RoleManager from "../models/roles.js";
const router = express.Router();
const rolemanager = new RoleManager();
import AuditLog from "../models/auditlog.js";
const auditLog = new AuditLog();
import ContactManager from "../models/contact.js";
const contactmanager = new ContactManager();
import Authlib from "../models/auth.js";

router.get("/contact/create", (req, res) => {
  res.render("contactform");
});

router.post("/contact/create", async (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let message = req.body.message;
  contactmanager.create(name, email, message);
  res.redirect("/");
});

router.get(
  "/contact/list",
  Authlib.auth,
  Authlib.requireAny(Authlib.isOfficialRequest),
  async (req, res) => {
    let contacts = await contactmanager.list();
    res.render("contactlist", { layout: "admin", data: contacts[0] });
  }
);

router.get(
  "/contact/delete/:ID",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest),
  async function (req, res) {
    let ID = req.params.ID;
    await contactmanager.Remove(ID);
    res.redirect("/contact/list");
  }
);

export default router;
