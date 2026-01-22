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

// Colors Definition
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

// Initialize from URL params or default
const urlParams = new URLSearchParams(window.location.search);
const playersParam = urlParams.get('withplayers');
const colorsParam = urlParams.get('withcolors');

if (playersParam) {
    const names = playersParam.split(',');
    const colors = colorsParam ? colorsParam.split(',') : [];
    
    names.forEach((name, index) => {
        if (state.players.length >= 6) return; // Hard limit

        // Determine color
        let colorGrad = null;
        if (colors[index]) {
            const variant = PLAYER_VARIANTS.find(v => v.key === colors[index].trim().toLowerCase());
            if (variant) colorGrad = variant.grad;
        }
        
        // Fallback to next available if no specific color or invalid
        if (!colorGrad) {
             const usedColors = state.players.map(p => p.color);
             const available = PLAYER_VARIANTS.find(v => !usedColors.includes(v.grad)) || PLAYER_VARIANTS[0];
             colorGrad = available.grad;
        }

        state.players.push({
            id: Date.now() + Math.random(),
            name: name.trim(),
            color: colorGrad,
            score: 0
        });
    });
}

if (state.players.length === 0) {
    state.players.push(createPlayerObj());
}

function createPlayerObj() {
    const usedColors = state.players.map(p => p.color);
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
    row.draggable = true; // Enable dragging
    
    // Drag Events
    row.addEventListener('dragstart', handleDragStart);
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragend', handleDragEnd);

    // Touch support hooks
    row.addEventListener('touchstart', handleTouchStart, {passive: false});
    row.addEventListener('touchmove', handleTouchMove, {passive: false});
    row.addEventListener('touchend', handleTouchEnd);

    // Touch support hooks could go here, but simple HTML5 DnD is requested first.
    
    row.innerHTML = `
        <div class="color-dot" id="dot-${player.id}" onclick="openColorPicker(${player.id})" style="background: ${player.color}; border: 2px solid rgba(255,255,255,0.8);"></div>
        <input type="text" value="${player.name}" placeholder="${t('namePlaceholder')}" 
            oninput="updatePlayerName(${player.id}, this.value)" 
            onkeydown="if(event.key === 'Enter') addPlayer()"
            style="margin: 0; flex: 1;">
        <div class="drag-handle">☰</div>
        <button onclick="removePlayer(${player.id})" style="margin: 0; padding: 10px; background: rgba(0,0,0,0.5); border: none;">X</button>
    `;
    return row;
}

// Drag and Drop Handlers
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    this.classList.add('dragging');
    // Ensure we can see what we are dragging, maybe set a ghost image if needed
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
    
    // Optional: Visual feedback for reordering before drop (swapping place holders)
    // A simple implementation: swap in DOM if specific criteria met
    // For now, let's keep it simple: drop on target swaps them or inserts before
}

function handleDrop(e) {
    e.stopPropagation();
    
    if (draggedItem !== this) {
        // Swap or reorder logic
        // We need to reorder the DOM and then update state.players to match DOM order
        
        // Logic: Insert dragged item before the drop target
        const list = document.getElementById('player-list');
        // Find position comparison
        // If we drop on a node, are we inserting before or after?
        // Let's rely on simple insertBefore behavior. 
        // If the mouse is in the bottom half of the target, insert after. Top half, before.
        
        const rect = this.getBoundingClientRect();
        const offset = e.clientY - rect.top;
        
        if (offset > rect.height / 2) {
            this.parentNode.insertBefore(draggedItem, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedItem, this);
        }
        
        // Sync State
        syncPlayersOrderFromDOM();
    }
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedItem = null;
}

// Touch Handlers
function handleTouchStart(e) {
    if (e.target.classList.contains('drag-handle')) {
        draggedItem = this;
        this.classList.add('dragging');
    }
}

function handleTouchMove(e) {
    if (!draggedItem) return;
    if (e.cancelable) e.preventDefault(); // Prevent scrolling while dragging

    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetRow = target ? target.closest('.player-card') : null;

    if (targetRow && targetRow !== draggedItem && targetRow.parentNode === draggedItem.parentNode) {
        const rect = targetRow.getBoundingClientRect();
        const offset = touch.clientY - rect.top;

        if (offset > rect.height / 2) {
            targetRow.parentNode.insertBefore(draggedItem, targetRow.nextSibling);
        } else {
            targetRow.parentNode.insertBefore(draggedItem, targetRow);
        }
        syncPlayersOrderFromDOM();
    }
}

function handleTouchEnd(e) {
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }
}

function syncPlayersOrderFromDOM() {
    const list = document.getElementById('player-list');
    const newOrderIds = Array.from(list.children).map(child => {
        // ID format: player-row-123456
        return parseFloat(child.id.replace('player-row-', ''));
    });
    
    // Reorder state.players based on newOrderIds
    const newPlayersArray = [];
    newOrderIds.forEach(id => {
        const p = state.players.find(pl => pl.id === id);
        if(p) newPlayersArray.push(p);
    });
    
    state.players = newPlayersArray;
}


