const api = require('poeditor-cli/api.js');

const projectId = 292233;
const apiToken = process.env.POEDITOR_TOKEN;
(async () => {
  const projectLanguages = await api.getProjectLanguages(apiToken, projectId);
  console.log(projectLanguages)

  api.apiRequest()
}) ()
