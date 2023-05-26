import { DataTypes, Model, Sequelize } from "sequelize";
import { SingletonDB } from "../singleton/sequelize";

const sequelize = SingletonDB.getInstance().getConnection();

export const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  token: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gamesWon: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  gamesLost: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  gamesDrawn: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
},
{
  timestamps: false,
});

export const Move = sequelize.define('moves', {
  move_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  row: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  column: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  movedate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
    timestamps: false,
});

export const Game = sequelize.define('games', {
  game_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  created: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  gamestatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  turn: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gametype: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  first_player_email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  second_player_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  result: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  wonbyleave: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
},{
    timestamps: false,
});

User.hasMany(Move, { foreignKey: 'email', sourceKey: 'email' });
Move.belongsTo(User, { foreignKey: 'email' });

Game.hasMany(Move, { foreignKey: 'game_id' });
Move.belongsTo(Game, { foreignKey: 'game_id' });

Game.belongsTo(User, { as: 'firstPlayer', foreignKey: 'first_player_email', targetKey: 'email' });
Game.belongsTo(User, { as: 'secondPlayer', foreignKey: 'second_player_email', targetKey: 'email' });

User.hasMany(Game, { foreignKey: 'first_player_email', sourceKey: 'email' });
User.hasMany(Game, { foreignKey: 'second_player_email', sourceKey: 'email' });