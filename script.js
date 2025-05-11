// Game state variables
let gameActive = false;
let gameTimer = 60;
let score = 0;
let comboCounter = 0;
let lastNeutralized = Date.now();
let breachLevel = 0;
let selectedTool = null;
let gameInterval;
let threats = [];
let specialThreatsEnabled = true;

// Tool and threat types mapping
const toolTypes = {
    'threat-intel': 'ransomware',
    'secure-access': 'phishing',
    'vuln-scanner': 'exploit',
    'honeypot': 'botnet'
};

// Element references
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const gameArea = document.getElementById('game-area');
const scoreValue = document.getElementById('score-value');
const timerValue = document.getElementById('timer-value');
const finalScoreValue = document.getElementById('final-score-value');
const gameOverReason = document.getElementById('game-over-reason');
const breachMeterFill = document.getElementById('breach-meter-fill');
const toolsContainer = document.getElementById('tools-container');

// Event listeners
document.addEventListener('DOMContentLoaded', initializeGame);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', resetGame);

// Initialize game
function initializeGame() {
    // Setup tool selection
    const tools = document.querySelectorAll('.tool');
    tools.forEach(tool => {
        tool.addEventListener('click', () => selectTool(tool));
    });
}

// Select a tool
function selectTool(toolElement) {
    if (!gameActive) return;
    
    // Clear previous selection
    const tools = document.querySelectorAll('.tool');
    tools.forEach(tool => tool.classList.remove('selected'));
    
    // Set new selection
    toolElement.classList.add('selected');
    selectedTool = toolElement.getAttribute('data-tool');
}

// Start the game
function startGame() {
    // Hide start screen, show game screen
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    
    // Reset game state
    gameActive = true;
    gameTimer = 60;
    score = 0;
    comboCounter = 0;
    breachLevel = 0;
    threats = [];
    scoreValue.textContent = '0';
    timerValue.textContent = '60';
    breachMeterFill.style.width = '0%';
    
    // Clear any existing threat elements
    while (gameArea.firstChild) {
        gameArea.removeChild(gameArea.firstChild);
    }
    
    // Start game timer
    gameInterval = setInterval(updateGame, 1000);
    
    // Start spawning threats
    spawnThreatsLoop();
}

// Reset game to play again
function resetGame() {
    gameOverScreen.classList.add('hidden');
    startGame();
}

// End the game
function endGame(reason) {
    gameActive = false;
    clearInterval(gameInterval);
    
    // Remove all event listeners from threats
    threats.forEach(threat => {
        const threatElement = document.getElementById(threat.id);
        if (threatElement) {
            threatElement.removeEventListener('click', handleThreatClick);
        }
    });
    
    // Show game over screen
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    // Update final score
    finalScoreValue.textContent = score;
    gameOverReason.textContent = reason;
}

// Update game state (called every second)
function updateGame() {
    if (!gameActive) return;
    
    // Update timer
    gameTimer--;
    timerValue.textContent = gameTimer;
    
    // Check if time's up
    if (gameTimer <= 0) {
        endGame("Time's up! Security audit complete.");
        return;
    }
    
    // Add special threats as game progresses
    if (gameTimer === 45 && specialThreatsEnabled) {
        spawnSpecialThreat('ceo-phish');
    }
    
    if (gameTimer === 30 && specialThreatsEnabled) {
        spawnSpecialThreat('stuxnet');
    }
    
    // Increase difficulty by spawning threats more frequently
    if (gameTimer === 40 || gameTimer === 20) {
        spawnThreatsLoop();
    }
}

// Create and add a new threat to the game
function createThreat(type, special = false) {
    if (!gameActive) return;
    
    // Create unique ID for this threat
    const id = 'threat-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    // Create threat element
    const threatElement = document.createElement('div');
    threatElement.id = id;
    threatElement.className = 'threat ' + type;
    
    if (special) {
        threatElement.classList.add('special-threat');
        if (special === 'ceo-phish') {
            threatElement.classList.add('ceo-phish');
            threatElement.textContent = 'CEO';
        } else if (special === 'stuxnet') {
            threatElement.classList.add('stuxnet');
            threatElement.textContent = 'STUXNET';
        }
    }
    
    // Position randomly along the top
    const xPos = Math.random() * (window.innerWidth - 80) + 40;
    threatElement.style.left = xPos + 'px';
    threatElement.style.top = '-80px'; // Start above the screen
    
    // Add to game area
    gameArea.appendChild(threatElement);
    
    // Set falling animation
    const fallSpeed = special ? 
        (special === 'stuxnet' ? 3500 : 4000) : 
        Math.floor(Math.random() * 2000) + 3000; // 3-5 seconds to fall
    
    // Create threat object for tracking
    const threat = {
        id: id,
        type: type,
        special: special,
        element: threatElement,
        position: { x: xPos, y: -80 },
        speed: fallSpeed,
        active: true
    };
    
    // Add click event
    threatElement.addEventListener('click', () => handleThreatClick(threat));
    
    // Add to threats array
    threats.push(threat);
    
    // Start falling animation
    animateThreat(threat);
    
    return threat;
}

