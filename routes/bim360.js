const express = require("express");
let router = express.Router();

const ForgeBIM360 = require("../models/forge-bim360");

router.get("/hub/:hub_id/project/:project_id/issues", async function (req, res) {
  let hubId = req.params.hub_id;
  let projectId = req.params.project_id;

  const bim360 = new ForgeBIM360(req.session);
  let issues = await bim360.getIssues(hubId, projectId);
  console.log(issues);

  let users = await bim360.getUsers(hubId, projectId);
  console.log(users);

  issues = bim360.mergeUsersInIssues(issues,users);
  console.log(issues);

  res.render("issues", { issues: issues });
});

module.exports = router;