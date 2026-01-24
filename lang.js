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
        votesReceived: "Votes received on their card (bluff)",
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
            pink: "Pink", purple: "Purple", orange: "Orange",
            cyan: "Cyan", black: "Black"
        },
        instructionsBtn: "Instructions",
        instructionsTitle: "Game Rules",
        instructionsText: `
<strong>Who becomes the narrator?</strong><br>
The first player to invent an association for one of their cards.<br><br>
<strong>The Narrator</strong><br>
Selects 1 of 6 cards and says a sentence or word associated with it. Does not show the card.<br><br>
<strong>Other Players</strong><br>
Select 1 of their cards that best matches the narrator's association. Give it secretly to the narrator.<br><br>
<strong>Revealing</strong><br>
Narrator shuffles all cards (including their own) and lays them out. Players vote for the narrator's card using dials.<br><br>
<strong>Scoring</strong><br>
- If all or no one guesses the narrator: Narrator 0 points, others 2 points.<br>
- Otherwise: Narrator 3 points, correct guessers 3 points.<br>
- Bonus: 1 point per vote on your own bluffed card.<br><br>
<strong>End of Game</strong><br>
First to 30 points wins.
`
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
        votesReceived: "Głosy na ich kartę (zmyłka)",
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
            pink: "Różowy", purple: "Fioletowy", orange: "Pomarańczowy",
            cyan: "Turkusowy", black: "Czarny"
        },
        instructionsBtn: "Instrukcja",
        instructionsTitle: "Zasady Gry",
        instructionsText: `
<strong>Kto zostaje narratorem w pierwszej rundzie gry?</strong><br>
Gracz, który jako pierwszy wymyśli skojarzenie do 1 ze swoich kart i oznajmi to pozostałym graczom.<br><br>
<strong>Narrator</strong><br>
Wybiera 1 z 6 kart trzymanych w ręku (nie pokazuje karty pozostałym graczom) i wypowiada głośno jakiekolwiek skojarzenie związane z jej treścią (może to być 1 słowo albo zdanie).<br><br>
<strong>Pozostali Gracze</strong><br>
Każdy z pozostałych graczy wybiera teraz w sekrecie 1 kartę ze swoich 6 kart, która jego zdaniem najlepiej ilustruje skojarzenie wypowiedziane przez narratora. Gracze, nie pokazując wybranych kart innym graczom, przekazują je narratorowi.<br><br>
<strong>Głosowanie</strong><br>
Narrator zbiera wszystkie karty, tasuje je i rozkłada odkryte. Gracze w tajemnicy głosują na kartę, którą typują na należącą do narratora (narrator nie głosuje).<br><br>
<strong>Punktowanie</strong><br>
- Jeśli nikt lub wszyscy zagłosują na narratora: Narrator 0 pkt, reszta 2 pkt.<br>
- W przeciwnym razie: Narrator 3 pkt, kto trafił 3 pkt.<br>
- Bonus: 1 pkt za każdy głos na twoją zmyłkową kartę.<br><br>
<strong>Koniec Gry</strong><br>
Gra kończy się, gdy ktoś zdobędzie 30 punktów.
`
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