// Handle click on a threat
function handleThreatClick(threat) {
    if (!gameActive || !threat.active) return;
    
    const threatElement = document.getElementById(threat.id);
    if (!threatElement) return;
    
    // If it's a false alarm, clicking is a mistake
    if (threat.type === 'false-alarm') {
        // Penalty for clicking false alarm
        increaseBreachLevel(10);
        showComboText(threatElement, 'WRONG!', '#e74c3c');
        threat.active = false;
        threatElement.classList.add('neutralized');
        return;
    }
    
    // Check if correct tool is selected
    if (!selectedTool) {
        showComboText(threatElement, 'Select Tool!', '#f1c40f');
        return;
    }

    const correctToolForThreat = Object.entries(toolTypes).find(([tool, threatType]) => threatType === threat.type);
    
    // Handle Honeypot (can catch any real threat but for fewer points)
    if (selectedTool === 'honeypot' && threat.type !== 'false-alarm') {
        neutralizeThreat(threat, 0.5); // Half points for using honeypot
        return;
    }
    
    // Special threats handling
    if (threat.special) {
        if (threat.special === 'ceo-phish' && selectedTool === 'secure-access') {
            neutralizeThreat(threat, 3); // Triple points for CEO phish
            return;
        }
        
        if (threat.special === 'stuxnet' && selectedTool === 'vuln-scanner') {
            neutralizeThreat(threat, 5); // 5x points for Stuxnet
            return;
        }
    }
    
    // Regular threat handling - check if correct tool
    if (correctToolForThreat && correctToolForThreat[0] === selectedTool) {
        neutralizeThreat(threat, 1);
    } else {
        // Wrong tool penalty
        showComboText(threatElement, 'WRONG TOOL!', '#e74c3c');
        increaseBreachLevel(5);
    }
}

// Neutralize a threat
function neutralizeThreat(threat, multiplier) {
    if (!threat.active) return;
    
    const threatElement = document.getElementById(threat.id);
    if (!threatElement) return;
    
    // Mark as neutralized
    threat.active = false;
    
    // Calculate combo bonus
    const now = Date.now();
    if (now - lastNeutralized < 1500) { // 1.5 seconds for combo
        comboCounter++;
    } else {
        comboCounter = 0;
    }
    lastNeutralized = now;
    
    // Calculate score
    const comboMultiplier = Math.min(1 + (comboCounter * 0.2), 3); // Max 3x combo
    const basePoints = threat.special ? 100 : 50;
    const pointsEarned = Math.floor(basePoints * multiplier * comboMultiplier);
    
    // Update score
    score += pointsEarned;
    scoreValue.textContent = score;
    
    // Show combo text
    let comboText = '+' + pointsEarned;
    if (comboCounter > 0) {
        comboText += ' COMBO x' + (comboCounter + 1);
    }
    
    let comboColor;
    if (threat.special === 'ceo-phish') {
        comboColor = '#9b59b6';
    } else if (threat.special === 'stuxnet') {
        comboColor = '#c0392b';
    } else {
        comboColor = '#2ecc71';
    }
    
    showComboText(threatElement, comboText, comboColor);
    
    // Neutralize animation
    threatElement.classList.add('neutralized');
    setTimeout(() => {
        if (threatElement.parentNode) {
            threatElement.parentNode.removeChild(threatElement);
        }
    }, 300);
    
    // Remove from threats array
    const index = threats.findIndex(t => t.id === threat.id);
    if (index !== -1) {
        threats.splice(index, 1);
    }
}

// Show floating combo text
function showComboText(element, text, color) {
    const rect = element.getBoundingClientRect();
    const comboText = document.createElement('div');
    comboText.className = 'combo-text';
    comboText.textContent = text;
    comboText.style.color = color;
    comboText.style.left = rect.left + (rect.width / 2) - 40 + 'px';
    comboText.style.top = rect.top + 'px';
    
    document.body.appendChild(comboText);
    
    // Remove after animation completes
    setTimeout(() => {
        if (comboText.parentNode) {
            comboText.parentNode.removeChild(comboText);
        }
    }, 1000);
}

