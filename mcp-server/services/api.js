import config from "../config/index.js";

/**
 * Fetch server details from the API
 * @param {string} serverId - Server ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Server details
 */
export async function fetchServerDetails(serverId, token) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/mcp-server/get/${serverId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ''
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch server details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching server details:", error);
    throw error;
  }
}

/**
 * Fetch tool listings from the API
 * @param {string} serverId - Server ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Tool listings
 */
export async function fetchToolListings(serverId, token) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/mcp-server/tool/list/${serverId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ''
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tool listings: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching tool listings:", error);
    throw error;
  }
}

/**
 * Execute a tool via the API
 * @param {string} serverId - Server ID
 * @param {string} toolId - Tool ID
 * @param {Object} args - Tool arguments
 * @param {string} token - Authentication token
 * @returns {Promise<string>} Tool execution result
 */
export async function executeTool(serverId, toolId, args, token) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/${serverId}/execute/tool/${toolId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(args)
    });
    
    const responseText = await response.text();
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      // If not JSON, return the raw text
      return responseText;
    }
  } catch (error) {
    console.error(`Error executing tool ${toolId}:`, error);
    throw error;
  }
}