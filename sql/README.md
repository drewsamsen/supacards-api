# SQL Directory

This directory contains SQL scripts and documentation for the Supacards API database.

## Files

- `database_setup.sql` - The main SQL script for setting up the entire database
- `DATABASE_SETUP.md` - Detailed documentation on how to set up and manage the database

## Usage

For complete instructions on setting up the database, please refer to the [DATABASE_SETUP.md](./DATABASE_SETUP.md) file.

## Overview

The Supacards API uses a PostgreSQL database managed by Supabase with the following main components:

1. Tables for decks and cards
2. Indexes for performance optimization
3. Triggers for automatic timestamp updates
4. Functions for slug generation
5. Row Level Security (RLS) policies for user data isolation 