import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    # Connect to default 'postgres' database first
    conn = psycopg2.connect(
        host="localhost",
        database="postgres"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

    cursor = conn.cursor()

    try:
        cursor.execute("CREATE DATABASE recipes")
        print("Database created successfully!")
    except psycopg2.errors.DuplicateDatabase:
        print("Database already exists!")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    create_database()