function addPlayer() {
    if (state.players.length >= 6) return;
    const newPlayer = createPlayerObj();
    state.players.push(newPlayer);
    
    const list = document.getElementById('player-list');
    if(list) {
        const newRow = createPlayerRow(newPlayer);
        list.appendChild(newRow);
        // Focus the new input
        const input = newRow.querySelector('input');
        if(input) input.focus();
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
    
    const countValid = state.players.length >= 4 && state.players.length <= 6;
    const allNamesFilled = state.players.every(p => p.name.trim().length > 0);
    
    const isValid = countValid && allNamesFilled;
    
    startBtn.disabled = !isValid;
    startBtn.innerText = t('startGame');
    if (!countValid) {
        startBtn.innerText += ` (${state.players.length}/4-6)`;
    } else if (!allNamesFilled) {
        startBtn.innerText += ` (${t('playerName')}?)`;
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

function renderRound() {
    const narrator = state.players[state.currentNarratorIndex];
    if (!state.roundInputs[narrator.id]) {
        state.roundInputs = {}; 
        state.players.forEach(p => {
             // Initialize for all players, including narrator (though they won't use it)
             state.roundInputs[p.id] = { guessed: false, votes: 0 };
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
        // if (p.id === narrator.id) return; // Allow narrator to be rendered
        const isNarrator = p.id === narrator.id;
        const inputData = state.roundInputs[p.id];
        
        const card = document.createElement('div');
        // Combined background: Top layer is a gradient from semi-transparent black to black (fade) clipped to padding-box
        // Bottom layer is the player's full color gradient clipped to border-box (shows through transparent border)
        // We darken the player color slightly (0.6 opacity black overlay) to balance visibility and legibility.
        card.style.background = `linear-gradient(90deg, rgba(0,0,0,0.6) 0%, #000000 95%), ${p.color}`;
        card.style.backgroundClip = 'padding-box, border-box';
        card.style.backgroundOrigin = 'padding-box, border-box';
        card.style.border = '2px solid transparent';
        card.style.padding = '12px';
        card.style.borderRadius = '8px';
        card.style.marginBottom = '10px';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        
        if (isNarrator) {
            card.style.opacity = '0.3';
            card.style.pointerEvents = 'none'; // Optional: ensure no clicks go through
        }
        
        // Ensure content is above the background
        const content = document.createElement('div');
        content.style.position = 'relative'; 
        content.style.zIndex = '1';
        
        // Disabled attributes string
        const disabledAttr = isNarrator ? 'disabled' : '';
        
        content.innerHTML = `
            <div class="flex-row" style="justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: bold;">${p.name} ${isNarrator ? `(${t('narrator')})` : ''}</span>
            </div>
            
            ${!isNarrator ? `
            <label class="flex-row" style="margin-bottom: 12px; cursor: pointer;">
                <input type="checkbox" id="checkbox-${p.id}" style="width: 24px; height: 24px; margin:0;" 
                    ${inputData.guessed ? 'checked' : ''} 
                    onchange="updateRoundInput(${p.id}, 'guessed', this.checked)">
                <span style="margin-left: 10px;">${t('guessedNarrator')}</span>
            </label>

            <div class="flex-row" style="justify-content: space-between; align-items: center;">
                <span style="font-size: 0.9rem;">${t('votesReceived')}</span>
                <div class="flex-row">
                    <button onclick="updateRoundInput(${p.id}, 'votes', -1)" 
                        style="padding: 5px 12px; margin:0;">-</button>
                    <span id="votes-${p.id}" style="padding: 0 10px; font-weight: bold;">${inputData.votes}</span>
                    <button onclick="updateRoundInput(${p.id}, 'votes', 1)" 
                        style="padding: 5px 12px; margin:0;">+</button>
                </div>
            </div>
            ` : ''}
        `;
        card.appendChild(content);
        container.appendChild(card);
    });

    const calcBtn = document.createElement('button');
    calcBtn.id = 'calculate-score-btn';
    calcBtn.className = 'primary mt-2';
    calcBtn.innerText = t('calcScore');
    calcBtn.onclick = calculateScores;
    container.appendChild(calcBtn);

    app.appendChild(container);
}

function updateRoundInput(pid, field, value) {
    // Value can be boolean (for guessed) or number delta (for votes)
    
    if (field === 'votes') {
        // Value is delta (-1 or 1)
        let current = state.roundInputs[pid].votes;
        let newValue = current + value; // value is delta
        
        // Limits
        // Max votes = TotalPlayers - 2 (Narrator + Self don't vote for it)
        const maxVotes = state.players.length - 2;
        
        if (newValue < 0) newValue = 0;
        if (newValue > maxVotes) newValue = maxVotes;
        
        state.roundInputs[pid][field] = newValue;
        // Update DOM
        const el = document.getElementById(`votes-${pid}`);
        if(el) el.innerText = newValue;
    } 
    else if (field === 'guessed') {
        state.roundInputs[pid][field] = value;
    }
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
        row.className = 'player-card flex-row';
        row.style.background = p.color;
        row.style.justifyContent = 'space-between';
        
        row.innerHTML = `
            <span style="font-weight: 700; font-size: 1.1rem; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${p.name}</span>
            <span style="font-weight: 700; font-size: 1.5rem; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${p.score}</span>
        `;
        container.appendChild(row);
    });

    const nextBtn = document.createElement('button');
    nextBtn.id = 'next-round-btn';
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
    if (state.players.length < 4 || state.players.length > 6) return;
    if (!state.players.every(p => p.name.trim().length > 0)) return;

    state.gameStarted = true;
    state.view = 'round'; 
    renderApp();
}

renderApp();
