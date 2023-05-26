import * as jwt from "jsonwebtoken";
import * as sql from "sequelize";
import { SingletonDB } from "../singleton/sequelize";
import * as User from "../model/model";
require('dotenv').config({ path: 'dati.env' });


export function checkHeader (req: any, res: any, next: any): void{
  if (req.headers.authorization) next();
  else next(res.sendStatus(401));
}

export function checkToken(req, res, next): void{
  const bearerHeader: string = req.headers.authorization;
  if (typeof bearerHeader !== 'undefined'){
      const bearerToken: string = bearerHeader.split(' ')[1];
      req.token = bearerToken;
      next();
  } else next(res.sendStatus(401));
}

export function verifyAndAuthenticate(req, res, next): void{
  try {
      const decoded: string | jwt.JwtPayload  = jwt.verify(req.token, process.env.SECRET_KEY);
      if (decoded != null) {
          req.body = decoded;
          next();
      }
  } catch (error) { 
      next(res.sendStatus(401)); 
  }
}

