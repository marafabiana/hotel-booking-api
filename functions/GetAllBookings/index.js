const { sendResponse, sendError } = require('../../responses');
const { db } = require('../../services/db');

module.exports.handler = async (event) => {
  try {
    // Perform a scan on the DynamoDB table to fetch all bookings
    const result = await db.scan({
      TableName: 'bookings',
    });

    // Verifica se existem reservas
    if (!result.Items || result.Items.length === 0) {
      return sendResponse({ message: "No bookings found." });
    }

    // Return the found bookings
    return sendResponse(result.Items);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return sendError(500, "Error fetching bookings.");
  }
};
