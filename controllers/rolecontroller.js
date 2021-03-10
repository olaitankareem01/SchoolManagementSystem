import express from "express";
import RoleManager from "../models/roles.js";
const router = express.Router();
const rolemanager = new RoleManager();
import AuditLog from "../models/auditlog.js";
const auditLog = new AuditLog();
import Authlib from "../models/auth.js";

router.get(
  "/roles/create",
  Authlib.auth,
  Authlib.requireAny([Authlib.isAdminRequest]),
  (req, res) => {
    res.render("Addrole", { layout: "admin" });
  }
);

router.post(
  "/roles/create",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest),
  async (req, res) => {
    let title = req.body.title;
    await rolemanager.create(title);
    let email = req.session.email;
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    auditLog.insertAuditLog(
      "New Role Added ",
      `A new role was added to the role list by ${ip} with email ${email}`,
      email
    );
    res.redirect("/roles/list");
  }
);

router.get(
  "/roles/list",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest),
  async (req, res) => {
    let roles = await rolemanager.list();
    res.render("rolelist", { layout: "admin", data: roles[0] });
  }
);

router.get(
  "/roles/edit/:ID",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest),
  async function (req, res) {
    let ID = req.params.ID;
    let result = await rolemanager.find(ID);
    res.render("Editrole", result);
  }
);

router.post(
  "/roles/edit",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest),
  async function (req, res) {
    let ID = req.body.ID;
    let title = req.body.title;
    await rolemanager.update(ID, title);
    let email = req.session.email;
    try {
      const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      auditLog.insertAuditLog(
        " Role modified ",
        `A role was modified in the role list by ${ip} with email ${email}`,
        email
      );
    } catch (error) {
      res.sendStatus(500);
    }

    res.redirect("/roles/list");
  }
);

router.get(
  "/roles/delete/:ID",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest),
  async function (req, res) {
    let ID = req.params.ID;
    let result = await rolemanager.Remove(ID);
    let email = req.session.email;
    try {
      const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      auditLog.insertAuditLog(
        " Role deleted ",
        `A role was deleted from the role list by ${ip} with email ${email}`,
        email
      );
    } catch (error) {
      res.sendStatus(500);
    }

    res.redirect("/roles/list");
  }
);

export default router;
