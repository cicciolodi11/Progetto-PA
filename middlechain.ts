import * as create from './middleware';
import * as auth from './middleauth'
require('dotenv').config({ path: 'dati.env' });

export const JWT = [
    auth.checkHeader, 
    auth.checkToken, 
    auth.verifyAndAuthenticate
  ];
  export const history = [
    create.checkUserExistence
  ];

  export const checkuser = [
    create.checkGameType,
    create.checkUserExistence,
    create.checkUserBalance
  ];


  export const checkgame = [
    create.checkUserExistence,
    create.checkGameExistence, 
    create.checkTurn,
    create.validateMove,
    create.checkMove,
  ];

  export const checkai = [
    create.checkUserExistence,
    create.checkGameExistence, 
    create.checkTurn
  ];

  export const checkstatusdelete = [
    create.checkUserExistence,
    create.checkGameExistence
  ];

  export const loadtoken = [
    create.checkAdmin,
    create.checkUserExistence,
    create.reloadnumber
  ]