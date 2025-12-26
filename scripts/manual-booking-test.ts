
// Use global fetch (Node 18+)
async function testBooking() {
    const eventId = 'cmjiu571q00019iarz4l6tw84';
    const baseUrl = 'http://localhost:3000';

    console.log(`[TEST] Starting booking test for Event ID: ${eventId}`);

    try {
        // 1. Fetch Event
        console.log(`[TEST] Fetching event details from ${baseUrl}/api/events/${eventId}...`);
        const eventRes = await fetch(`${baseUrl}/api/events/${eventId}`);

        console.log(`[TEST] Event Fetch Status: ${eventRes.status}`);
        if (!eventRes.ok) {
            const errText = await eventRes.text();
            throw new Error(`Failed to fetch event: ${eventRes.status} ${errText}`);
        }

        const eventData = await eventRes.json();
        console.log(`[TEST] Event Found: "${eventData.title}"`);

        // 2. Find Ticket Tier
        const tiers = eventData.ticketTiers || [];
        console.log(`[TEST] Found ${tiers.length} ticket tiers.`);

        if (tiers.length === 0) {
            throw new Error("No ticket tiers found on this event.");
        }

        const targetTier = tiers[0];
        console.log(`[TEST] Selected Tier: ${targetTier.name} (ID: ${targetTier.id}, Price: ${targetTier.price})`);

        // 3. Prepare Payload
        const payload = {
            eventId: eventId,
            guestName: "Debug User",
            guestEmail: "debug@example.com",
            guestPhone: "1234567890",
            adultCount: 0,
            childCount: 0,
            vipCount: 0,
            items: [
                {
                    ticketTierId: targetTier.id,
                    quantity: 1
                }
            ]
        };

        console.log("[TEST] Payload prepared:", JSON.stringify(payload, null, 2));

        // 4. Send Booking POST
        console.log(`[TEST] Sending POST request to ${baseUrl}/api/bookings...`);
        const bookingRes = await fetch(`${baseUrl}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`[TEST] Booking Response Status: ${bookingRes.status}`);
        const bookingText = await bookingRes.text();
        console.log(`[TEST] Booking Response Body: ${bookingText}`);

    } catch (error) {
        console.error("[TEST] ERROR:", error);
    }
}

testBooking();
