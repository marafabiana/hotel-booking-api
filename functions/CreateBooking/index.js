const { v4: uuidv4 } = require("uuid");
const { sendResponse, sendError } = require("../../responses");
const { db } = require("../../services/db");

// Lambda function to create a new booking
module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { guests, roomTypes, checkIn, checkOut, guestName, email } = body;

  try {
    // Validate check-in and check-out dates
    if (!validateDates(checkIn, checkOut)) {
      return sendError(400, "Invalid check-in or check-out dates.");
    }

    // Check if the total number of available rooms is not exceeded
    const totalRoomsRequested = Object.values(roomTypes).reduce(
      (sum, value) => sum + value,
      0
    );
    const totalAvailableRooms = await checkRoomAvailability(checkIn, checkOut);
    if (totalAvailableRooms < totalRoomsRequested) {
      return sendError(
        400,
        "Not enough rooms available for the selected dates."
      );
    }

    // Validate booking based on the number of guests and room types
    if (!validateBooking(guests, roomTypes)) {
      return sendError(400, "Invalid number of guests or room types.");
    }

    // Calculate the total number of rooms to make checking easier
    const totalRooms = totalRoomsRequested;

    // Generate a unique ID for the booking
    const bookingId = uuidv4();

    // Calculate the total cost of the booking
    const totalCost = calculateCost(roomTypes, checkIn, checkOut);

    // Create the booking object with totalRooms included
    const booking = {
      bookingId,
      guests,
      roomTypes,
      checkIn,
      checkOut,
      guestName,
      email,
      totalCost,
      totalRooms,
    };

    // Insert the new booking into DynamoDB
    await db.put({
      TableName: "bookings",
      Item: booking,
    });

    // Return a success response with booking details
    return sendResponse({
      message: "Booking created successfully!",
      bookingId,
      guests,
      totalRooms,
      roomTypes,
      checkIn,
      checkOut,
      guestName,
      totalCost,
    });
  } catch (error) {
    console.error(error);
    return sendError(500, "Error processing the booking.");
  }
};

// Function to validate check-in and check-out dates
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

// Function to check room availability for the requested dates
async function checkRoomAvailability(checkIn, checkOut) {
  const checkInDate = new Date(checkIn).toISOString();
  const checkOutDate = new Date(checkOut).toISOString();

  // It is recommended to use query on larger tables - lower costs, faster performance, scalability, filter efficiency, etc.
  const result = await db.scan({
    TableName: "bookings",
    FilterExpression: "(checkIn <= :checkOut AND checkOut >= :checkIn)",
    ExpressionAttributeValues: {
      ":checkIn": checkInDate,
      ":checkOut": checkOutDate,
    },
  });

  let totalRoomsBooked = 0;
  result.Items.forEach((booking) => {
    const roomCount = Object.values(booking.roomTypes).reduce(
      (sum, value) => sum + value,
      0
    );
    totalRoomsBooked += roomCount;
  });

  const totalAvailableRooms = 20 - totalRoomsBooked;
  return totalAvailableRooms;
}

// Function to validate the booking (number of guests and room types)
function validateBooking(guests, roomTypes) {
  const roomTypeCapacity = {
    single: 1, // Capacity of a single room
    double: 2, // Capacity of a double room
    suite: 3, // Capacity of a suite
  };

  // Total capacity supported by the selected room types
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

  // Calculate the difference in days between check-in and check-out
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
