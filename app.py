from flask import Flask,request,jsonify,send_file
from flask_cors import CORS
from db.storage import *
from db.dbconnection import *
from dotenv import load_dotenv

load_dotenv()  

app=Flask(__name__)
CORS(app)
# logged_users=[]


@app.route("/signup", methods=["POST"])
def signup_page():
    res = request.get_json()  # safer
    if not res:
        return {"error": "No JSON data provided"}, 400
    
    try:
        connection = create_connection()

        if authenticate_user(connection, res):
            return {"message": "User already present"}, 200
        else:
            if create_user(connection, res):
                return {"message": "User created"}, 201
            else:
                return {"message": "User not created"}, 200

    except Exception as e:
        return {"error": str(e)}, 500

    finally:
        if connection:
            connection.close()


@app.route("/login", methods=["PUT"])
def login_page():
    connection = None
    try:
        res = request.get_json()
        if not res:
            return {"status": "error", "message": "No JSON data provided"}, 400

        connection = create_connection()
        if authenticate_user(connection, res):
            return {"status": "success", "message": "Successful login"}, 200
        else:
            return {"status": "error", "message": "Login failed"}, 200  # 401 for auth failure

    except Exception as e:
        return {"status": "error", "message": "Internal server error"}, 500

    finally:
        if connection:
            connection.close()

        

@app.route("/messenger_app",methods=["PUT"])
def messenger_app_page():
    connection=None
    try:
        connection=create_connection()
        return read_users(connection),200
    except Exception as e:
        return {"status":"failed","error":str(e)},500
        print(e)
    finally:
        if connection:
            connection.close()


@app.route("/messenger_app/chats", methods=["POST"])
def messenger_app_chat_page():
    connection = None
    try:
        res = request.get_json()
        sender_id = res["sender_id"]
        receiver_id = res["receiver_id"]

        connection = create_connection()
        list_dict = load_messeges(connection, sender_id, receiver_id)

        if list_dict:
            # print(list_dict)
            return list(list_dict), 200
        else:
            return {"status": "no messages"}, 200

    except Exception as e:
        # import traceback
        # traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        if connection:
            connection.close()

@app.route("/messenger_app/chats",methods=["PUT"])
def messenger_app_add_message():
    connection=None
    try:
        res=request.get_json()
        sender_id=res["sender_id"]

        receiver_id=res["receiver_id"]
        
        message_text=res["message_text"]

        connection=create_connection()
        if add_messege(connection,sender_id,receiver_id,message_text):
            return {"status":"success"},200
        else:
            return {"status":"failed"},200
    except Exception as e:
        return {"status":"failed from except"},500
    finally:
        if connection:
            connection.close()

@app.route("/messenger_app/chats",methods=["DELETE"])
def messenger_app_delete_message():
    connection=None
    try:
        res=request.get_json()
        message_id=int(res["id"])

        connection=create_connection()
        if delete_messege(connection,message_id):
            return {"status":"success"},200
        else:
            return {"status":"failed"},200
    except Exception as e:
        # print(e)
        return {"status":f"failed from except{str(e)}"},500
    finally:
        if connection:
            connection.close()

@app.route("/logs", methods=["GET"])
def get_logs():
    return send_file("./logger/log.txt", mimetype="text/plain") 

@app.route("/search_user",methods=["POST"])
def get_searched_user():
    try:
        res=request.get_json()
        user_name=res["user_name"]
        connection=create_connection()
        users=search_user(connection,user_name)
        if users:
            return jsonify(users) ,200
        else:
            return jsonify({"status":"failed"}),200
    except Exception as e:
        return jsonify({"Error":{str(e)}}),404




app.run()
