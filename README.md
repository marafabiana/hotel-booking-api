API Endpoints for Hotel Booking System

1. Create Booking 
Method: POST
URL: https://0e5eglu168.execute-api.eu-north-1.amazonaws.com/bookings

Description: This API allows guests to book hotel rooms and receive a booking confirmation.
Body Example:
{
  "guests":10,
  "roomTypes": {
    "suite": 2,
    "double": 1,
    "single": 2  
  },
  "checkIn": "2024-12-27",
  "checkOut": "2026-12-28",
  "guestName": "King Julien",
  "email": "king.julien@example.com"
}

2. Get All Bookings
Method: GET
URL: https://0e5eglu168.execute-api.eu-north-1.amazonaws.com/bookings

Description: This API returns all available bookings from the database.

3. Update Booking
Method: PUT
URL: https://0e5eglu168.execute-api.eu-north-1.amazonaws.com/bookings/{bookingId}

Description: This API allows guests to update an existing booking. 
Body Example:
{
  "guests":10,
  "roomTypes": {
    "suite": 2,
    "double": 1,
    "single": 2
  },
  "checkIn": "2024-12-27",
  "checkOut": "2026-12-31",
  "guestName": "King Julien"
}
