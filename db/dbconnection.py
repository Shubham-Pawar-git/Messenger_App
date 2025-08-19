import psycopg2 as ps
import os

def create_connection():
    URL = os.getenv("DATABASE_URL")
    if not URL:
        raise Exception("❌ DATABASE_URL not set")
    try:
        connection=ps.connect(URL,sslmode="require",
            connect_timeout=5)
        return connection    
    except:
        print("db connection failed")
        raise Exception("db connection failed")
    
    

#create_connection()

