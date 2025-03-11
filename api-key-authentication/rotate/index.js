import "dotenv/config"
import { readFile, writeFile } from "node:fs/promises"
import { ApiKeyManager } from "@esri/arcgis-rest-request"
import {
  updateApiKey,
  slotForKey,
  invalidateApiKey,
} from "@esri/arcgis-rest-developer-credentials"
/**
 * Get environment variables from the .env file. Loading this file is handled by the dotenv package.
 */
const { ADMIN_API_KEY, USERNAME, ITEM_ID } = process.env
/**
 * Read the current API key from the app-config.json file.
 */
const currentConfig = await readFile(
  "./api-key-authentication/rotate/app-config.json",
  "utf-8"
).then((content) => JSON.parse(content))
const currentApiKey = currentConfig.apiKey
/**
 * Determine which API key slot is currently in use.
 */
const apiKeySlot = slotForKey(currentApiKey)
/**
 * Create our authentication manager object.
 */
const authentication = ApiKeyManager.fromKey({
  key: ADMIN_API_KEY,
  username: USERNAME,
})
/**
 * Get the date three days from now. The API will round this to expire the end of this day in UTC.
 */
const THREE_DAYS = new Date()
THREE_DAYS.setDate(THREE_DAYS.getDate() + 3)
THREE_DAYS.setHours(23, 59, 59, 999)
/**
 * Update the API key in the specified slot.
 */
const result = await updateApiKey({
  itemId: ITEM_ID,
  authentication,
  generateToken1: apiKeySlot === 2,
  generateToken2: apiKeySlot === 1,
  apiToken1ExpirationDate: apiKeySlot === 2 ? THREE_DAYS : undefined,
  apiToken2ExpirationDate: apiKeySlot === 1 ? THREE_DAYS : undefined,
})
/**
 * Update the API key in the app-config.json file.
 */
const newApiKey = apiKeySlot === 2 ? result.accessToken1 : result.accessToken2
currentConfig.apiKey = newApiKey
writeFile(
  "./api-key-authentication/rotate/app-config.json",
  JSON.stringify(currentConfig, null, 2)
)
console.log(`new key in slot ${apiKeySlot === 1 ? 2 : 1} created ${newApiKey}`)
/**
 * Invalidate the old API key.
 */
const invalidateResponse = await invalidateApiKey({
  itemId: ITEM_ID,
  authentication,
  apiKey: currentApiKey,
})
console.log(`old key in slot ${apiKeySlot} invalidated`)
