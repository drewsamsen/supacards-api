# Supacards API Database Setup

This document provides instructions for setting up the Supacards API database in Supabase.

## Overview

The Supacards API uses a PostgreSQL database managed by Supabase. The database consists of two main tables:

1. `decks` - Stores information about flashcard decks
2. `cards` - Stores individual flashcards that belong to decks

The database also includes authentication support through Supabase Auth, with Row Level Security (RLS) policies to ensure users can only access their own data.

## Setup Instructions

### Option 1: Complete Setup (Recommended for New Installations)

For a new installation, you can run the complete `sql/database_setup.sql` script in the Supabase SQL Editor. This script will:

1. Create all necessary tables
2. Set up indexes for performance
3. Configure triggers for automatic timestamp updates
4. Add slug functionality for decks
5. Set up authentication and Row Level Security

**Steps:**

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `sql/database_setup.sql` into the editor
4. Run the script

### Option 2: Step-by-Step Setup

If you prefer to set up the database in stages or need to troubleshoot specific components, you can run each section of the `sql/database_setup.sql` script separately:

1. **Enable UUID Extension**: Run Step 1 to enable the UUID extension
2. **Create Tables**: Run Step 2 to create the basic tables
3. **Create Triggers**: Run Step 3 to set up automatic timestamp updates
4. **Create Indexes**: Run Step 4 to add performance indexes
5. **Add Slug Functionality**: Run Step 5 to add slug support for decks
6. **Add Authentication Support**: Run Step 6 to set up user authentication and RLS
7. **Data Migration**: Modify and run Step 7 if you need to migrate existing data
8. **Verification**: Run Step 8 to verify your setup

## Data Migration

If you have existing data that needs to be migrated, you'll need to:

1. Uncomment and modify the data migration section (Step 7) in the script
2. Replace placeholders with actual values:
   - `YOUR_DEFAULT_USER_ID`: The UUID of the user who should own existing decks
   - `YOUR_DEFAULT_DECK_ID`: The UUID of the default deck for cards without a deck

## Verification

After running the setup script, you can verify your installation by:

1. Checking the table structure using `\d decks` and `\d cards`
2. Verifying triggers are set up correctly
3. Confirming RLS policies are in place

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure your Supabase role has the necessary permissions
2. **Relation Already Exists**: If tables already exist, you may need to drop them first or use the `IF NOT EXISTS` clause
3. **Foreign Key Constraint**: Make sure referenced tables exist before creating tables with foreign key constraints

### Getting Help

If you encounter issues with the database setup, please:

1. Check the Supabase logs for error messages
2. Refer to the Supabase documentation for specific error codes
3. Contact the development team for assistance

## Schema Reference

### Decks Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Name of the deck |
| slug | TEXT | URL-friendly identifier |
| user_id | UUID | Foreign key to auth.users |
| archived | BOOLEAN | Whether the deck is archived |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Cards Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| front | TEXT | Front content of the card |
| back | TEXT | Back content of the card |
| deck_id | UUID | Foreign key to decks |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp | 