import sqlite3
import psycopg2
from psycopg2.extras import execute_values

def migrate_data():
    # Connect to SQLite
    sqlite_conn = sqlite3.connect('recipes.db')
    sqlite_cur = sqlite_conn.cursor()

    # Connect to PostgreSQL
    pg_conn = psycopg2.connect("postgresql://@localhost:5432/recipes")
    pg_cur = pg_conn.cursor()

    # For each table in your schema
    tables = ['recipes', 'users', ...]  # Add your tables

    for table in tables:
        # Get data from SQLite
        sqlite_cur.execute(f"SELECT * FROM {table}")
        rows = sqlite_cur.fetchall()

        if not rows:
            continue

        # Get column names
        columns = [description[0] for description in sqlite_cur.description]

        # Insert into PostgreSQL
        insert_query = f"INSERT INTO {table} ({','.join(columns)}) VALUES %s"
        execute_values(pg_cur, insert_query, rows)

    # Commit and close
    pg_conn.commit()
    pg_cur.close()
    pg_conn.close()
    sqlite_cur.close()
    sqlite_conn.close()