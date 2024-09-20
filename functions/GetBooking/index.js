const { sendResponse, sendError } = require('../../responses');
const { db } = require('../../services/db');

module.exports.handler = async (event) => {
  const { bookingId } = event.pathParameters;  // Gets the bookingId from the URL

  try {
    // Makes a request to DynamoDB to fetch the booking with the provided bookingId
    const result = await db.get({
      TableName: 'bookings',
      Key: { bookingId },  // Partition key: bookingId
    });

    // Checks if the booking exists
    if (!result.Item) {
      return sendError(404, "Booking not found.");
    }

    // Returns the found booking
    return sendResponse(result.Item);
  } catch (error) {
    console.error("Error fetching the booking:", error);
    return sendError(500, "Error fetching the booking.");
  }
};
