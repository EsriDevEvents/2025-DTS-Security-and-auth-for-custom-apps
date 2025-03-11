import { createApiKey } from "@esri/arcgis-rest-developer-credentials"
import { ArcGISIdentityManager } from "@esri/arcgis-rest-request"
import { moveItem, getSelf } from "@esri/arcgis-rest-portal"

// log in
const authSession = await ArcGISIdentityManager.signIn({
  username: process.env.ARCGIS_USERNAME,
  password: process.env.ARCGIS_PASSWORD,
})

const orgUrl = await getSelf({ authentication: authSession })
console.log(orgUrl.urlKey)

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
    "premium:user:networkanalysis",
    "premium:user:spatialanalysis",
    "premium:user:geocode",
  ],
  generateToken1: true,
  apiToken1ExpirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
  authentication: authSession,
})
console.log(`new API Key developer credential created ${newKey.itemId}`)

// move item into a folder
const moved = await moveItem({
  itemId: newKey.itemId,
  folderId: "56e18f1d314d477a89fc81fc43547abc",
  authentication: authSession,
})
console.log(`\nItem moved ${JSON.stringify(moved)}`)

console.log(
  `\nDeveloper credential created successfully\nView item\nhttps://${orgUrl.urlKey}.maps.arcgis.com/home/item.html?id=${newKey.itemId}&token=${authSession.token}`
)
