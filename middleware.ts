import { User, Game, Move } from "../model/model";
import * as express from 'express';
import { Sequelize } from 'sequelize';
import * as Controller from '../controller'
import * as jwt from 'jsonwebtoken';
require('dotenv').config({ path: 'dati.env' });

//Middleware per il controllo del tipo di Partita: PVE o PVP
export function checkGameType(req: any, res: any, next: any) {
    const gameType = req.body.gameType;
  
    if (gameType === "pve") {
      next();
    } else if (gameType === "pvp") {
      checkOpponentExistence(req, res, () => {
        checkOpponentBalance(req, res, next);
      });
    } else {
      res.status(400).send("Invalid game type");
    }
  }

  //Middleware che controlla l'esistenza dell'utente immesso "dest:"
  export function checkUserExistence(req: any, res: any, next: any) : void {
    Controller.checkUserExistence(req.body.dest, res).then((check) => {
        if(check) next();
        else next(res.status(401));
    });
}

  //Middleware che controlla l'esistenza dell'avversario immesso "opponent:"
export function checkOpponentExistence(req: any, res: any, next: any) : void {
    Controller.checkUserExistence(req.body.opponent, res).then((check) => {
        if(check) next();
        else next(res.status(401));
    });
}  

  //Middleware che controlla se il credito token dell'utente immesso "dest:" sia abbastanza per creare la partita PVP o PVE
export function checkUserBalance(req: any, res: any, next: any): void {
    Controller.checkBalance(req.body.dest, req.body.gameType, res)
      .then((check) => {
        if (check) {
          next();
        } else {
          res.status(401).send("Insufficient balance");
        }
      })
      .catch((error) => {
        res.status(500).send("Errore durante il controllo del bilancio utente");
      });
  }

//Middleware che controlla se il credito token dell'utente immesso "dest:" sia abbastanza per creare la partita PVP
export function checkOpponentBalance(req: any, res: any, next: any): void {
    Controller.checkBalance(req.body.opponent, req.body.gameType, res).then((check) => {
        if(check) next();
        else next(res.sendStatus(401));
    })
}

//Middleware che controlla prima che l'utente esiste e poi controlla se il role dell'utente dentro User ria admin
export function checkAdmin(req, res, next): void {
    Controller.checkUserExistence(req.body.cAdmin, res).then((check) => {
        if(check) {
            Controller.getRole(req.body.cAdmin, res).then((role: string) => {
                if(role == 'admin' && req.body.cArole == 'admin') next()
                else next(res.sendStatus(401));
            });
        } else res.sendStatus(404)
    });
}

//Middleware per controllare se il token immesso sia un numero
export function reloadnumber(req, res, next): void {
    if (typeof req.body.token != 'number') next(res.sendStatus(400));
    else next();
}

//Middleware per controllare l'esistenza della partita "gameid: "
export function checkGameExistence(req, res, next) : void {
    Controller.checkGameExistence(req.body.gameid, res).then((check) => {
        if(check) next();
        else res.sendStatus(401);
    });
}

//Middleware per controllare il turno nella partita immesso "gameid:"
export function checkTurn(req, res, next) : void {
    Controller.getTurn(req.body.gameid, res).then((turn: string) => {
        if(turn == req.body.dest) next()
        else res.sendStatus(401);
    });
}

//Middleware per controllare la validità della mossa "row: " e "column: " nel gioco "gameid: "
export function checkMove(req, res, next) : void {
    Controller.isMoveValid(req.body.gameid, req.body.row,req.body.column, res).then((isValid: boolean) => {
        if(isValid) next()
        else res.sendStatus(401);
    });
}

//Middleware per verificare che colonna e riga inseriti in payload siano appropriati
export function validateMove(req, res, next) : void {
    const { row, column } = req.body;
    if (row < 0 || row >= 3 || column < 0 || column >= 3) {
        res.status(400).send("Invalid row or column");
        return;
      }
      next();
};
