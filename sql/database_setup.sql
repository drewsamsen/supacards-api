-- =============================================
-- SUPACARDS API DATABASE SETUP
-- =============================================
-- This script contains all the necessary steps to set up the Supacards API database.
-- Run the steps in order to ensure proper database configuration.

-- =============================================
-- STEP 1: ENABLE UUID EXTENSION (IF NOT ALREADY ENABLED)
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- STEP 2: CREATE INITIAL TABLES
-- =============================================
-- Create decks table
CREATE TABLE IF NOT EXISTS decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cards table with deck_id reference
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  deck_id UUID NOT NULL REFERENCES decks(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 3: CREATE TRIGGERS FOR UPDATED_AT
-- =============================================
-- Create trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to decks table
DROP TRIGGER IF EXISTS update_decks_updated_at ON decks;
CREATE TRIGGER update_decks_updated_at
BEFORE UPDATE ON decks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to cards table
DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at
BEFORE UPDATE ON cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- =============================================
-- Create index on deck_id for faster queries
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);

-- Create index on archived status for faster filtering
CREATE INDEX IF NOT EXISTS idx_decks_archived ON decks(archived);

-- =============================================
-- STEP 5: ADD SLUG FUNCTIONALITY TO DECKS
-- =============================================
-- Create a unique index on the slug column
CREATE UNIQUE INDEX IF NOT EXISTS idx_decks_slug ON decks(slug);

-- Create a function to generate a unique slug from the deck name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT) 
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase and replace spaces with dashes
  base_slug := LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  
  -- Start with the base slug
  new_slug := base_slug;
  
  -- Check if the slug already exists, if so, append a number
  WHILE EXISTS (SELECT 1 FROM decks WHERE slug = new_slug) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate a slug when a deck is created or updated
CREATE OR REPLACE FUNCTION set_deck_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate a slug if one isn't provided or if the name has changed
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.name <> NEW.name AND NEW.slug = OLD.slug) THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to decks table for slug generation
DROP TRIGGER IF EXISTS generate_deck_slug ON decks;
CREATE TRIGGER generate_deck_slug
BEFORE INSERT OR UPDATE ON decks
FOR EACH ROW
EXECUTE FUNCTION set_deck_slug();

-- Update existing decks with slugs if they don't have one
UPDATE decks SET slug = generate_slug(name) WHERE slug IS NULL;

-- =============================================
-- STEP 6: ADD USER AUTHENTICATION SUPPORT
-- =============================================
-- Add user_id column to decks table
ALTER TABLE decks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);

-- Enable Row Level Security
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create policies for decks table
DROP POLICY IF EXISTS "Users can view their own decks" ON decks;
CREATE POLICY "Users can view their own decks" 
ON decks FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own decks" ON decks;
CREATE POLICY "Users can insert their own decks" 
ON decks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own decks" ON decks;
CREATE POLICY "Users can update their own decks" 
ON decks FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own decks" ON decks;
CREATE POLICY "Users can delete their own decks" 
ON decks FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for cards table
DROP POLICY IF EXISTS "Users can view cards in their decks" ON cards;
CREATE POLICY "Users can view cards in their decks" 
ON cards FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM decks 
    WHERE decks.id = cards.deck_id 
    AND decks.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert cards in their decks" ON cards;
CREATE POLICY "Users can insert cards in their decks" 
ON cards FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM decks 
    WHERE decks.id = cards.deck_id 
    AND decks.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update cards in their decks" ON cards;
CREATE POLICY "Users can update cards in their decks" 
ON cards FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM decks 
    WHERE decks.id = cards.deck_id 
    AND decks.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete cards in their decks" ON cards;
CREATE POLICY "Users can delete cards in their decks" 
ON cards FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM decks 
    WHERE decks.id = cards.deck_id 
    AND decks.user_id = auth.uid()
  )
);

-- =============================================
-- STEP 7: DATA MIGRATION (UNCOMMENT AND MODIFY AS NEEDED)
-- =============================================
-- IMPORTANT: The following steps should be uncommented and run only when you're ready to migrate data.
-- Make sure to replace placeholders with actual values.

-- -- Create a default deck for existing cards (if needed)
-- INSERT INTO decks (name, user_id) 
-- VALUES ('Default Deck', 'YOUR_DEFAULT_USER_ID')
-- RETURNING id;
-- -- Note the returned ID and use it in the next step

-- -- Update existing cards to use the default deck (if needed)
-- UPDATE cards SET deck_id = 'YOUR_DEFAULT_DECK_ID' WHERE deck_id IS NULL;

-- -- Update existing decks to assign them to a default user (if needed)
-- UPDATE decks SET user_id = 'YOUR_DEFAULT_USER_ID' WHERE user_id IS NULL;

-- -- Make user_id NOT NULL after migrating existing data (if needed)
-- ALTER TABLE decks ALTER COLUMN user_id SET NOT NULL;

-- =============================================
-- STEP 8: VERIFICATION QUERIES
-- =============================================
-- Uncomment these queries to verify your setup

-- -- Check table structure
-- \d decks
-- \d cards

-- -- Check if triggers are set up correctly
-- SELECT * FROM pg_trigger WHERE tgrelid = 'decks'::regclass;
-- SELECT * FROM pg_trigger WHERE tgrelid = 'cards'::regclass;

-- -- Check if RLS policies are set up correctly
-- SELECT * FROM pg_policies WHERE tablename = 'decks';
-- SELECT * FROM pg_policies WHERE tablename = 'cards'; 