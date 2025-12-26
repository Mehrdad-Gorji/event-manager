const fetch = require('node-fetch'); // Assuming node-fetch is available or using native fetch in Node 18+

async function testBooking() {
    const eventId = 'cmjiu571q00019iarz4l6tw84';
    const url = 'http://localhost:3000/api/bookings';

    const payload = {
        eventId: eventId,
        guestName: "Debug User",
        guestEmail: "debug@example.com",
        guestPhone: "1234567890",
        adultCount: 0,
        childCount: 0,
        vipCount: 0,
        items: [
            // Need a valid TicketTier ID. I'll have to fetch the event first to get it.
        ]
    };

    try {
        // 1. Fetch Event to get Tier IDs
        console.log("Fetching event...");
        const eventRes = await fetch(`http://localhost:3000/api/events/${eventId}`);
        if (!eventRes.ok) {
            throw new Error(`Failed to fetch event: ${eventRes.status} ${eventRes.statusText}`);
        }
        const eventData = await eventRes.json();
        console.log("Event fetched:", eventData.title);

        // Find VIP or Adult tier
        const vipTier = eventData.ticketTiers.find(t => t.name.toLowerCase().includes('vip'));
        if (!vipTier) throw new Error("VIP Tier not found");

        console.log(`Found VIP Tier: ${vipTier.id} - ${vipTier.name}`);

        // Update Payload
        payload.items.push({
            ticketTierId: vipTier.id,
            quantity: 1
        });

        // 2. Send Booking Request
        console.log("Sending booking request...", JSON.stringify(payload, null, 2));
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const status = res.status;
        const text = await res.text();

        console.log(`response status: ${status}`);
        console.log(`response body: ${text}`);

    } catch (error) {
        console.error("Error:", error);
    }
}

testBooking();
