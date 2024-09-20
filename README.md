# API Endpoints for Hotel Booking System

## 1. Create Booking and receive a confirmation
#### Method: POST
URL: https://0e5eglu168.execute-api.eu-north-1.amazonaws.com/bookings

Description: This endpoint allows guests to book rooms at the hotel. It receives details such as the number of guests, room types, check-in and check-out dates, and the guest’s name and email. Upon successful booking, a booking number is generated and returned with the booking confirmation details.

  Business Logic:
  - The hotel has a total of 20 rooms, split into single rooms, double rooms, and suites, each with different capacities and prices.

Request Body Example:
```
json
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
```
Response Example:
```
json
{
    "data": {
        "message": "Booking created successfully!",
        "bookingId": "8090cd5b-f356-4b2b-9192-da892e86be79",
        "guests": 10,
        "totalRooms": 5,
        "roomTypes": {
            "suite": 2,
            "double": 1,
            "single": 2
        },
        "checkIn": "2024-12-27",
        "checkOut": "2026-12-28",
        "guestName": "King Julien",
        "totalCost": 3655000
    }
}
```
## 2. Get All Bookings
#### Method: GET
URL: https://0e5eglu168.execute-api.eu-north-1.amazonaws.com/bookings

Description: This endpoint retrieves all bookings made at the hotel, providing details such as booking ID, number of guests, room types, total cost, check-in and check-out dates, and guest information.

## 3. Update Booking
#### Method: PUT
URL: https://0e5eglu168.execute-api.eu-north-1.amazonaws.com/bookings/{bookingId}

Description: This endpoint updates an existing booking with new details, such as the number of guests, room types, check-in and check-out dates, and guest name. The system recalculates the total cost based on the updated information.
 
Request Body Example:
```
json
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
```
