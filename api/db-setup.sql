CREATE ROLE gameralert WITH LOGIN PASSWORD 'password here';

CREATE DATABASE gameralertapi;
\c gameralertapi;

CREATE TABLE servers (
    server_id BIGINT NOT NULL PRIMARY KEY,
    alert_webhook VARCHAR(255),
    alert_image_url VARCHAR(255)
);

CREATE TABLE users (
    discord_id BIGINT NOT NULL PRIMARY KEY,
    league_username VARCHAR(16) UNIQUE,
    time_limit INT,
    time_zone VARCHAR(255)
);

CREATE TABLE user_servers (
    discord_id BIGINT NOT NULL,
    server_id BIGINT NOT NULL,
    FOREIGN KEY (discord_id) REFERENCES users(discord_id),
    FOREIGN KEY (server_id) REFERENCES servers(server_id)
);

CREATE TABLE sessions (
    id VARCHAR(16) NOT NULL PRIMARY KEY,
    discord_id BIGINT NOT NULL,
    start_time BIGINT NOT NULL,
    end_time BIGINT,
    FOREIGN KEY (discord_id) REFERENCES users(discord_id)
);

CREATE TABLE games (
    id VARCHAR(16) NOT NULL PRIMARY KEY,
    match_id BIGINT NOT NULL,
    game_type VARCHAR(32) NOT NULL,
    start_time BIGINT NOT NULL,
    end_time BIGINT,
    kills INT,
    deaths INT,
    assists INT,
    cs INT,
    win BOOLEAN,
    champion VARCHAR(32) NOT NULL,
    session_id VARCHAR(16) NOT NULL,
    champion_picture VARCHAR(32),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE game_jobs(
    id VARCHAR(16) NOT NULL PRIMARY KEY,
    match_id BIGINT NOT NULL,
    league_name VARCHAR(16) NOT NULL,
    game_id VARCHAR(16) NOT NULL,
    discord_id BIGINT NOT NULL,
    FOREIGN KEY (discord_id) REFERENCES users(discord_id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE days(
    timestamp BIGINT NOT NULL,
    discord_id BIGINT NOT NULL,
    play_time INT NOT NULL,
    time_limit INT NOT NULL,
    time_exceeded BOOLEAN DEFAULT false NOT NULL,
    FOREIGN KEY (discord_id) REFERENCES users(discord_id)
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gameralert;
