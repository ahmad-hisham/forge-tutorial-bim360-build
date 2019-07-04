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

  for (var issue of issues) {
    let owner = users.find(user => user.id === issue.owner_id);
    let createdBy = users.find(user => user.id === issue.created_by_id);
    let updatedBy = users.find(user => user.id === issue.updated_by_id);

    issue.owner = (owner === undefined) ? "Not Defined" : owner.name;
    issue.created_by = (createdBy === undefined) ? "Not Defined" : createdBy.name;
    issue.updated_by = (updatedBy === undefined) ? "Not Defined" : updatedBy.name;
  }

  res.render("issues", { issues: issues });
});

module.exports = router;