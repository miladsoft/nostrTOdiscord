const WebSocket = require('ws');
const fetch = require('node-fetch');
require('dotenv').config();

// Configuration from environment variables
const relay = process.env.RELAY_URL;
const pubkey = process.env.PUBKEY;
const eventTypes = process.env.EVENT_TYPES.split(',').map(Number);
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Helper function to map event types
function getEventTypeText(kind) {
    switch (kind) {
        case 0: return 'Metadata';
        case 1: return 'Text Note';
        case 3: return 'Contacts';
        case 7: return 'Reaction';
        default: return 'Unknown';
    }
}

// Function to log messages
function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

// Function to send events to Discord
async function sendToDiscord(event, eventTypeText, timestamp) {
    // Get appropriate color based on event type
    const eventColors = {
        0: 16776960, // Yellow for Metadata
        1: 3447003,  // Blue for Text Note
        3: 10181046, // Purple for Contacts
        7: 15105570, // Orange for Reaction
        default: 7506394 // Gray for unknown
    };
    
    const color = eventColors[event.kind] || eventColors.default;
    
    // Create client links
    const primalLink = `https://primal.net/e/${event.id}`;
    const nostrAtLink = `https://nostr.at/${event.id}`;
    
    // Format content - show full if under 250 chars, otherwise truncate with link
    let displayContent = event.content;
    if (displayContent.length > 250) {
        displayContent = displayContent.substring(0, 250) + '... *(see full note in client links below)*';
    }
    
    // Get tags as an array if they exist
    const tags = event.tags ? event.tags.map(tag => `\`${tag.join(' ')}\``).join(', ') : 'None';
    
    const discordMessage = {
        embeds: [{
            title: `📣 New Nostr Event: ${eventTypeText} (Kind: ${event.kind})`,
            description: displayContent,
            color: color,
            fields: [
                {
                    name: "🆔 Event ID",
                    value: `\`${event.id.substring(0, 15)}...\``,
                    inline: true
                },
                {
                    name: "👤 Author",
                    value: `\`${event.pubkey.substring(0, 15)}...\``,
                    inline: true
                },
                {
                    name: "🕰️ Created At",
                    value: timestamp,
                    inline: true
                },
                {
                    name: "🏷️ Tags",
                    value: tags.length > 0 ? tags : "None",
                    inline: false
                },
                {
                    name: "🔗 View in Nostr Clients",
                    value: `[Primal](${primalLink}) | [nostr.at](${nostrAtLink})`,
                    inline: false
                }
            ],
            footer: {
                text: "Nostr Event Subscriber"
            },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discordMessage)
        });

        if (!response.ok) {
            throw new Error(`Discord webhook error: ${response.status} ${response.statusText}`);
        }
        log('Event sent to Discord ✅');
    } catch (error) {
        log(`Error sending to Discord: ${error.message}`);
    }
}

// Function to connect to the WebSocket
function connectToRelay() {
    log(`Connecting to relay: ${relay}`);
    
    const socket = new WebSocket(relay);
    
    socket.on('open', () => {
        log('Connected to relay 🟢');
        
        // Subscribe to the specified event types
        const subscriptionId = 'my-subscription-' + Math.random().toString(36).substring(2, 15);
        
        // Get current timestamp to only receive events from now on
        const currentTimestamp = Math.floor(Date.now() / 1000);
        
        const subscriptionMessage = [
            "REQ",
            subscriptionId,
            {
                "kinds": eventTypes,
                "authors": [pubkey],
                "since": currentTimestamp // Only get events created after now
            }
        ];
        
        socket.send(JSON.stringify(subscriptionMessage));
        log(`Subscribed to new events from now onwards (types: ${eventTypes.join(', ')})`);
    });
    
    socket.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            
            // Check if this is an EVENT message
            if (message[0] === 'EVENT' && message[1] && message[2]) {
                const subscriptionId = message[1];
                const eventData = message[2];
                
                const eventTypeText = getEventTypeText(eventData.kind);
                const timestamp = new Date(eventData.created_at * 1000).toLocaleString();
                
                log(`Received ${eventTypeText} event`);
                sendToDiscord(eventData, eventTypeText, timestamp);
            }
        } catch (error) {
            log(`Error parsing message: ${error.message}`);
        }
    });
    
    socket.on('close', () => {
        log('Connection closed 🔴');
        log('Reconnecting in 5 seconds...');
        setTimeout(() => {
            connectToRelay();
        }, 5000);
    });
    
    socket.on('error', (error) => {
        log(`WebSocket error: ${error.message}`);
    });
}

// Start the connection
connectToRelay();

// Keep the process alive
setInterval(() => {
    log('Still running... 💓');
}, 60000);

