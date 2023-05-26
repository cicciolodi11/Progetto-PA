import { Request, Response } from 'express';
const sequelize = require('sequelize');
import { User, Game, Move } from './model/model';
import * as ticTacToeAiEngine from "tic-tac-toe-ai-engine";

let tokenpartita: Map<string, number> = new Map();
tokenpartita.set("pvp", 0.5); 
tokenpartita.set("pve", 0.75);

//Funzione che controlla se un utente esiste o meno dato in input email
export async function checkUserExistence(email: string, res: any): Promise<boolean>{
  let result: any;
  try{
      result = await User.findOne({ where: { email }, raw: true });
  }catch(error){
    res.sendStatus(500);
  }
  return result;
};

//Funzione che controlla se una partita esiste o meno dato in input game_id
export async function checkGameExistence(game_id: string, res: any): Promise<boolean>{
  let result: any;
  try{
      result = await Game.findOne({ where: { game_id }, raw: true });
  }catch(error){
    res.sendStatus(500);
  }
  return result;
};

//Funzione che data la mail di un utente controlla se ha token sufficienti per cominciare una partita (PVP o PVE)
export async function checkBalance(email: string, gameType: string, res: Response): Promise<boolean>{
  let result: any;
  try{
      result = await User.findOne({ where: { email }, raw: true });
      console.log(result);
  }catch(error){
  }
  if (result.token >= tokenpartita.get(gameType)) {
    return true;
  } else {
    return false;
  }
};




//Funzione che crea partita contro l'intelligenza artificiale dando in input email giocatore
export async function createPveGame(req, res) {
  try {
    const gameId = await generateUniqueGameId();
    const player: User = await User.findOne({
      where: { email: req.body.dest }
    });

    const updatedPlayerToken = (parseFloat(player.token) - 0.75).toFixed(2);
    await User.update(
      { token: updatedPlayerToken },
      { where: { email: player.email } }
    );

    const savedGame: Game = await Game.create({
      game_id: gameId,
      created: new Date(),
      gamestatus: 'In progress',
      turn: player.email,
      gametype: 'ai',
      first_player_email: player.email,
      second_player_email: 'AI' // Specifica l'IA come secondo giocatore
    });

    res.status(200).json({
      id: savedGame.id,
      message: `AI vs. Player game created, it's ${player.email}'s turn.`,
    });
  } catch (error) {
    console.error('Error creating AI vs. Player game:', error);
    res.status(500).send('Internal server error');
  }
}

//Funzione che crea partita PVP
export async function createPvpGame(req, res) {
  try {
    const gameId = await generateUniqueGameId();
    const firstPlayer: User = await User.findOne({
      where: { email: req.body.dest }
    });
    const secondPlayer: User = await User.findOne({
      where: { email: req.body.opponent }
    });
    const updatedFirstPlayerToken = (parseFloat(firstPlayer.token) - 0.50).toFixed(2);
      await User.update(
        { token: updatedFirstPlayerToken },
        { where: { email: firstPlayer.email } });

    const updatedSecondPlayerToken = (parseFloat(secondPlayer.token) - 0.50).toFixed(2);
      await User.update(
        { token: updatedSecondPlayerToken },
        { where: { email: secondPlayer.email } });

    const savedGame: Game = await Game.create({
      game_id: gameId,
      created: new Date(),
      gamestatus: "In progress",
      turn: firstPlayer.email,
      gametype: "pvp",
      first_player_email: firstPlayer.email,
      second_player_email: secondPlayer.email, 
    });
    
    res.status(200).json({
      id: savedGame.id,
      message: `PVP game created, it's ${firstPlayer.email}'s turn.`,
    });
  } catch (error) {
    console.error("Error creating PVP game:", error);
    res.status(500).send("Internal server error");
  }
}

