-- This script is for migrating an existing cards table to work with decks
-- Only run this if you already have a cards table with data you want to preserve

-- First, create a default deck for existing cards
INSERT INTO decks (name) 
VALUES ('Default Deck')
RETURNING id;

-- Store the ID of the default deck (you'll need to manually copy this ID from the result)
-- For example: SET default_deck_id = '123e4567-e89b-12d3-a456-426614174000';

-- Check if deck_id column exists in cards table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'deck_id'
  ) THEN
    -- Add deck_id column if it doesn't exist
    ALTER TABLE cards ADD COLUMN deck_id UUID REFERENCES decks(id);
    
    -- Update all existing cards to use the default deck
    -- Replace 'YOUR_DEFAULT_DECK_ID' with the actual UUID from the INSERT above
    UPDATE cards SET deck_id = 'YOUR_DEFAULT_DECK_ID';
    
    -- Make deck_id NOT NULL after all records have been updated
    ALTER TABLE cards ALTER COLUMN deck_id SET NOT NULL;
  END IF;
END $$; 