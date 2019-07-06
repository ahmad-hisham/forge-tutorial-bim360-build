const forgeSDK = require("forge-apis");
const ForgeOAuth = require("../models/forge-oauth");
const requestPromise = require("request-promise-native");

class ForgeBIM360 {
  constructor(session) {
    this._session = session;
    this._credentials = new ForgeOAuth(this._session);
    this._oauthClient = this._credentials.OAuthClient();
  }

  async getIssues(hubId, projectId) {
    try {
      let tokenInternal = await this._credentials.getTokenInternal();

      const projectsApi = new forgeSDK.ProjectsApi();
      let projectData = await projectsApi.getProject(hubId, projectId, this._oauthClient, tokenInternal);
      
      let issuesContainer = projectData.body.data.relationships.issues.data.id;
      console.log(issuesContainer);

      let basePath = "https://developer.api.autodesk.com";
      let path = "/issues/v1/containers/:container_id/quality-issues".replace(":container_id", issuesContainer);

      const options = {  
        url: basePath + path,
        method: 'GET',
        headers: {
          "Authorization": "Bearer " + tokenInternal.access_token,
          "Content-Type": "application/vnd.api+json"
        }
      };

      let res = await requestPromise(options);
      let issuesData = JSON.parse(res);
      console.log(issuesData);

      let issues = issuesData.data.map(issue => ({
        issue_id: issue.id,
        type: issue.type,
        attachment_count: issue.attributes.attachment_count,
        attachments_attributes: issue.attributes.attachments_attributes,
        close_version: issue.attributes.close_version,
        closed_at: issue.attributes.closed_at,
        closed_by: issue.attributes.closed_by,
        collection_urn: issue.attributes.collection_urn,
        comment_count: issue.attributes.comment_count,
        comments_attributes: issue.attributes.comments_attributes,
        created_at: issue.attributes.created_at,
        created_by: issue.attributes.created_by,
        //custom_attributes: issue.attributes.custom_attributes, // Array(0) []
        assigned_to: issue.attributes.assigned_to,
        assigned_to_type: issue.attributes.assigned_to_type,
        description: issue.attributes.description,
        due_date: issue.attributes.due_date,
        identifier: issue.attributes.identifier,
        issue_sub_type: issue.attributes.issue_sub_type,
        issue_type: issue.attributes.issue_type,
        issue_type_id: issue.attributes.issue_type_id,
        lbs_location: issue.attributes.lbs_location,
        location_description: issue.attributes.location_description,
        markup_metadata: issue.attributes.markup_metadata,
        ng_issue_subtype_id: issue.attributes.ng_issue_subtype_id,
        ng_issue_type_id: issue.attributes.ng_issue_type_id,
        opened_at: issue.attributes.opened_at,
        opened_by: issue.attributes.opened_by,
        owner: issue.attributes.owner,
        //permitted_actions: issue.attributes.permitted_actions, //array
        //permitted_attributes: issue.attributes.permitted_attributes, //array
        //permitted_statuses: issue.attributes.permitted_statuses, //array
        //pushpin_attributes: //Object {type: "TwoDVectorPushpin", location: Object, object_id: "5695", …}
        quality_urns: issue.attributes.quality_urns,
        resource_urns: issue.attributes.resource_urns,
        root_cause: issue.attributes.root_cause,
        root_cause_id: issue.attributes.root_cause_id,
        //sheet_metadata: //Object {is3D: true, sheetGuid: "e7da92eb-dfa8-dde1-3add-fcd696f84e1f", sheetName: "{3D}"}
        starting_version: issue.attributes.starting_version,
        status: issue.attributes.status,
        synced_at: issue.attributes.synced_at,
        tags: issue.attributes.tags,
        target_urn: issue.attributes.target_urn,
        target_urn_page: issue.attributes.target_urn_page,
        title: issue.attributes.title,
        trades: issue.attributes.trades,
        updated_at: issue.attributes.updated_at,
        updated_by: issue.attributes.updated_by
      }));
      return issues;

    } catch (error) {
      console.log(error);
    }
  }

