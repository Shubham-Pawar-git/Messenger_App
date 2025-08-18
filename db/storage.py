from datetime import datetime
from logger.logger import logger,log_error

@logger
def create_user(connection,user):
    try:
        with connection.cursor() as cursor:
            cursor.execute('''INSERT INTO public.users (user_name, user_email, user_password) 
        VALUES (%s, %s, %s)''',(user["user_name"],user["user_email"],user["user_password"]))
        connection.commit()
        return True
    except Exception as e:
        log_error(e)
        return False
    
@logger
def authenticate_user(connection,user):
    try:
        with connection.cursor() as cursor:
            cursor.execute('''select (id) from public.users where user_name=%s and user_password=%s;''',(user["user_name"],user["user_password"]))
            result=cursor.fetchone()
            return result[0] if result else None
    except Exception as e:
        log_error(e)
        return False
    

@logger
def load_messeges(connection,sender_id,receiver_id):
    try:
        with connection.cursor() as cursor:
            cursor.execute('''SELECT * FROM messages
                WHERE (sender_id = %s AND receiver_id = %s)
                   OR (sender_id = %s AND receiver_id = %s)
                ORDER BY created_at ASC''',(int(sender_id), int(receiver_id), int(receiver_id), int(sender_id)))
            data=[]
            if message:=cursor.fetchall():
                columns = ["id", "sender_id", "receiver_id", "message_text", "created_at", "is_read"]
                for row in message:
                    data.append({
                        columns[i]: (row[i].strftime("%H:%M") if isinstance(row[i], datetime) else row[i])
                        for i in range(len(columns))
                    })
                return data
            else:
                return None
    except Exception as e:
        log_error(e)
        raise e

@logger
def add_messege(connection, sender_id, receiver_id, message_text):
    try:
        if not authenticate_id(connection, sender_id):
            # print(f"Sender ID {sender_id} not found.")
            return False
        if not authenticate_id(connection, receiver_id):
            # print(f"Receiver ID {receiver_id} not found.")
            return False
        
        with connection.cursor() as cursor:
            cursor.execute(
                '''INSERT INTO messages (sender_id, receiver_id, message_text)
                   VALUES (%s, %s, %s)''',
                (sender_id, receiver_id, message_text)
            )
            connection.commit()
            return True
    except Exception as e:
        log_error(e)
        return False

@logger
def delete_messege(connection,message_id):
    try:
        with connection.cursor() as cursor:
            cursor.execute('''delete from messages where id=%s''',(message_id,))
            connection.commit()
            return cursor.rowcount > 0
    except Exception as e:
        log_error(e)
        raise Exception("Exception in deleteing a record")

@logger
def authenticate_id(connection, user_id):
    try:
        with connection.cursor() as cursor:
            cursor.execute('''SELECT (id) FROM public.users WHERE id = %s''', (user_id,))
            if cursor.fetchall():
                return True
            else:
                return False
    except Exception as e:
        log_error(e)
        return False

@logger
def read_users(connection):
    try:
        with connection.cursor() as cursor:
            cursor.execute('''select (id,user_name) from public.users''')
            list=cursor.fetchall()
            data=[]
            for i in list:
                id_str, name = i[0].strip("()").split(",")
                data.append({
                    "id":id_str,
                    "user_name":name
                })
            return data
    except Exception as e:
        log_error(e)
        raise Exception("problem in fetching users")
        
@logger
def search_user(connection,user_name):
    try:
        with connection.cursor() as cursor:
            if user_name:
                cursor.execute('''select id,user_name from users where user_name like %s;''',(f"{user_name}%",))
                list=cursor.fetchall()

                if not list:
                    return None
                data = []
                for row in list:
                    data.append({
                        "id": row[0],
                        "user_name": row[1]
                    })
                return data
            else:
                return None
    except Exception as e:
        log_error(e)
        raise Exception("problem in searching users")
