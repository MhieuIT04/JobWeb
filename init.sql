-- Initialize PostgreSQL database
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE recruitment_db TO recruitment_user;
