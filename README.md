# Progetto-PA Tic Tac Toe
Servizio back-end che permetta agli utenti di gestire il gioco Tic Tac Toe.

# Framework utilizzati:
-	tic-tac-toe-ai-engine https://www.npmjs.com/package/tic-tac-toe-ai-engine
-	Express
-	Sequelize
-	RDBMS (postgres)

# Obiettivi
- Creare una nuova partita, scegliendo se giocare contro un secondo utente o contro IA gestita da tic-tac-toe-ai-engine.
  Per ogni partita gestire token (credito):
  - addebitare 0,75 token per la creazione partita PVE;
  - addebitare 0.5 token per la creazione partita PVP (ad entrambi i giocatori);
  - addebitare 0.15 token ogni mossa effettuata;
- Rotta per effettuare una mossa, verificando se questa è ammissibile;
- Rotta per abbandonare una partita;
- Rotta per valutare lo stato di una partita;
- Rotta per restituire lo storico delle mosse di un giocatore;
- Rotta per restituire la classifica;
- Rotta per l’utente con ruolo admin che consenta di effettuare la ricarica per un utente fornendo la mail ed il nuovo “credito".

Le richieste devono essere validate, ogni utente autenticato (ovvero con JWT) ha un numero di token, nel caso di token terminati ogni richiesta da parte dello stesso utente deve restituire 401 Unauthorized.

# Rotte
| TIPO  | ROTTA | TOKEN JWT |
| ------------- | ------------- | --------------- |
| POST  | /admin  | SI |
| POST  | /newGame  | SI |
| POST  | /move  | SI |
| POST  | /aimove  | SI |
| GET | /moves-history  | SI |
| GET  | /status  | SI |
| POST  | /leave  | SI |
| GET  | /leaderboard  | NO |

## /admin
Permette all'utente di ruolo admin di poter ricaricare i token degli altri utenti. Esempio payload JWT per tale rotta, dest: email dell'utente il quale si vuole ricaricare il credito, token: credito, cAdmin: email dell'utente con il ruolo admin, cArole: specificare admin.
 `{
  "dest": "user1@example.com",
  "token": 7,
  "cAdmin": "user4@example.com",
  "cArole": "admin"
}`

## /newGame
Permette di creare una nuova partita. Per creare una partita PVP specificare nel payload JWT: dest: email primo giocatore, opponent: email secondo giocatore, gameType: pvp.
`{
  "dest": "user3@example.com",
  "opponent": “user2@example.com”,
  “gameType": “pvp”
}`
Per creare una partita PVE specificare nel payload JWT: dest: email giocatore, gameType: pve.
`{
  "dest": "user1@example.com",
  “gameType": “pve”
}`
Una volta creata la partita verranno sottratti gli eventuali token: 0.75 token per creazione partita PVE/ 0.50 token ad entrambi i giocatori per partita PVP.

## /move
Permette di effettuare la mossa ai giocatori. Specificare nel payload: dest: email utente che intende effettuare la mossa, gameid: ID della partita in cui si vuole effettuare la mossa, row: intero con riga dove si vuole effettuare la mossa, column: intero con colonna dove si vuole effettuare la mossa.
`{
  "dest": "user3@example.com",
  "gameid": "9897",
  "row": 2,
  "column": 0
}`
Una volta effettuata la mossa verranno addebitati 0.15 token a chi ha effettuato la mossa.

## /aimove
Rotta che fa effettuare all'intelligenza artificale la mossa, specificare nel payload JWT: dest: AI, gameid: id della partita
`{
  "dest": "AI",
  "gameid": "9897"
}`
Verranno addebitati 0.15 token al giocatore reale nella partita.

## /moves-history
Rotta che restituisce lo storico delle mosse effettuate da un giocatore in formato JSON, nel payload JWT si dichiarano: dest: email giocatore, order: asc/desc per determinare l'ordine delle mosse.
`{
  "dest": "user3@example.com",
  "order":"asc"
}`

## /status
Rotta che restituisce lo stato di una partita, indica game_id: id della partita, created: quando la partita è stata creata, gamestatus: lo status della partita (In Progress o Game Over), Turn: di chi è il turno, gametype: PVP/PVE, first_player_email: email del primo giocatore, second_player_email: email del secondo giocatore/AI, result: email del vincitore/Draw, wonbyleave: booleano che indica se qualcuno ha abbandonato. Il payload JWT sarà del tipo:
`{
  "gameid": "9855",
  "dest":"user2@example.com"
}`

## /leave
Rotta che permette di abbandonare una partita in corso. Payload JWT:
`{
  "gameid": "9855",
  "dest":"user2@example.com"
}`

## /leaderboard
Rotta che restituisce la classifica, indica id: id univoco utente, email: email dell'utente, gamesWon: partite vinte, gamesLost: partite perse, gamesDrawn: partite pareggiate. È possibile ordinare in ordine crescente o decrescente per numero di partite vinte. Non richiede payload JWT.

# Diagrammi UML
## Use case diagram
![Screenshot 2023-05-29 alle 11 03 07](https://github.com/cicciolodi11/Progetto-PA-tictactoe/assets/74373173/dcc57d05-bf46-4b3c-b67f-f1c6d6a363cb)
## Sequence diagram
- post /admin
![Screenshot 2023-05-29 alle 09 51 26](https://github.com/cicciolodi11/Progetto-PA-tictactoe/assets/74373173/6e98e1b0-1918-4019-a0ce-43a728fcd337)
- post /newGame
![Screenshot 2023-05-29 alle 10 09 33](https://github.com/cicciolodi11/Progetto-PA-tictactoe/assets/74373173/1cfc1db6-3ab3-44b5-8bdc-1edf7b50e895)
- get /moves-history
![Screenshot 2023-05-29 alle 10 16 13](https://github.com/cicciolodi11/Progetto-PA-tictactoe/assets/74373173/75e0c16b-2299-4394-b140-14446c63868c)
- get /status
![Screenshot 2023-05-29 alle 10 24 29](https://github.com/cicciolodi11/Progetto-PA-tictactoe/assets/74373173/17ba5db1-41ff-44b2-836c-80e833bbf423)
- post /leave
![Screenshot 2023-05-29 alle 10 38 02](https://github.com/cicciolodi11/Progetto-PA-tictactoe/assets/74373173/f9f375cf-3030-4d79-aa88-f22b89ef4dba)
- post /move
![Screenshot 2023-05-29 alle 10 46 13](https://github.com/cicciolodi11/Progetto-PA-tictactoe/assets/74373173/35ee156b-5bfa-48c1-b791-6d8a5f59a096)
- post /aimove
![Screenshot 2023-05-29 alle 10 46 13](https://github.com/cicciolodi11/Progetto-PA-tictactoe/assets/74373173/2bdf61a7-0eb1-4d92-9b25-b5fde6883ebe)
- get /leaderboard
![Screenshot 2023-05-29 alle 10 50 46](https://github.com/cicciolodi11/Progetto-PA-tictactoe/assets/74373173/0f204907-5eec-4514-a305-b7aabb18fc90)


