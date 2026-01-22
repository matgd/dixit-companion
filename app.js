// App State
const state = {
    players: [], 
    rounds: [],
    currentNarratorIndex: 0,
    gameStarted: false,
    view: 'setup', 
    roundInputs: {},
    editingPlayerId: null 
};

// Colors Definition keeping gradients but linking to names
const PLAYER_VARIANTS = [
    { key: 'green', grad: 'var(--grad-green)' },
    { key: 'yellow', grad: 'var(--grad-yellow)' },
    { key: 'orange', grad: 'var(--grad-orange)' },
    { key: 'blue', grad: 'var(--grad-blue)' },
    { key: 'purple', grad: 'var(--grad-purple)' },
    { key: 'pink', grad: 'var(--grad-pink)' },
    { key: 'red', grad: 'var(--grad-red)' }
];

const app = document.getElementById('app');

// Initialize with one empty player if empty
if (state.players.length === 0) {
    state.players.push(createPlayerObj());
}

function createPlayerObj() {
    const usedColors = state.players.map(p => p.color);
    // Find first variant whose grad is not used
    const available = PLAYER_VARIANTS.find(v => !usedColors.includes(v.grad)) || PLAYER_VARIANTS[0];
    
    return {
        id: Date.now() + Math.random(),
        name: '',
        color: available.grad,
        score: 0
    };
}

function renderApp() {
    app.innerHTML = '';
    
    // Header
    const header = document.createElement('div');
    header.className = 'flex-row';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '20px';
    header.innerHTML = `
        <h2 onclick="location.reload()" style="cursor:pointer">${t('appTitle')}</h2>
        <button onclick="toggleLang()" style="padding: 6px 12px; font-size: 0.8rem;">${t('langName')}</button>
    `;
    app.appendChild(header);

    if (state.view === 'setup') {
        renderSetup();
    } else if (state.view === 'round') {
        renderRound();
    } else if (state.view === 'scoreboard') {
        renderScoreboard();
    }
}

function renderSetup() {
    const container = document.createElement('div');
    container.className = 'view active flex-col';
    container.id = 'setup-container';
    
    container.innerHTML = `<h3>${t('setupTitle')}</h3>`;
    
    const playerList = document.createElement('div');
    playerList.className = 'flex-col';
    playerList.id = 'player-list';
    container.appendChild(playerList);

    state.players.forEach(player => {
        playerList.appendChild(createPlayerRow(player));
    });

    const addBtn = document.createElement('button');
    addBtn.id = 'add-player-btn';
    addBtn.innerText = `+ ${t('addPlayer')}`;
    addBtn.onclick = addPlayer;
    addBtn.style.borderStyle = 'dashed';
    if(state.players.length >= 6) addBtn.style.display = 'none';
    container.appendChild(addBtn);

    const startBtn = document.createElement('button');
    startBtn.id = 'start-game-btn';
    startBtn.className = 'primary mt-2';
    startBtn.onclick = startGame;
    container.appendChild(startBtn);

    app.appendChild(container);
    updateStartButton(); 
}

function createPlayerRow(player) {
    const row = document.createElement('div');
    row.className = 'player-card flex-row';
    row.id = `player-row-${player.id}`;
    row.style.background = player.color;
    
    row.innerHTML = `
        <div class="color-dot" id="dot-${player.id}" onclick="openColorPicker(${player.id})" style="background: ${player.color}; border: 2px solid rgba(255,255,255,0.8);"></div>
        <input type="text" value="${player.name}" placeholder="${t('namePlaceholder')}" 
            oninput="updatePlayerName(${player.id}, this.value)" 
            style="margin: 0; flex: 1; background: rgba(0,0,0,0.5); border: none;">
        <button onclick="removePlayer(${player.id})" style="margin: 0; padding: 10px; background: rgba(0,0,0,0.5); border: none;">X</button>
    `;
    return row;
}

function addPlayer() {
    if (state.players.length >= 6) return;
    const newPlayer = createPlayerObj();
    state.players.push(newPlayer);
    
    const list = document.getElementById('player-list');
    if(list) {
        list.appendChild(createPlayerRow(newPlayer));
    }
    
    updateUIState();
}

function removePlayer(id) {
    state.players = state.players.filter(p => p.id !== id);
    const row = document.getElementById(`player-row-${id}`);
    if(row) row.remove();
    updateUIState();
}

function updatePlayerName(id, name) {
    const p = state.players.find(p => p.id === id);
    if (p) {
        p.name = name;
        updateStartButton(); 
    }
}