//Funzione che effettua la mossa, input per la funzione: email del giocatore che vuole effettuare la mossa, id della partita dove vuole
//effettuare la mossa e riga e colonna della tabella, la funzione poi controlla se la mossa è vincente o si può proseguire
export async function makeMove(req: Request, res: Response) {
  try {
    const moveId = await generateUniqueMoveId();
    const player: User = await User.findOne({
      where: { email: req.body.dest }
    });
    
    const updatedToken = (parseFloat(player.token) - 0.15).toFixed(2);
    await User.update(
      { token: updatedToken },
      { where: { email: player.email } }
    );

    const moves  = await Move.findAll({
      where: { game_id: req.body.gameid },
      attributes: ['row', 'column', 'email']
    });

    const gameState = Array(3).fill('').map(() => Array(3).fill(''));
    moves.forEach((move) => {
      const row = move.getDataValue('row');
      const column = move.getDataValue('column');
      const playerSymbol = move.getDataValue('email') === player.email ? 'X' : 'O';
      gameState[row][column] = playerSymbol;
    });

    const row = req.body.row;
    const column = req.body.column;

    await Move.create({
      move_id: moveId,
      movedate: new Date(),
      email: player.email,
      row: row,
      column: column,
      game_id: req.body.gameid
    });

    const gameResult = await checkWin(req.body.gameid);
    if (gameResult) {
      if (gameResult.isDraw) {
        await Game.update(
          { gamestatus: 'Game over', result: 'Draw' },
          { where: { game_id: req.body.gameid } }
        );
        await syncGameResultWithUserStats(req.body.gameid);
        return res.json({ message: 'Round draw', gameState: gameState });
      } else {
        await Game.update(
          { gamestatus: 'Game over', result: player.email, wonbyleave: false },
          { where: { game_id: req.body.gameid } }
        );
        gameState[row][column] = 'X';
        await syncGameResultWithUserStats(req.body.gameid);
        return res.json({ message: 'Match ended', gameState: gameState });
      }
    } else {
      gameState[row][column] = 'X'; // Aggiorna la mossa del giocatore corrente nella tabella di gioco
      await changeTurn(req.body.gameid);
      return res.json({ message: 'Move completed', gameState: gameState });
    }
  } catch (error) {
    console.error('Error making move:', error);
    res.status(500).send('Internal server error');
  }
}

export async function makeAIMove(req: Request, res: Response) {
  try {
    const moveId = await generateUniqueMoveId();
    const game: Game = await Game.findOne({
      where: { game_id: req.body.gameid }
    });

    const player: User = await User.findOne({
      where: { email: game.first_player_email }
    });

    const updatedToken = (parseFloat(player.token) - 0.15).toFixed(2);
    await User.update(
      { token: updatedToken },
      { where: { email: player.email } }
    );
    const moves = await Move.findAll({
      where: { game_id: req.body.gameid }
    });

    const gameState = Array(3).fill('').map(() => Array(3).fill(''));
    moves.forEach((move) => {
      const row = move.getDataValue('row');
      const column = move.getDataValue('column');
      const playerSymbol = move.getDataValue('email') === 'AI' ? 'O' : 'X';
      gameState[row][column] = playerSymbol;
    });

    const aiMove = ticTacToeAiEngine.computeMove(gameState);

    if (aiMove && aiMove.nextBestGameState) {
      const nextBestGameState = aiMove.nextBestGameState;
      let row = -1;
      let column = -1;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (nextBestGameState[i][j] === '') {
            row = i;
            column = j;
            break;
          }
        }
        if (row !== -1 && column !== -1) {
          break;
        }
      }

      if (row !== -1 && column !== -1) {
        await Move.create({
          move_id: moveId,
          movedate: new Date(),
          email: 'AI',
          row: row,
          column: column,
          game_id: req.body.gameid
        });

        const gameResult = await checkWin(req.body.gameid);
        if (gameResult) {
          if (gameResult.isDraw) {
            await Game.update(
              { gamestatus: 'Game over', result: 'Draw' },
              { where: { game_id: req.body.gameid } }
            );
            await syncGameResultWithUserStats(req.body.gameid);
            return res.json({ message: 'Round draw', gameState: gameState });
          } else {
            await Game.update(
              { gamestatus: 'Game over', result: player.email, wonbyleave: false },
              { where: { game_id: req.body.gameid } }
            );
            await syncGameResultWithUserStats(req.body.gameid);
            return res.json({ message: 'Match ended', gameState: gameState });
          }
        } else {
          gameState[row][column] = 'O'; // Aggiorna la mossa del giocatore corrente nella tabella di gioco
          await changeTurn(req.body.gameid);
          return res.json({ message: 'Move completed', gameState: gameState });
        }
      } else {
        console.error('Invalid AI Move:', aiMove);
        throw new Error('Invalid AI Move');
      }
    } else {
      console.error('Invalid AI Move:', aiMove);
      throw new Error('Invalid AI Move');
    }
  } catch (error) {
    console.error('Error making AI move:', error);
    res.status(500).send('Internal server error');
  }
}


