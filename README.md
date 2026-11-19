# Nexus Launcher

Launcher giochi per Windows, costruito con Electron. Produce un eseguibile `.exe` portable.

## Struttura

```
nexus-launcher/
├── package.json      Dipendenze e comandi di build
├── main.js           Finestra e avvio degli .exe (backend, raramente da toccare)
├── preload.js        Ponte sicuro UI <-> backend
└── src/
    ├── index.html    STRUTTURA della UI (barra, menu, contenitori)
    ├── styles.css    ASPETTO: colori, spaziature, card, bottoni (in cima ci sono le variabili colore)
    ├── app.js        COMPORTAMENTO e markup delle viste (Home, Libreria, Store, Cloud, Dettaglio)
    └── games.json    CATALOGO: titoli, prezzi, colori copertina, percorso dell'.exe
```

Per cambiare la UI modifichi solo i file in `src/`. Non serve ricompilare per vedere le modifiche durante lo sviluppo.

## Come provarla (Windows)

1. Installa [Node.js LTS](https://nodejs.org).
2. Nella cartella del progetto apri il terminale ed esegui:
   ```
   npm install
   npm start
   ```
3. Si apre la finestra del launcher. Ricarica con `Ctrl+R` dopo ogni modifica.

## Creare il file .exe

```
npm run build
```

Il file si trova in `dist/Nexus Launcher x.x.x.exe`. È portable: funziona senza installazione.

## Aggiungere un gioco

Apri `src/games.json` e aggiungi un blocco. Il campo `exe` è il percorso completo dell'eseguibile del gioco (usa `\\` nei percorsi Windows). Se lo lasci vuoto, il gioco risulta non installato.

## Note

- Il launcher avvia l'`.exe` indicato, ma non gestisce ancora download, installazioni o aggiornamenti.
- Lo "streaming cloud" è un segnaposto: per collegarlo a un servizio reale va scritta l'integrazione in `app.js`, nella funzione del pulsante `data-stream`.
- Per distribuirlo a terzi, valuta la firma del codice: senza firma Windows SmartScreen mostra un avviso.
