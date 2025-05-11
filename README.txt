# Claroty Cyber Blitz - Local Network Game Setup

A "Fruit Ninja"-style cybersecurity game optimized for mobile play over a local network.

## Game Overview

**Claroty Cyber Blitz** is a fast-paced security game where players must:
1. Identify different types of cyber threats falling from the top of the screen
2. Select the appropriate Claroty security tool to counter each threat
3. Tap the threat to neutralize it before it reaches the bottom
4. Survive for 60 seconds while achieving the highest score possible

## Setup Instructions

### 1. Prerequisites
- Python (for simple HTTP server) or Node.js/http-server
- Mobile devices must be on the same local network as the hosting computer

### 2. Hosting the Game

#### Using Python:
```bash
# Navigate to the game folder
cd claroty-cyber-blitz

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Using Node.js:
```bash
# Install http-server if you don't have it
npm install -g http-server

# Navigate to the game folder
cd claroty-cyber-blitz

# Start the server
http-server -p 8000
```

### 3. Connecting from Mobile Devices
1. Find your computer's local IP address:
   - Windows: Open Command Prompt and type `ipconfig`
   - Mac/Linux: Open Terminal and type `ifconfig` or `ip addr`

2. On mobile devices, open a browser and navigate to:
   ```
   http://YOUR_LOCAL_IP:8000
   ```
   Example: `http://192.168.1.5:8000`

## Game Instructions

### Tools (Bottom of Screen)
- **Threat Intel Platform**: Counters Ransomware (red)
- **Secure Remote Access**: Counters Phishing (blue)
- **Vulnerability Scanner**: Counters Zero-Day Exploits (yellow)
- **Honeypot**: Counters Botnets (green) and can catch any real threat (for fewer points)

### Threat Types
- **Ransomware (Red)**: Tap Threat Intel, then tap the threat
- **Phishing (Blue)**: Tap Secure Access, then tap the threat
- **Zero-Day Exploit (Yellow)**: Tap Vuln Scanner, then tap the threat
- **Botnet (Green)**: Tap Honeypot, then tap the threat
- **False Alarm (Grey)**: Don't tap! Let it fall safely

### Special Threats
- **CEO Phish**: High-value target, worth triple points
- **Stuxnet Worm**: Critical threat! If missed, causes instant game over

### Scoring
- **Base Points**: 50 points per standard threat
- **Combo Multiplier**: Quick successive neutralizations increase your score
- **Special Bonuses**: Special threats are worth more points
- **Honeypot**: Using the catch-all tool gives fewer points
- **False Alarms**: Safely ignored = 25 points, Tapped incorrectly = penalty

## Customization

### Replace Placeholder Graphics
For production use, replace the placeholder elements in the `assets` folder:
- Add Claroty logo and branding images
- Replace placeholder threat icons with custom graphics
- Add sound effects for better gameplay

### Performance Optimization
The game is built with vanilla JavaScript for optimal performance on mobile devices. If you experience performance issues:
- Reduce the maximum number of simultaneous threats
- Decrease animation complexity
- Optimize images further

## Credits
Dan Ingram