//Funzione che dato in input gameid e email del giocatore permette a quest'ultimo di abbandonare la partita
export async function abandonGame(req, res) {
   try {
    const userEmail = req.body.dest;
    const gameId = req.body.gameid;
    const game: Game = await Game.findByPk(gameId);
    const winnerEmail = game.first_player_email === userEmail ? game.second_player_email : game.first_player_email;

    await Game.update(
      { gamestatus: "Game over", result: winnerEmail, wonbyleave: true},
      { where: { game_id: gameId } }
    );

    res.status(200).json({ message: `You left the game. Winner is: ${winnerEmail}.` });
  } catch (error) {
    console.error("Error abandoning game:", error);
    res.status(500).send("Internal server error");
  }
}

//Funzione che dato in input gameid restituisce lo status della partita
export function gameStatus(gameId: number, res: any): void {
  Game.findByPk(gameId).then((game: Game) => {
      if (game) {
        const gameStatus = {
          game_id: game.game_id,
          created: game.created,
          gamestatus: game.gamestatus,
          turn: game.turn,
          gametype: game.gametype,
          first_player_email: game.first_player_email,
          second_player_email: game.second_player_email,
          result: game.result,
          wonbyleave: game.wonbyleave
        };


        res.status(200).json(gameStatus);
      } else {
        res.status(404).json({ message: 'Game not found' });
      }
    })
    .catch((error) => {
      console.error('Error retrieving game status:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
}

//Funzione che restituisce lo storico delle mosse di un giocatore (tramite email di questo), è possibile anche
//scegliere l'ordine (decrescente o crescente) delle mosse
export function movesHistory(email, order: 'asc' | 'desc', res): void {
  Move.findAll({where: { email }, order: [['movedate', order]],raw: true}).then((moves: any[]) => {
      res.json(moves);
    }).catch((error) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });
}

//Funzione che permette di controllare il ruolo degli utenti nella tabella User
export async function getRole(email, res): Promise<string> {
  let result: any;
  try{
      result = await User.findOne({ where: { email }, raw: true });
  }catch(error){
    console.error("Error retreiving role:", error);
    res.status(500).send("Internal server error");
  }
  return result.role;
}

//Funzione che permette di controllare dentro la tabella Game se è il turno dell'utente che richiede di effettuare la mossa
export async function getTurn(game_id: string, res: any): Promise<string> {
  let result: any;
  try{
      result = await Game.findOne({ where: { game_id }, raw: true });
  }catch(error){
    console.error("Error retreiving turn:", error);
    res.status(500).send("Internal server error");
  }
  return result.turn;
}

//Funzione che permette di controllare se la mossa è stata già effettuata nella partita 
export async function isMoveValid(game_id, row, column, res): Promise<boolean> {
  let result: any;
  try{
      result = await Move.findOne({ where: {game_id, row, column}});
      return result === null;
  }catch(error){
    console.error("Error retreiving coordinates:", error);
    res.status(500).send("Internal server error");
  }
}


//Funzione che dato in input una email permette di ricaricare i token di tale email, assegnando un nuovo valore di token
export function tokenreload(dest, token, res): void {
  User.update({token: token}, {where: {email: dest}}).then(() => {
    res.sendStatus(200);
  }).catch((error) => {
    console.error("Error reloading token:", error);
    res.status(500).send("Internal server error");
    });
}


//Funzione per generare casualmente un GameId per la fase di creazione partita
async function generateUniqueGameId() {
  const min = 5000;
  const max = 9999;
  let gameId = Math.floor(Math.random() * (max - min + 1)) + min;
  const existingGame = await Game.findOne({
    where: { game_id: gameId },
  });
  if (existingGame) {
    return generateUniqueGameId();
  }
  return gameId;
}

//Funzione per generare casualmente un MoveId per la fase di creazione partita
async function generateUniqueMoveId() {
  const min = 1000;
  const max = 4999;
  let moveId = Math.floor(Math.random() * (max - min + 1)) + min;
  const existingMove = await Move.findOne({
    where: { move_id: moveId },
  });
  if (existingMove) {
    return generateUniqueMoveId();
  }
  return moveId;
}

//Funzione per gestire il cambio di turno nella tabella Game in fase di mossa
export function changeTurn(gameId: number) {
  return Game.findByPk(gameId).then((game: Game | null) => {
      if (game) {
        const currentTurn = game.turn;
        const nextTurn = currentTurn === game.first_player_email ? game.second_player_email : game.first_player_email;

        return game.update({ turn: nextTurn });
      } else {
        throw new Error('Game not found');
      }
    });
}

/*Funzione che controlla se la mossa effettuata è vincente, prima recupera tutte le mosse relative al gioco specificato
poi controlla se sono state fatte abbastanza mosse per una possibile vittoria */
async function checkWin(gameId) {
  try {
    const moves = await Move.findAll({
      where: { game_id: gameId },
      order: [['movedate', 'ASC']]
    });

    if (moves.length >= 5) {
      const gameBoard = Array.from(Array(3), () => Array(3).fill(null));

      moves.forEach(move => {
        console.log(move)
        const { row, column, email: player_id } = move.dataValues;
        gameBoard[row][column] = player_id;
        console.log(`Assigning player ${player_id} to row ${row}, column ${column}`);
      });

      // Controlla se c'è una vittoria in una riga
      for (let i = 0; i < 3; i++) {
        if (
          gameBoard[i][0] !== null &&
          gameBoard[i][0] === gameBoard[i][1] &&
          gameBoard[i][0] === gameBoard[i][2]
        ) {
          return { winner: gameBoard[i][0], isDraw: false };
        }
      }

      // Controlla se c'è una vittoria in una colonna
      for (let j = 0; j < 3; j++) {
        if (
          gameBoard[0][j] !== null &&
          gameBoard[0][j] === gameBoard[1][j] &&
          gameBoard[0][j] === gameBoard[2][j]
        ) {
          return { winner: gameBoard[0][j], isDraw: false };
        }
      }

      // Controlla se c'è una vittoria in diagonale (alto sinistra -> basso destra)
      if (
        gameBoard[0][0] !== null &&
        gameBoard[0][0] === gameBoard[1][1] &&
        gameBoard[0][0] === gameBoard[2][2]
      ) {
        return { winner: gameBoard[0][0], isDraw: false };
      }

      // Controlla se c'è una vittoria in diagonale (alto destra -> basso sinistra)
      if (
        gameBoard[0][2] !== null &&
        gameBoard[0][2] === gameBoard[1][1] &&
        gameBoard[0][2] === gameBoard[2][0]
      ) {
        return { winner: gameBoard[0][2], isDraw: false };
      }

      // Se non ci sono vincitori e tutte le celle sono piene, è un pareggio
      if (moves.length === 9) {
        return { winner: null, isDraw: true };
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking win condition:', error);
    throw error;
  }
}

//Funzione che si occupa di restuire in output JSON la classifica, è possibile scegliere l'ordine delle vittorie
//tramite ?order=desc o ?order=asc
export async function getLeaderboard(req, res) {
  try {
    const order = req.query.order === 'desc' ? 'DESC' : 'ASC';

    const leaderboard: User = await User.findAll({
      attributes: ['id', 'email', 'gamesWon', 'gamesLost', 'gamesDrawn'],
      order: [['gamesWon', order]],
    });

    res.json({ leaderboard });
  } catch (error) {
    console.error('Error retrieving leaderboard:', error);
    res.status(500).send('Internal server error');
  }
}

//Funzione che sincronizza l'esito della partita ottenuto dopo la vittoria o pareggio con la tabella User
export async function syncGameResultWithUserStats(gameId: number) {
  try {
    const game: Game = await Game.findByPk(gameId);
    if (game) {
      const result = game.result;
      const firstPlayerEmail = game.first_player_email;
      const secondPlayerEmail = game.second_player_email;

      if (result === 'Draw') {
        await User.increment('gamesDrawn', { where: { email: [firstPlayerEmail, secondPlayerEmail] } });
      } else if (result !== null) {
        const loserEmail = result === firstPlayerEmail ? secondPlayerEmail : firstPlayerEmail;
        await User.increment('gamesWon', { where: { email: result } });
        await User.increment('gamesLost', { where: { email: loserEmail } });
      }
    }
  } catch (error) {
    console.error('Error syncing game result with user stats:', error);
    throw error;
  }
}