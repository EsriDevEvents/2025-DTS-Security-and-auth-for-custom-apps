import { createApiKey } from "@esri/arcgis-rest-developer-credentials"
import { ArcGISIdentityManager } from "@esri/arcgis-rest-request"
import { moveItem, getSelf } from "@esri/arcgis-rest-portal"

// log in
const authSession = await ArcGISIdentityManager.signIn({
  username: process.env.ARCGIS_USERNAME,
  password: process.env.ARCGIS_PASSWORD,
})

// Get the portal information, we'll need this later
const orgUrl = await getSelf({ authentication: authSession })

// create the developer credential
const newKey = await createApiKey({
  title: `DTS2025 - Programmatically generated API Key ${Math.floor(
    Date.now() / 1000
  )}`,
  description: "API Key generated with ArcGIS REST JS",
  tags: [
    "developer",
    "technology",
    "summit",
    "2025",
    "api",
    "key",
    "authentication",
  ],
  privileges: [
    // https://developers.arcgis.com/documentation/security-and-authentication/reference/privileges/#list-of-privileges
    "premium:user:networkanalysis",
    "premium:user:spatialanalysis",
    "premium:user:geocode",
  ],
  generateToken1: true,
  apiToken1ExpirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
  authentication: authSession,
})
console.log(`\nNew API Key developer credential created ${newKey.itemId}`)

// move item into a folder
const moved = await moveItem({
  itemId: newKey.itemId,
  folderId: "56e18f1d314d477a89fc81fc43547abc",
  authentication: authSession,
})

console.log(`\nItem moved ${JSON.stringify(moved)}`)

console.log(
  `\nView item\nhttps://${orgUrl.urlKey}.maps.arcgis.com/home/item.html?id=${newKey.itemId}`
)
