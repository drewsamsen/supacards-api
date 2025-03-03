-- Add user_id column to decks table
ALTER TABLE decks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index on user_id for better query performance
CREATE INDEX idx_decks_user_id ON decks(user_id);

-- Update RLS (Row Level Security) policies for decks table
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- Create policies for decks table
CREATE POLICY "Users can view their own decks" 
ON decks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decks" 
ON decks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" 
ON decks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" 
ON decks FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for cards table
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cards in their decks" 
ON cards FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM decks 
    WHERE decks.id = cards.deck_id 
    AND decks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert cards in their decks" 
ON cards FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM decks 
    WHERE decks.id = cards.deck_id 
    AND decks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update cards in their decks" 
ON cards FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM decks 
    WHERE decks.id = cards.deck_id 
    AND decks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete cards in their decks" 
ON cards FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM decks 
    WHERE decks.id = cards.deck_id 
    AND decks.user_id = auth.uid()
  )
);

-- Update existing decks to assign them to a default user (replace 'YOUR_DEFAULT_USER_ID' with an actual user ID)
-- You'll need to run this for each existing deck after creating at least one user
-- UPDATE decks SET user_id = 'YOUR_DEFAULT_USER_ID' WHERE user_id IS NULL;

-- Make user_id NOT NULL after migrating existing data
-- ALTER TABLE decks ALTER COLUMN user_id SET NOT NULL; 