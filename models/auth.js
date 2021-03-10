import express from "express";
import session from "express-session";

function auth(req, res, next) {
  if (isAuthenticatedRequest(req)) {
    next();
  } else {
    res.redirect("/users/login");
  }
}
function isAdminRequest(req) {
  return req.session.roles.some((r) => r.title === "Admin");
}

function isAuthenticatedRequest(req) {
  return req.session.isLoggedIn == true;
}
function isAdminorRegistrarRequest(req) {
  return req.session.roles.some(
    (r) => r.title === "Admin" || r.title === "Registrar"
  );
}

function isRegistrarRequest(req) {
  return req.session.roles.some((r) => r.title === "Admin");
}

function requireAny(...conditionFunctions) {
  return function (req, res, next) {
    for (var i in conditionFunctions) {
      const f = conditionFunctions[i];
      const succeeded = f(req);
      if (succeeded) {
        next();
        return;
      }
    }
    res.redirect("/forbidden");
  };
}

function isOfficialRequest(req) {
  return req.session.roles.some(
    (r) =>
      r.title === "Admin" || r.title === "Registrar" || r.title === "Principal"
  );
}

function isProprietorRequest(req) {
  return req.session.roles.some((r) => r.title === "Proprietor");
}

function isPrincipalRequest(req) {
  return req.session.roles.some((r) => r.title === "Principal");
}

export default {
  auth,
  isAdminRequest,
  isProprietorRequest,
  isPrincipalRequest,
  isRegistrarRequest,
  isOfficialRequest,
  isAdminorRegistrarRequest,
  requireAny,
};
