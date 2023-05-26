DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS moves;
DROP TABLE IF EXISTS games;

CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  token FLOAT NOT NULL,
  role VARCHAR(255) NOT NULL,
  gamesWon INT DEFAULT 0,
  gamesLost INT DEFAULT 0,
  gamesDrawn INT DEFAULT 0
);

CREATE TABLE moves (
  move_id INT PRIMARY KEY,
  row INT NOT NULL,
  column INT NOT NULL,
  movedate DATETIME NOT NULL
);

CREATE TABLE games (
  game_id INT PRIMARY KEY,
  created DATETIME NOT NULL,
  gamestatus VARCHAR(255) NOT NULL,
  turn VARCHAR(255) NOT NULL,
  gametype VARCHAR(255) NOT NULL,
  first_player_email VARCHAR(255) NOT NULL,
  second_player_email VARCHAR(255),
  result VARCHAR(255),
  wonbyleave BOOLEAN
);

INSERT INTO users (id, email, token, role, gamesWon, gamesLost, gamesDrawn)
VALUES
  (0, 'AI', 10, 'user', 1, 1, 1),
  (1, 'user1@example.com', 8, 'user', 1, 3, 1),
  (2, 'user2@example.com', 5, 'user', 4, 1, 1),
  (3, 'user3@example.com', 6, 'user', 5, 0, 3),
  (4, 'user4@example.com', 7, 'admin', 2, 2, 0);

INSERT INTO moves (move_id, row, column, movedate, email)
VALUES
  (10001, 1, 2, NOW(), 'user1@example.com'),
  (10002, 2, 3, NOW(), 'user2@example.com'),
  (10003, 3, 1, NOW(), 'user3@example.com'),
  (10004, 2, 2, NOW(), 'user4@example.com');

INSERT INTO games (game_id, created, gamestatus, turn, gametype, first_player_email, second_player_email, result)
VALUES
  (5001, NOW(), 'Game over', 'user3@example.com', 'pvp', 'user3@example.com', 'user2@example.com', 'user2@example.com'),
  (5002, NOW(), 'Game over', 'user3@example.com', 'pvp', 'user3@example.com', 'user2@example.com', 'user2@example.com'),
  (5003, NOW(), 'Game over', 'user3@example.com', 'pvp', 'user3@example.com', 'user2@example.com', 'user3@example.com'),
  (5004, NOW(), 'Game over', 'user3@example.com', 'pvp', 'user3@example.com', 'user2@example.com', 'Draw');
