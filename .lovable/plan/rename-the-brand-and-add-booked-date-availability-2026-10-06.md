# Rename the brand and add booked-date availability

## What will change

- Replace every visible “Y3fr3 Wo” reference with the exact new name, “Yɛɛ Kɔ,” including navigation, footer, page titles, descriptions, sign-in, and vendor application copy.
- Add a public availability lookup that exposes only fully booked dates, never customer or booking details.
- Treat confirmed, deposit-paid, and fully paid bookings as inventory reservations. Pending requests will remain non-blocking.
- Account for listings with multiple units: a date becomes unavailable only when confirmed or paid bookings reserve the full quantity.
- Show unavailable dates beside the booking form, warn immediately when a selected range overlaps them, and prevent that request from being submitted.
- Enforce the same availability rule in the database when an admin confirms a booking, preventing simultaneous confirmations from overbooking inventory.

## Technical details

- Add a database function returning fully reserved dates for one published listing.
- Add confirmation-time database validation with row locking so concurrent admin actions cannot oversell the same dates.
- Keep the existing database-owned quote and booking-request flow; pending requests may overlap by design.
- Update targeted tests for date overlap, quantity capacity, and pending-versus-confirmed behavior.
- Verify the listing flow and renamed pages in both light and dark themes, including mobile layout.
