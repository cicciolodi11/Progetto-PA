import express, { Request, Response } from 'express';
import * as cont from './controller';
import * as auth from "./middleware/middlechain";
import * as create from './middleware/middleware'
import { Game, Move, User } from "./model/model"
const sequelize = require('sequelize');

export const router = express();
const PORT = 3000;

router.use(express.json());


router.post("/admin", auth.JWT, auth.loadtoken, 
  async (req, res) => {
    cont.tokenreload(req.body.dest, req.body.token, res);
  }
);

router.post("/newGame", auth.JWT, auth.checkuser, (req, res) => {
  const gameType = req.body.gameType;
  if (gameType === "pve") {
    cont.createPveGame(req, res); // Funzione per creare la partita PVE
  } else if (gameType === "pvp") {
    cont.createPvpGame(req, res); // Funzione per creare la partita PVP
  } else {
    res.status(400).send("Invalid game type");
  }
});


router.post('/riempi-tabelle', async (req: Request, res: Response) => {
  try {
    // Dati per la tabella User
    const usersData = [
      { id: '0', email: 'AI', token: 10, role: 'user' },
      { id: '1', email: 'user1@example.com', token: 8, role: 'user' },
      { id: '2', email: 'user2@example.com', token: 5, role: 'user' },
      { id: '3', email: 'user3@example.com', token: 6, role: 'user' },
      { id: '4', email: 'user4@example.com', token: 7, role: 'admin' },
    ];

    // Dati per la tabella Move
    const movesData = [
      { move_id: '10001', row: 1, column: 2, movedate: new Date(), email: 'user1@example.com'},
      { move_id: '10002', row: 2, column: 3, movedate: new Date(), email: 'user2@example.com'},
      { move_id: '10003', row: 3, column: 1, movedate: new Date(), email: 'user3@example.com'},
      { move_id: '10004', row: 2, column: 2, movedate: new Date(), email: 'user4@example.com'},
    ];

    // Dati per la tabella Game
    const gamesData = [
      { game_id: '5001', created: new Date(), gamestatus: 'Game over', turn: 'player1', gametype: 'pvp', first_player_email: "user3@example.com", second_player_email: "user2@example.com", result: "user2@example.com" },
      { game_id: '5002', created: new Date(), gamestatus: 'Game over', turn: 'player2', gametype: 'pvp', first_player_email: "user3@example.com", second_player_email: "user2@example.com", result: "user2@example.com" },
      { game_id: '5003', created: new Date(), gamestatus: 'Game over', turn: 'player1', gametype: 'pvp', first_player_email: "user3@example.com", second_player_email: "user2@example.com", result: "user3@example.com" },
      { game_id: '5004', created: new Date(), gamestatus: 'Game over', turn: 'player2', gametype: 'pvp', first_player_email: "user3@example.com", second_player_email: "user2@example.com", result: "Draw" },
    ];

    // Inserisci i dati nelle rispettive tabelle
    await User.bulkCreate(usersData);
    await Move.bulkCreate(movesData);
    await Game.bulkCreate(gamesData);

    res.status(200).send('Dati inseriti con successo');
  } catch (error) {
    console.error('Errore durante l\'inserimento dei dati:', error);
    res.status(500).send('Errore durante l\'inserimento dei dati');
  }
});

router.post('/crea', async (req: Request, res: Response) => {
  try {
    // Sincronizza i modelli con il database
    await User.sync();
    await Move.sync();
    await Game.sync();

    res.status(200).send('Database inizializzato con successo');
  } catch (error) {
    console.error('Errore durante linizializzazione del database:', error);
    res.status(500).send('Errore durante linizializzazione del database');
  }
});

router.get('/moves-history', auth.JWT, auth.history, (req, res) => {
  cont.movesHistory(req.body.dest, req.body.order, res);
});

router.get('/status', auth.JWT, auth.checkstatusdelete, (req, res) => {
  cont.gameStatus(req.body.gameid, res);
});

router.post("/leave", auth.JWT, auth.checkstatusdelete, (req, res) => {
  cont.abandonGame(req, res);
});

router.get("/leaderboard", cont.getLeaderboard);

router.post("/move", auth.JWT, auth.checkgame, (req, res) => {
  cont.makeMove(req, res)
});

router.post("/aimove", auth.JWT, auth.checkgame, (req, res) => {
  cont.makeAIMove(req, res)
});