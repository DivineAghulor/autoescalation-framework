-- Seed data for teams and features
-- Run this after the schema migration

-- Insert teams
INSERT INTO teams (name) VALUES
('DASHBOARD'),
('TRADING_API_3_0'),
('BASQET'),
('AXECRAFT'),
('RAMP');

-- Insert features (adjust based on actual features for each team)
-- DASHBOARD features
INSERT INTO features (name, team_id) VALUES
('Login', (SELECT id FROM teams WHERE name = 'DASHBOARD')),
('Dashboard Overview', (SELECT id FROM teams WHERE name = 'DASHBOARD')),
('User Management', (SELECT id FROM teams WHERE name = 'DASHBOARD'));

-- TRADING_API_3_0 features
INSERT INTO features (name, team_id) VALUES
('Order Placement', (SELECT id FROM teams WHERE name = 'TRADING_API_3_0')),
('Market Data', (SELECT id FROM teams WHERE name = 'TRADING_API_3_0')),
('Portfolio Management', (SELECT id FROM teams WHERE name = 'TRADING_API_3_0'));

-- BASQET features
INSERT INTO features (name, team_id) VALUES
('Basket Creation', (SELECT id FROM teams WHERE name = 'BASQET')),
('Basket Execution', (SELECT id FROM teams WHERE name = 'BASQET'));

-- AXECRAFT features
INSERT INTO features (name, team_id) VALUES
('Crafting Interface', (SELECT id FROM teams WHERE name = 'AXECRAFT')),
('Asset Trading', (SELECT id FROM teams WHERE name = 'AXECRAFT'));

-- RAMP features
INSERT INTO features (name, team_id) VALUES
('On-Ramp', (SELECT id FROM teams WHERE name = 'RAMP')),
('Off-Ramp', (SELECT id FROM teams WHERE name = 'RAMP'));