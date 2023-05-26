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
