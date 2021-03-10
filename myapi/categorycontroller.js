import express from "express";
import ClassCategoryManager from "../models/class-category.js";
import { Category } from "../models/class-category.js";
import Authlib from "../models/auth.js";

const router = express.Router();
const classcategoryManager = new ClassCategoryManager();

router.get("/", async function (req, res) {
  let categories = await classcategoryManager.list();
  let data = categories.map(
    (category) => new Category(category.ID, category.name)
  );
  res.set("Content-Type", "application/json");
  res.status(200).send(data);
});

//create category
router.get(
  "/create",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest, Authlib.isProprietorRequest),
  async function (req, res) {
    res.render("createcategory", { layout: "admin" });
  }
);

router.post(
  "/create",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest, Authlib.isProprietorRequest),
  async function (req, res) {
    let name = req.body.name;
    await classcategoryManager.create(name);
  }
);
//list categories
router.get(
  "/list",
  Authlib.auth,
  Authlib.requireAny(Authlib.isOfficialRequest),
  async function (req, res) {
    let categories = await classcategoryManager.list();
    res.render("categorylist", { layout: "admin", data: categories });
  }
);

//edit category
router.get(
  "/edit/:ID",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest, Authlib.isProprietorRequest),
  async function (req, res) {
    let ID = req.params.ID;
    let result = await classcategoryManager.find(ID);
    console.log(result[0]);
    res.render("editcategory", { layout: "admin", data: result });
  }
);

router.post(
  "/edit",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest, Authlib.isProprietorRequest),
  async function (req, res) {
    let ID = req.body.ID;
    let name = req.body.name;
    await classcategoryManager.update(ID, name);
    res.redirect("/categories/list");
  }
);
//delete category
router.get(
  "/delete/:ID",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest, Authlib.isProprietorRequest),
  async function (req, res) {
    let ID = req.params.ID;
    await classcategoryManager.Remove(ID);
    res.redirect("/categories/list");
  }
);

export default router;
