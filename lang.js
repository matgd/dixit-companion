const LABELS = {
    en: {
        appTitle: "Dixit Companion",
        startGame: "Start Game",
        addPlayer: "Add Player",
        remove: "Remove",
        playerName: "Player Name",
        namePlaceholder: "Enter player name...",
        pickColor: "Pick Color",
        setupTitle: "Game Setup",
        roundPoints: "Round Points",
        totalPoints: "Total Score",
        narrator: "Narrator",
        voting: "Voting Results",
        nextRound: "Next Round",
        finishGame: "Finish Game",
        winner: "The Winner is:",
        selectNarrator: "Narrator",
        voteForNarrator: "Did they guess Narrator's card?",
        votesReceived: "Votes received on their card (Bluff)",
        calcScore: "Calculate Score",
        round: "Round",
        confirm: "Confirm",
        guessedNarrator: "Narrator guessed?",
        nextNarrator: "Next Narrator",
        scoreboard: "Scoreboard",
        endGame: "End Game",
        langName: "Polski",
        errorPlayerCount: "Need 4-6 players to start.",
        roundSummary: "Round Summary",
        close: "Close",
        colors: {
            red: "Red", green: "Green", blue: "Blue", yellow: "Yellow", 
            pink: "Pink", purple: "Purple", orange: "Orange"
        }
    },
    pl: {
        appTitle: "Dixit Pomocnik",
        startGame: "Rozpocznij Grę",
        addPlayer: "Dodaj Gracza",
        remove: "Usuń",
        playerName: "Imię gracza",
        namePlaceholder: "Wpisz imię gracza...",
        pickColor: "Wybierz Kolor",
        setupTitle: "Przygotowanie",
        roundPoints: "Punkty w rundzie",
        totalPoints: "Wynik całkowity",
        narrator: "Narrator",
        voting: "Wyniki Głosowania",
        nextRound: "Następna Runda",
        finishGame: "Koniec Gry",
        winner: "Zwycięża:",
        selectNarrator: "Narrator",
        voteForNarrator: "Czy odgadli kartę Narratora?",
        votesReceived: "Głosy na ich kartę (Zmyłka)",
        calcScore: "Oblicz Punkty",
        round: "Runda",
        confirm: "Zatwierdź",
        guessedNarrator: "Narrator odgadnięty?",
        nextNarrator: "Następny Narrator",
        scoreboard: "Tablica Wyników",
        endGame: "Zakończ Grę",
        langName: "English",
        errorPlayerCount: "Wymagane 4-6 graczy.",
        roundSummary: "Podsumowanie Rundy",
        close: "Zamknij",
        colors: {
            red: "Czerwony", green: "Zielony", blue: "Niebieski", yellow: "Żółty", 
            pink: "Różowy", purple: "Fioletowy", orange: "Pomarańczowy"
        }
    }
};

let currentLang = 'pl';

function t(key) {
    return LABELS[currentLang][key] || key;
}

function toggleLang() {
    currentLang = currentLang === 'en' ? 'pl' : 'en';
    renderApp();
}
