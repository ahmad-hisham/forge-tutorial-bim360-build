const express = require("express");
let router = express.Router();

const ForgeDataManagement = require("../models/forge-dm");

router.get("/hubs", async function (req, res) {
  const dm = new ForgeDataManagement(req.session);
  let hubs = await dm.getHubs();

  console.log(hubs);
  res.render("hubs", { hubs: hubs });
});

router.get("/hub/:hub_id/projects", async function (req, res) {
  let hubId = req.params.hub_id;

  const dm = new ForgeDataManagement(req.session);
  let projects = await dm.getProjects(hubId);

  console.log(projects);
  res.render("projects", { projects: projects });
});

module.exports = router;