# Database Setup for Supacards API

This guide explains how to set up the database tables required for the Supacards API.

## Prerequisites

- A Supabase account and project
- Access to the Supabase SQL Editor

## Setup Instructions

### Option 1: New Installation (No Existing Data)

If you're setting up the database from scratch:

1. Log in to your Supabase dashboard and select your project
2. Navigate to the SQL Editor
3. Copy the contents of the `create_tables.sql` file
4. Paste it into the SQL Editor
5. Click "Run" to execute the SQL commands

This will create:
- A `decks` table with the necessary fields
- A `cards` table with a reference to decks
- Triggers to automatically update the `updated_at` timestamps
- Indexes for better query performance

### Option 2: Migration (Existing Cards Data)

If you already have a `cards` table with data that you want to preserve:

1. Log in to your Supabase dashboard and select your project
2. Navigate to the SQL Editor
3. First, run the `create_tables.sql` script to create the `decks` table
4. Then, copy the contents of the `migrate_cards.sql` file
5. Paste it into the SQL Editor
6. **Important**: After running the script, note the UUID of the default deck that was created
7. Replace `'YOUR_DEFAULT_DECK_ID'` in the script with the actual UUID
8. Run the script again to complete the migration

## Verifying the Setup

To verify that the tables were created correctly:

1. In the Supabase dashboard, go to the "Table Editor"
2. You should see both `decks` and `cards` tables
3. Check that the `cards` table has a `deck_id` column that references the `decks` table

## Table Structure

### Decks Table

| Column     | Type      | Description                           |
|------------|-----------|---------------------------------------|
| id         | UUID      | Primary key                           |
| name       | TEXT      | Name of the deck                      |
| user_id    | UUID      | Optional reference to a user          |
| archived   | BOOLEAN   | Whether the deck is archived          |
| created_at | TIMESTAMP | When the deck was created             |
| updated_at | TIMESTAMP | When the deck was last updated        |

### Cards Table

| Column     | Type      | Description                           |
|------------|-----------|---------------------------------------|
| id         | UUID      | Primary key                           |
| front      | TEXT      | Front content of the card             |
| back       | TEXT      | Back content of the card              |
| deck_id    | UUID      | Reference to the deck (foreign key)   |
| user_id    | UUID      | Optional reference to a user          |
| created_at | TIMESTAMP | When the card was created             |
| updated_at | TIMESTAMP | When the card was last updated        |

## Troubleshooting

If you encounter any issues:

- Check that the `uuid-ossp` extension is enabled in your Supabase project
- Verify that you have the necessary permissions to create tables
- If migrating existing data, ensure you've replaced `'YOUR_DEFAULT_DECK_ID'` with the actual UUID

For more help, refer to the [Supabase documentation](https://supabase.io/docs). 