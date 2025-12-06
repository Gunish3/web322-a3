// server.js
const express = require("express");
const path = require("path");
require("dotenv").config();           
const app = express();

const clientSessions = require("client-sessions"); 

/*********************************************************************************
*  WEB322 – Assignment 03
*
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
*  Name: Gunish Sharma      Student ID: 121393235      Date: December 5, 2025
*
*  Published URL: (add your Vercel URL here once deployed)
*
*********************************************************************************/

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// static folder
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  clientSessions({
    cookieName: "session",
    secret: process.env.SESSIONSECRET,
    duration: 2 * 60 * 60 * 1000,      // 2 hours
    activeDuration: 5 * 60 * 1000      // extend by 5 min on each request
  })
);
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}


// data / service module
const projectService = require("./modules/projects");

// routes
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/solutions/projects", async (req, res) => {
  const { sector } = req.query;

  try {
    const projects = sector
      ? await projectService.getProjectsBySector(sector)
      : await projectService.getAllProjects();

    res.render("projects", { projects });
  } catch (e) {
    res.status(404).render("404", { message: String(e) });
  }
});

app.get("/solutions/projects/:id", async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.render("project", { project });
  } catch (e) {
    res.status(404).render("404", { message: String(e) });
  }
});

// ADD PROJECT
app.get("/solutions/addProject", ensureLogin, async (req, res) => {
  try {
    const sectors = await projectService.getAllSectors();
    res.render("addProject", { sectors });
  } catch (e) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${e}`
    });
  }
});

app.post("/solutions/addProject", ensureLogin, async (req, res) => {
  try {
    await projectService.addProject(req.body);
    res.redirect("/solutions/projects");
  } catch (e) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${e}`
    });
  }
});

// EDIT PROJECT

// GET: Edit Project form
app.get("/solutions/editProject/:id", ensureLogin, async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.render("editProject", { project });
  } catch (err) {
    res.status(404).render("404", { message: String(err) });
  }
});

// POST: Handle edit form submit
app.post("/solutions/editProject", ensureLogin, async (req, res) => {
  try {
    await projectService.editProject(req.body.id, req.body);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});
// DELETE PROJECT (via GET route)
app.get("/solutions/deleteProject/:id", ensureLogin, async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});
// LOGIN ROUTES

// GET /login
app.get("/login", (req, res) => {
  res.render("login", {
    errorMessage: "",
    userName: ""
  });
});

// POST /login
app.post("/login", (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;

  if (
    userName === process.env.ADMINUSER &&
    password === process.env.ADMINPASSWORD
  ) {
    req.session.user = {
      userName: process.env.ADMINUSER
    };
    res.redirect("/solutions/projects");
  } else {
    res.render("login", {
      errorMessage: "Invalid username or password",
      userName
    });
  }
});

// GET /logout
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});


// 404 handler (must be last route)
app.use((req, res) => {
  res.status(404).render("404", { message: "Page not found" });
});

// start server only after DB is initialized
const HTTP_PORT = process.env.PORT || 8080;

projectService
  .initialize()
  .then(() => {
    console.log("✅ Database synced");

    // when running locally, start listening
    if (!process.env.VERCEL) {
      app.listen(HTTP_PORT, () => {
        console.log(`Server is listening on port ${HTTP_PORT}`);
      });
    }
  })
  .catch((err) => {
    console.log("❌ Unable to start server:", err);
  });

// export app for Vercel
module.exports = app;