function updateUIState() {
    const addBtn = document.getElementById('add-player-btn');
    if(addBtn) {
        addBtn.style.display = state.players.length >= 6 ? 'none' : 'block';
    }
    updateStartButton();
}

function updateStartButton() {
    const startBtn = document.getElementById('start-game-btn');
    if(!startBtn) return;
    
    // Constraints: 
    // 1. 4-6 players
    // 2. All names filled
    const countValid = state.players.length >= 4 && state.players.length <= 6;
    const allNamesFilled = state.players.every(p => p.name.trim().length > 0);
    
    const isValid = countValid && allNamesFilled;
    
    startBtn.disabled = !isValid;
    startBtn.innerText = t('startGame');
    if (!countValid) {
        startBtn.innerText += ` (${state.players.length}/4-6)`;
    } else if (!allNamesFilled) {
        startBtn.innerText += ` (${t('playerName')}?)`; // Indicate missing names
    }
}

function openColorPicker(pid) {
    state.editingPlayerId = pid;
    const currentPlayer = state.players.find(p => p.id === pid);
    const usedColors = state.players.filter(p => p.id !== pid).map(p => p.color);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.innerHTML = `<h3>${t('pickColor')}</h3>`;
    
    const grid = document.createElement('div');
    grid.className = 'color-grid';
    // Single column list for better label visibility? Or Grid with text below?
    // Let's do Grid but with labels.
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    grid.style.gap = '16px';
    
    PLAYER_VARIANTS.forEach(variant => {
        const isUsed = usedColors.includes(variant.grad);
        const isSelected = currentPlayer.color === variant.grad;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'flex-col text-center';
        wrapper.style.alignItems = 'center';
        if (isUsed) wrapper.style.opacity = '0.3';
        
        const dot = document.createElement('div');
        dot.className = 'color-dot';
        dot.style.background = variant.grad;
        dot.style.width = '48px';
        dot.style.height = '48px';
        if(isSelected) dot.style.border = '3px solid white';
        
        if (!isUsed) {
            dot.onclick = () => {
                updatePlayerColor(pid, variant.grad);
                modal.remove();
            };
        }
        
        const label = document.createElement('span');
        label.style.fontSize = '0.7em';
        // Access color name from LABELS safely
        const colorName = LABELS[currentLang].colors[variant.key] || variant.key;
        label.innerText = colorName;
        
        wrapper.appendChild(dot);
        wrapper.appendChild(label);
        grid.appendChild(wrapper);
    });
    
    content.appendChild(grid);
    
    const closeBtn = document.createElement('button');
    closeBtn.innerText = t('close');
    closeBtn.className = 'mt-2';
    closeBtn.style.width = '100%';
    closeBtn.onclick = () => modal.remove();
    content.appendChild(closeBtn);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

function updatePlayerColor(id, color) {
    const p = state.players.find(p => p.id === id);
    if(p) {
        p.color = color;
        const row = document.getElementById(`player-row-${id}`);
        const dot = document.getElementById(`dot-${id}`);
        if(row) row.style.background = color;
        if(dot) dot.style.background = color;
    }
}

// ... unchanged parts below ...

function renderRound() {
    const narrator = state.players[state.currentNarratorIndex];
    if (!state.roundInputs[narrator.id]) {
        state.roundInputs = {}; 
        state.players.forEach(p => {
             if (p.id !== narrator.id) {
                 state.roundInputs[p.id] = { guessed: false, votes: 0 };
             }
        });
    }

    const container = document.createElement('div');
    container.className = 'view active flex-col';
    
    container.innerHTML = `
        <div class="text-center" style="margin-bottom: 20px;">
            <span style="font-size: 0.9rem; color: #888;">${t('round')} ${state.rounds.length + 1}</span>
            <h2 style="background: ${narrator.color}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: brightness(1.5);">${t('narrator')}: ${narrator.name}</h2>
        </div>
        <h3>${t('voting')}</h3>
    `;

    state.players.forEach(p => {
        if (p.id === narrator.id) return;

        const inputData = state.roundInputs[p.id];
        const card = document.createElement('div');
        card.style.background = 'var(--surface-color)'; 
        card.style.padding = '12px';
        card.style.borderRadius = '8px';
        card.style.marginBottom = '10px';
        card.style.borderLeft = `6px solid`; 
        card.style.borderImageSource = p.color;
        card.style.borderImageSlice = 1;
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        
        const stripe = document.createElement('div');
        stripe.style.position = 'absolute';
        stripe.style.left = '0';
        stripe.style.top = '0';
        stripe.style.bottom = '0';
        stripe.style.width = '6px';
        stripe.style.background = p.color;
        card.appendChild(stripe);
        
        const content = document.createElement('div');
        content.style.marginLeft = '12px';
        content.innerHTML = `
            <div class="flex-row" style="justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: bold;">${p.name}</span>
            </div>
            
            <label class="flex-row" style="margin-bottom: 12px; cursor: pointer;">
                <input type="checkbox" style="width: 24px; height: 24px; margin:0;" 
                    ${inputData.guessed ? 'checked' : ''} 
                    onchange="updateRoundInput(${p.id}, 'guessed', this.checked)">
                <span style="margin-left: 10px;">${t('guessedNarrator')}</span>
            </label>

            <div class="flex-row" style="justify-content: space-between; align-items: center;">
                <span style="font-size: 0.9rem;">${t('votesReceived')}</span>
                <div class="flex-row">
                    <button onclick="updateRoundInput(${p.id}, 'votes', ${inputData.votes - 1})" 
                        style="padding: 5px 12px; margin:0;">-</button>
                    <span style="padding: 0 10px; font-weight: bold;">${inputData.votes}</span>
                    <button onclick="updateRoundInput(${p.id}, 'votes', ${inputData.votes + 1})" 
                        style="padding: 5px 12px; margin:0;">+</button>
                </div>
            </div>
        `;
        card.appendChild(content);
        container.appendChild(card);
    });

    const calcBtn = document.createElement('button');
    calcBtn.className = 'primary mt-2';
    calcBtn.innerText = t('calcScore');
    calcBtn.onclick = calculateScores;
    container.appendChild(calcBtn);

    app.appendChild(container);
}

function updateRoundInput(pid, field, value) {
    if (field === 'votes') {
        if (value < 0) value = 0;
        if (value > state.players.length - 2) value = state.players.length - 2; 
    }
    state.roundInputs[pid][field] = value;
    renderApp(); 
}

function calculateScores() {
    const narrator = state.players[state.currentNarratorIndex];
    const otherPlayers = state.players.filter(p => p.id !== narrator.id);
    
    let correctGuesses = 0;
    otherPlayers.forEach(p => {
        if (state.roundInputs[p.id].guessed) correctGuesses++;
    });

    const roundScores = {};
    state.players.forEach(p => roundScores[p.id] = 0);

    if (correctGuesses === 0 || correctGuesses === otherPlayers.length) {
        roundScores[narrator.id] += 0;
        otherPlayers.forEach(p => roundScores[p.id] += 2);
    } else {
        roundScores[narrator.id] += 3;
        otherPlayers.forEach(p => {
            if (state.roundInputs[p.id].guessed) {
                roundScores[p.id] += 3;
            }
        });
    }

    otherPlayers.forEach(p => {
        const votes = state.roundInputs[p.id].votes;
        roundScores[p.id] += votes; 
    });

    state.players.forEach(p => {
        p.score += roundScores[p.id];
    });

    state.rounds.push({
        narratorId: narrator.id,
        scores: roundScores
    });

    state.view = 'scoreboard';
    renderApp();
}

function renderScoreboard() {
    const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);

    const container = document.createElement('div');
    container.className = 'view active flex-col';

    container.innerHTML = `
        <h3 class="text-center">${t('totalPoints')}</h3>
    `;

    sortedPlayers.forEach(p => {
        const row = document.createElement('div');
        row.style.background = p.color;
        row.style.padding = '12px';
        row.style.borderRadius = '8px';
        row.style.marginBottom = '8px';
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        
        row.innerHTML = `
            <span style="font-weight: bold; font-size: 1.1rem; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${p.name}</span>
            <span style="font-weight: bold; font-size: 1.5rem; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${p.score}</span>
        `;
        container.appendChild(row);
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'primary mt-2';
    nextBtn.innerText = t('nextRound');
    nextBtn.onclick = nextRound;
    container.appendChild(nextBtn);

    const resetBtn = document.createElement('button');
    resetBtn.innerText = t('finishGame');
    resetBtn.style.marginTop = '20px';
    resetBtn.style.background = 'var(--surface-color)';
    resetBtn.onclick = () => {
        if(confirm(t('finishGame') + '?')) location.reload();
    };
    container.appendChild(resetBtn);

    app.appendChild(container);
}

function nextRound() {
    state.currentNarratorIndex = (state.currentNarratorIndex + 1) % state.players.length;
    state.view = 'round';
    state.roundInputs = {}; 
    renderApp();
}

function startGame() {
    // Redundant Validation safely
    if (state.players.length < 4 || state.players.length > 6) return;
    if (!state.players.every(p => p.name.trim().length > 0)) return;

    state.gameStarted = true;
    state.view = 'round'; 
    renderApp();
}

renderApp();
