const forgeSDK = require("forge-apis");
const ForgeOAuth = require("../models/forge-oauth");
const request = require("request");
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
      let data = await projectsApi.getProject(hubId, projectId, this._oauthClient, tokenInternal);
      
      let issuesContainer = data.body.data.relationships.issues.data.id;
      console.log(issuesContainer);

      let basePath = "https://developer.api.autodesk.com";
      let path = "/issues/v1/containers/:project_id/quality-issues".replace(":project_id", issuesContainer);

      const options = {  
        url: basePath + path,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + tokenInternal.access_token,
            'Content-Type': "application/vnd.api+json"
        }
      };

      let res = await requestPromise(options);
      let issuesData = JSON.parse(res);
      console.log(issuesData.data);

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
}

module.exports = ForgeBIM360;