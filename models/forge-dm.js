const forgeSDK = require("forge-apis");
const ForgeOAuth = require("../models/forge-oauth");

class ForgeDataManagement {
  constructor(session) {
    this._session = session;
    this._credentials = new ForgeOAuth(this._session);
    this._oauthClient = this._credentials.OAuthClient();
  }

  async getHubs() {
    try {
      let tokenInternal = await this._credentials.getTokenInternal();

      const hubsApi = new forgeSDK.HubsApi();
      let data = await hubsApi.getHubs({}, this._oauthClient, tokenInternal);
      console.log(data.body.data);

      let hubs = data.body.data.map(hub => ({
        hub_id: hub.id,
        href: hub.links.self.href,
        name: hub.attributes.name,
        type: hub.attributes.extension.type
      }));
      return hubs;

    } catch (error) {
      console.log(error);
    }
  }

  async getProjects(hubId) {
    try {
      let tokenInternal = await this._credentials.getTokenInternal();

      const projectsApi = new forgeSDK.ProjectsApi();
      let data = await projectsApi.getHubProjects(hubId, {}, this._oauthClient, tokenInternal);
      console.log(data.body.data);

      let projects = data.body.data.map(project => ({
        project_id: project.id,
        hub_id: hubId,
        href: project.links.self.href,
        name: project.attributes.name,
        type: project.attributes.extension.type
      }));
      return projects;

    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = ForgeDataManagement;