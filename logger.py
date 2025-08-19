from datetime import datetime 

def logger(func):
    def wrapper(*args, **kwargs):
        log_path = "./Backend/logger/log.txt"
        with open(log_path, "a") as file:  # append instead of overwrite
            file.write(f"Function called: {func.__name__} at {datetime.now()}\n")
        result = func(*args, **kwargs)  # call the original function
        return result  # return the actual result so Flask works
    return wrapper

def log_error(e):
    log_path = "./Backend/logger/log.txt"
    with open(log_path, "a") as file:
        file.write(f"error occurred: {str(e)} at {datetime.now()}\n")
