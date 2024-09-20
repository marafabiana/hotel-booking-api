const { sendResponse, sendError } = require("../../responses");
const { db } = require("../../services/db");

module.exports.handler = async (event) => {
  const { bookingId } = event.pathParameters; // // Gets the bookingId from the URL
  const body = JSON.parse(event.body);
  const { guests, roomTypes, checkIn, checkOut, guestName } = body;

  try {
    // Validate the new check-in and check-out dates
    if (!validateDates(checkIn, checkOut)) {
      return sendError(400, "Invalid check-in or check-out dates.");
    }

    // // Check if the room capacity is sufficient for the number of guests
    if (!validateBooking(guests, roomTypes)) {
      return sendError(400, "Invalid number of guests or room types.");
    }

    // Recalculate the total cost of the booking based on the new data
    const totalCost = calculateCost(roomTypes, checkIn, checkOut);

    // Update the booking in DynamoDB
    const updateExpression =
      "SET guests = :guests, roomTypes = :roomTypes, checkIn = :checkIn, checkOut = :checkOut, guestName = :guestName, totalCost = :totalCost";
    const expressionAttributeValues = {
      ":guests": guests,
      ":roomTypes": roomTypes,
      ":checkIn": checkIn,
      ":checkOut": checkOut,
      ":guestName": guestName,
      ":totalCost": totalCost,
    };

    await db.update({
      TableName: "bookings",
      Key: { bookingId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    // Return a success response with all the booking details
    return sendResponse({
      message: "Booking updated successfully",
      bookingId: bookingId, // Booking number
      guests: guests, // Number of guests
      roomTypes: roomTypes, // Number of rooms
      checkIn: checkIn, // Check-in date
      checkOut: checkOut, // Check-out date
      guestName: guestName, // Guest name
      totalCost: totalCost, // Total amount to pay
    });
  } catch (error) {
    console.error("Error updating the booking:", error);
    return sendError(500, "Error updating the booking.");
  }
};

// Function to validate the check-in and check-out dates
function validateDates(checkIn, checkOut) {
  const today = new Date();
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Check-in cannot be in the past
  if (checkInDate < today) {
    return false;
  }

  // Check-out must be after check-in
  if (checkOutDate <= checkInDate) {
    return false;
  }

  return true;
}

// Function to validate the booking (number of guests and room types)
function validateBooking(guests, roomTypes) {
  const roomTypeCapacity = {
    single: 1, // Capacity of a single room
    double: 2, // Capacity of a double room
    suite: 3, // Capacity of a suite
  };

  // Total guest capacity supported by the selected room types
  let totalCapacity = 0;

  for (const roomType in roomTypes) {
    if (roomTypeCapacity[roomType] === undefined) {
      return false; // Invalid room type
    }
    totalCapacity += roomTypeCapacity[roomType] * roomTypes[roomType];
  }

  // The number of guests must match the total capacity of the rooms
  return totalCapacity >= guests;
}

// Function to calculate the total cost of the booking
function calculateCost(roomTypes, checkIn, checkOut) {
  const roomTypeCost = {
    single: 500, // Cost per night for a single room
    double: 1000, // Cost per night for a double room
    suite: 1500, // Cost per night for a suite
  };

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Calculate the number of nights between check-in and check-out
  const numberOfNights = (checkOutDate - checkInDate) / (1000 * 3600 * 24);

  if (numberOfNights <= 0) {
    throw new Error(
      "Invalid dates. Check-out date must be after check-in date."
    );
  }

  // Calculate the total cost based on the number of rooms and nights
  let totalCost = 0;
  for (const roomType in roomTypes) {
    totalCost += roomTypeCost[roomType] * roomTypes[roomType] * numberOfNights;
  }

  return totalCost;
}