  async getUsers(hubId, projectId) {
    try {
      let tokenAccount = await this._credentials.getTokenAccount();

      let accountUsersId = hubId.replace("b.", "");
      //let projectUsersId = projectId.replace("b.", ""); // use this id for project-level users list

      let basePath = "https://developer.api.autodesk.com";
      let path = "/hq/v1/accounts/:account_id/users".replace(":account_id", accountUsersId);
      //let path = "/dm/v2/projects/:project_id/users".replace(":project_id", projectUsersId); // use this path for project-level users list
      let queryString = "limit=100";

      const options = {  
        url: basePath + path + ((queryString) ? "?" + queryString : ""),
        method: 'GET',
        headers: {
          "Authorization": "Bearer " + tokenAccount.access_token,
          "Content-Type": "application/vnd.api+json"
        }
      };

      let res = await requestPromise(options);
      let usersData = JSON.parse(res);
      console.log(usersData);

      let users = usersData.map(user => ({ // use usersData.results.map for project-level users list
        id: user.uid,  // use user.oxygenId for project-level users list
        name: user.name,
        nickname: user.nickname
      }));
      return users;

    } catch (error) {
      console.log(error);
    }
  }

  mergeUsersInIssues(issues, users) {
    for (var issue of issues) {
      issue.owner_id = issue.owner;
      issue.created_by_id = issue.created_by;
      issue.assigned_to_id = issue.assigned_to;
      issue.updated_by_id = issue.updated_by;

      let owner = users.find(user => user.id === issue.owner_id);
      let createdBy = users.find(user => user.id === issue.created_by_id);
      let assignedTo = users.find(user => user.id === issue.assigned_to_id);
      let updatedBy = users.find(user => user.id === issue.updated_by_id);

      issue.owner = (owner === undefined) ? "Not Defined" : owner.name;
      issue.created_by = (createdBy === undefined) ? "Not Defined" : createdBy.name;
      issue.assigned_to = (assignedTo === undefined) ? "Not Defined" : assignedTo.name;
      issue.updated_by = (updatedBy === undefined) ? "Not Defined" : updatedBy.name;
    }

  return issues;
  }

  async getLocations(hubId, projectId) {
    try {
      let tokenInternal = await this._credentials.getTokenInternal();

      const projectsApi = new forgeSDK.ProjectsApi();
      let projectData = await projectsApi.getProject(hubId, projectId, this._oauthClient, tokenInternal);

      let locationsContainer = projectData.body.data.relationships.locations.data.id;
      console.log(locationsContainer);

      let basePath = "https://developer.api.autodesk.com";
      let path = "/bim360/locations/v2/containers/:container_id/trees/:tree_id/nodes"
        .replace(":container_id", locationsContainer)
        .replace(":tree_id", "default");

      const options = {  
        url: basePath + path,
        method: 'GET',
        headers: {
          "Authorization": "Bearer " + tokenInternal.access_token,
          "Content-Type": "application/vnd.api+json"
        }
      };

      let res = await requestPromise(options);
      let locationsData = JSON.parse(res);
      console.log(locationsData);

      let locations = locationsData.results.map(location => ({
        id: location.id,
        parent_id: location.parentId,
        type: location.type,
        name: location.name,
        order: location.order
      }));

      return locations;

    } catch (error) {
      console.log(error);
    }
  }

  mergeLocationsInIssues(issues, locations) {
    for (var issue of issues) {
      issue.lbs_location_ids = [issue.lbs_location];

      console.log(issue.lbs_location_ids[0]);
      let location = locations.find(location => location.id === issue.lbs_location_ids[0]);
  
      if (location === undefined) continue;
      let location_full_name = location.name;

      let currentLocation = location;
      while (currentLocation.parent_id) {
        console.log(currentLocation.name);
        let parentlocation = locations.find(parentlocation => parentlocation.id === currentLocation.parent_id);
        if (parentlocation.type == "Root") break;
  
        issue.lbs_location_ids.push(parentlocation.id);
        location_full_name = parentlocation.name + " > " + location_full_name;
        currentLocation = parentlocation;
      }
  
      issue.lbs_location =  location_full_name;
    }

    return issues;
  }
}

module.exports = ForgeBIM360;