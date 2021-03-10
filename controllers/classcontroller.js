import express from "express";
import ClassManager from "../models/classes.js";
import { Class } from "../models/classes.js";
import Authlib from "../models/auth.js";
const router = express.Router();
const classmanager = new ClassManager();
import ClassCategoryManager from "../models/class-category.js";
const classcategoryManager = new ClassCategoryManager();

router.get(
  "/createclass",
  Authlib.auth,
  Authlib.requireAny([Authlib.isAdminorProprietorRequest]),
  async function (req, res) {
    try {
      let result = await classcategoryManager.getcategorynames();
      res.render("createclass", { layout: "admin", data: result });
    } catch (error) {
      res.sendStatus(500);
    }
  }
);

router.post(
  "/createclass",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest, Authlib.isProprietorRequest),
  async function (req, res) {
    let classname = req.body.class_name;
    let categoryname = req.body.categoryname;
    try {
      let result = await classcategoryManager.getCategoryId(categoryname);
      let class_category_id = result.ID;
      await classmanager.create(classname, class_category_id);
    } catch (error) {
      res.sendStatus(500);
    }
    res.redirect("/classlist");
  }
);

router.get("/classes/:id", async (req, res) => {
  let categoryId = req.params.id;

  if (!categoryId) {
    return [];
  }
  let classes = await classmanager.listByCategoryId(categoryId);
  let data = classes.map(
    (item) => new Class(item.ID, item.class_name, item.class_category_id)
  );
  res.set("Content-Type", "application/json");
  res.status(200).send(data);
});

router.get(
  "/classlist",
  Authlib.auth,
  Authlib.requireAny(Authlib.isOfficialRequest),
  async function (req, res) {
    let result = await classmanager.list();
    res.render("classlist", { layout: "admin", data: result[0] });
  }
);

router.get(
  "/class/edit/:ID",
  Authlib.auth,
  Authlib.requireAny(Authlib.isAdminRequest, Authlib.isProprietorRequest),
  async function (req, res) {
    let ID = req.params.ID;
    let result = await classmanager.find(ID);
    console.log(result);
    res.render("editclass", result);
  }
);

router.post(
  "/class/edit",
  Authlib.auth,
  Authlib.requireAny([Authlib.isAdminorProprietorRequest]),
  async function (req, res) {
    let ID = req.body.ID;
    let classname = req.body.class_name;
    let classcategory = req.body.class_category_id;
    await classmanager.update(ID, classname, classcategory);
    res.redirect("/classlist");
  }
);

router.get(
  "/class/delete/:ID",
  Authlib.auth,
  Authlib.requireAny([Authlib.isAdminorProprietorRequest]),
  async function (req, res) {
    let ID = req.params.ID;
    await classmanager.Remove(ID);
    res.redirect("/classlist");
  }
);

export default router;
