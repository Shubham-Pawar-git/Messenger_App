import psycopg2 as ps
import os

def create_connection():
    password = os.getenv("DB_PASSWORD")
    URL=f"postgresql://postgres:{password}@db.fxevmudtogwgwwfetfmt.supabase.co:5432/postgres"
    try:
        connection=ps.connect(URL,sslmode="require",
            connect_timeout=5  # fail fast if unreachable
        )
        # print("✅ Database connection established")
        return connection    
    except:
        print("db connection failed")
        raise Exception("db connection failed")
    
    
#create_connection()