// Animate a falling threat
function animateThreat(threat) {
    if (!gameActive || !threat.active) return;
    
    const threatElement = document.getElementById(threat.id);
    if (!threatElement) return;
    
    // Calculate new position
    const gameAreaHeight = gameArea.clientHeight;
    const fallDuration = threat.speed;
    const startTime = Date.now();
    
    function fall() {
        if (!gameActive || !threat.active) return;
        
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / fallDuration, 1);
        
        // Calculate Y position
        const newY = -80 + (gameAreaHeight + 80) * progress;
        threat.position.y = newY;
        threatElement.style.top = newY + 'px';
        
        // If still falling, continue animation
        if (progress < 1 && gameActive && threat.active) {
            requestAnimationFrame(fall);
        } else if (progress >= 1 && threat.active) {
            // Threat reached bottom
            threatMissed(threat);
        }
    }
    
    // Start falling
    requestAnimationFrame(fall);
}

// Handle missed threats
function threatMissed(threat) {
    if (!threat.active) return;
    
    const threatElement = document.getElementById(threat.id);
    if (!threatElement) return;
    
    // Mark as inactive
    threat.active = false;
    
    // If false alarm reached bottom safely, give points
    if (threat.type === 'false-alarm') {
        score += 25;
        scoreValue.textContent = score;
        showComboText(threatElement, '+25 CORRECT', '#2ecc71');
    } else {
        // Special handling for Stuxnet - insta-kill if missed
        if (threat.special === 'stuxnet') {
            increaseBreachLevel(100); // Game over
            showComboText(threatElement, 'CRITICAL BREACH!', '#c0392b');
        } else {
            // Penalty for missed threats
            const breachAmount = threat.special === 'ceo-phish' ? 30 : 15;
            increaseBreachLevel(breachAmount);
            showComboText(threatElement, 'BREACH!', '#e74c3c');
        }
    }
    
    // Remove element
    setTimeout(() => {
        if (threatElement.parentNode) {
            threatElement.parentNode.removeChild(threatElement);
        }
    }, 300);
    
    // Remove from threats array
    const index = threats.findIndex(t => t.id === threat.id);
    if (index !== -1) {
        threats.splice(index, 1);
    }
}

// Increase breach level
function increaseBreachLevel(amount) {
    breachLevel += amount;
    
    // Cap at 100%
    if (breachLevel > 100) breachLevel = 100;
    
    // Update UI
    breachMeterFill.style.width = breachLevel + '%';
    
    // Add warning animation if getting close
    if (breachLevel > 70) {
        breachMeterFill.style.boxShadow = '0 0 15px rgba(231, 76, 60, 1)';
    }
    
    // Check for game over
    if (breachLevel >= 100) {
        endGame("Manual protection FAILED: Critical security breach! Claroty helps to stop all those attacks");
    }
}

// Spawn threats in a loop
function spawnThreatsLoop() {
    if (!gameActive) return;
    
    // Create a threat with random type
    spawnRandomThreat();
    
    // Schedule next spawn
    const minTime = Math.max(1000, 1800 - (gameTimer < 30 ? 500 : 0) - (gameTimer < 15 ? 300 : 0));
    const maxTime = Math.max(1400, 2000 - (gameTimer < 30 ? 500 : 0) - (gameTimer < 15 ? 300 : 0));
    const nextSpawnTime = Math.floor(Math.random() * (maxTime - minTime)) + minTime;
    
    setTimeout(spawnThreatsLoop, nextSpawnTime);
}

// Spawn a random threat
function spawnRandomThreat() {
    if (!gameActive) return;
    
    // Define threat types
    const threatTypes = [
        'ransomware',  // Red - Requires Threat Intel
        'phishing',    // Blue - Requires Secure Access
        'exploit',     // Yellow - Requires Vuln Scanner
        'botnet',      // Green - Requires Honeypot
        'false-alarm'  // Grey - Don't click
    ];
    
    // Weights for different threat types (adjust for difficulty)
    let weights = [2, 2, 2, 2, 1.5]; // Start with equal weights plus slightly less false alarms
    
    // As game progresses, increase difficulty
    if (gameTimer < 45) {
        weights = [3, 3, 3, 3, 1]; // Fewer false alarms
    }
    
    if (gameTimer < 30) {
        weights = [4, 4, 4, 4, 0.5]; // Very few false alarms
    }
    
    // Total weight
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // Random weighted selection
    let random = Math.random() * totalWeight;
    let index = 0;
    
    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            index = i;
            break;
        }
    }
    
    // Create the threat
    createThreat(threatTypes[index]);
}

// Spawn special threats
function spawnSpecialThreat(type) {
    if (!gameActive) return;
    
    if (type === 'ceo-phish') {
        createThreat('phishing', 'ceo-phish');
    } else if (type === 'stuxnet') {
        createThreat('exploit', 'stuxnet');
    }
}