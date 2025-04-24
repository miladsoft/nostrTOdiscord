# nostrTOdiscord

A tool to forward Nostr events to Discord channels via webhooks. Monitor specific public keys and automatically send their events to Discord with rich formatting.

## Features

- Monitor specific Nostr public keys for new events
- Forward events to Discord with rich embeds and formatting
- Support for multiple event types (Metadata, Text Notes, Contacts, Reactions, etc.)
- Available as either a Node.js server or a simple HTML page

## Server Version Setup

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- Discord webhook URL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/miladsoft/nostrTOdiscord.git
   cd nostrTOdiscord
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your configuration:
   ```
   RELAY_URL=wss://relay.example.com
   PUBKEY=your_public_key_here
   EVENT_TYPES=0,1,3,7
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url
   ```

### Configuration Options

- `RELAY_URL`: The WebSocket URL of the Nostr relay to connect to
- `PUBKEY`: The public key to monitor (hex format)
- `EVENT_TYPES`: Comma-separated list of event types to monitor:
  - `0`: Metadata
  - `1`: Text Note
  - `3`: Contacts
  - `7`: Reaction
- `DISCORD_WEBHOOK_URL`: Your Discord webhook URL

### Running the Server

```bash
npm start
```

The server will connect to the specified relay and start forwarding events to Discord. It will automatically reconnect if the connection drops.

## Docker Setup

### Prerequisites

- Docker installed on your system

### Building and Running with Docker

1. Build the Docker image:
   ```bash
   docker build -t nostr-discord .
   ```

2. Run the container with your environment variables:
   ```bash
   docker run -d --name nostr-discord \
     -e RELAY_URL=wss://relay.example.com \
     -e PUBKEY=your_public_key_here \
     -e EVENT_TYPES=0,1,3,7 \
     -e DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url \
     nostr-to-discord
   ```

3. View logs:
   ```bash
   docker logs -f nostr-discord
   ```

4. Stop the container:
   ```bash
   docker stop nostr-discord
   ```

5. Start the container again:
   ```bash
   docker start nostr-discord
   ```

### Using Docker Compose

You can also use Docker Compose for easier management. Create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  nostr-to-discord:
    build: .
    environment:
      - RELAY_URL=wss://relay.example.com
      - PUBKEY=your_public_key_here
      - EVENT_TYPES=0,1,3,7
      - DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

## HTML-Only Version

For simpler deployments or testing, you can use the HTML version which runs directly in a browser.

### Setup

1. Open `index.html` in a text editor
2. Find and replace these configuration values:
   ```javascript
   const relay = 'wss://relay.primal.net';
   const pubkey = 'your_public_key_here';
   const eventTypes = [0, 1, 3, 7];
   const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/your_webhook_url';
   ```

3. Open `index.html` in a web browser
   - The page must remain open for events to be forwarded
   - Most browsers will display CORS errors when sending webhooks directly from a webpage
   - For production use, consider deploying the HTML file to a proper web server with CORS configured

### Limitations of HTML Version

- The browser must remain open with the page loaded for events to be forwarded
- CORS restrictions may prevent direct webhook calls from the browser
- No automatic reconnection if the browser is closed or refreshed

## Creating a Discord Webhook

1. In Discord, go to Server Settings > Integrations > Webhooks
2. Click "New Webhook"
3. Name your webhook and select the channel where events should be posted
4. Copy the webhook URL and add it to your configuration

## Troubleshooting

- **No events appearing in Discord**: Check that your public key is correct and the user is posting events
- **Connection errors**: Verify the relay URL is correct and the relay is online
- **CORS errors in HTML version**: This is expected when running directly from a file. Consider using the server version instead
- **Docker issues**: Make sure Docker has network access and environment variables are set correctly

## License

This project is licensed under the [MIT License](LICENSE).