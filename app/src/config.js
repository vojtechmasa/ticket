const cloudConfigClient = require("cloud-config-client");

module.exports = createConfig()

async function createConfig() {
  const config = await cloudConfigClient.load({
    endpoint: "http://config:8080",
    name: "ticket",
    label: process.env.CONFIG_GIT_REF
  })
  return config.toObject()
}