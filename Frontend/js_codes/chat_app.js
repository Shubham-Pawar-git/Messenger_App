
window.stop();
const base_url = "https://messenger-app-21y2.onrender.com";
if (localStorage.getItem("isLoggedIn") === "true") {
    fetch_users();
    // console.log("fetch_users called");
}else{
    alert("log in required");
    window.location.href = "login.html";
}

let lastFocused = null;


function generateProfilePic(letter, bgColor = "#673AB7", textColor = "#fff") {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Letter
    ctx.fillStyle = textColor;
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter.toUpperCase(), canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL(); // returns image URL
}

async function fetch_users() {
    try {
        Response = await fetch(`${base_url}/messenger_app`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json', // tell server you're sending JSON
            }
        })
        const users = await Response.json()

        if (users == null && users.length === 0) {
            document.querySelector("#user-container").innerText = "No user Found"
        }
        else if (Response.ok) {
            let user_container = document.querySelector("#user-container");
            user_container.innerHTML = "";
            for (let user of users) {
                if (user["user_name"] === localStorage.getItem("user_name")) {
                    let profile = document.createElement("img");
                    profile.src = generateProfilePic(user["user_name"][0]);
                    document.querySelector("#logged_in_user").append(profile);
                    localStorage.setItem("user_id", user["id"]);
                }
                let user_div = document.createElement("div");
                user_div.classList.add("user_div");
                user_div.dataset.id = user["id"];
                user_div.tabIndex = 0;
                user_div.addEventListener("click", e => {
                    let receiver_id = Number(e.currentTarget.dataset.id);
                    load_messages(receiver_id);
                });
                let img = document.createElement("img");
                img.src = generateProfilePic(user["user_name"][0]);
                // img.src="account.png";
                user_div.append(img);
                let user_name = document.createElement("p");
                user_name.classList.add("user_name");
                user_name.innerText = user["user_name"];
                user_div.append(user_name);
                user_container.appendChild(user_div);
            }
        }
        else if (!Response.ok) {
            throw new Error("bad response from server")
        }

    }
    catch (error) {
        console.log(error)
    }
}

async function load_messages(receiver_id) {
    try {
        let logged_user_data = localStorage.getItem("logged_in_user");
        // console.log("logged_in_user raw:", logged_user_data);

        let logged_user = JSON.parse(logged_user_data)?.user_name;
        // console.log("parsed logged_user:", logged_user);

        let sender_id = await search_user(logged_user);
        // console.log("search_user result:", sender_id);

        // console.log("IDs:", sender_id, receiver_id);
        // console.log(sender_id, receiver_id);
        localStorage.setItem("receiver_id", receiver_id); //imp
        localStorage.setItem("sender_id", sender_id);//imp

        Response = await fetch(`${base_url}/messenger_app/chats`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "sender_id": sender_id, "receiver_id": receiver_id })
        });

        if (Response.headers.get("content-type")?.includes("application/json")) {
            const result = await Response.json();

            if (result["status"] === "no messages") {
                document.getElementById("chat_box").innerHTML = "<h3>no messages</h3>";
                setTimeout(() => {
                    document.getElementById("chat_box").innerHTML = "";
                }, 1000)
            }
            else {
                document.getElementById("chat_box").innerHTML = "";
                let chat_box = document.querySelector("#chat_box");
                for (let message of result) {
                    let message_div = document.createElement("div");
                    message_div.id = message["id"];



                    if (message["sender_id"] == sender_id) {
                        message_div.innerText = `${message["message_text"]},${message["created_at"]}`;
                        message_div.style.textAlign = "right";
                        message_div.classList.add("message_div", "sender");
                        chat_box.append(message_div);

                        message_div.addEventListener("contextmenu", (e) => {
                            e.preventDefault();
                            targetMessage = message_div;
                            contextMenu.style.left = e.pageX + "px";
                            contextMenu.style.top = e.pageY + "px";
                            contextMenu.style.display = "block";
                        });
                    } else {
                        message_div.innerText = `${message["message_text"]}, ${message["created_at"]}`;
                        message_div.style.textAlign = "left";
                        message_div.classList.add("message_div", "receiver");
                        chat_box.append(message_div);
                    }
                }
            }
        } else {
            const text = await Response.text();
            console.error("Not JSON, got this instead:", text);
        }

    }
    catch (error) {
        console.log(error)
    }
}

const contextMenu = document.getElementById("contextMenu");
let targetMessage = null;
contextMenu.addEventListener("click", async () => {
    if (targetMessage) {
        let message_id = targetMessage.id;
        targetMessage.remove();
        targetMessage = null;
        try {
            if (message_id > 0) {
                const response = await fetch(`${base_url}/messenger_app/chats`, {
                    method: "DELETE",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ "id": message_id })
                });
                if (response.ok) {
                    if (response["status"] === "success") {
                        console.log("message deleted");
                    }
                    else if (response["status"] === "failed") {
                        console.log("message not deleted");
                    }
                }
                else {
                    throw new Error("bad server");
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    contextMenu.style.display = "none";
});


// Hide context menu if clicked anywhere else
document.addEventListener("click", () => {
    contextMenu.style.display = "none";
});

async function search_user(user_name) {
    try {
        const response = await fetch(`${base_url}/search_user`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ "user_name": user_name })
        });

        if (!response.ok) {
            throw new Error("bad server")
        } else {
            let result = await response.json();
            return result[0].id
        }
    }
    catch (error) {
        console.log(error);
    }
}

document.querySelector("#send-btn")
    .addEventListener("click", async (event) => {
        let message_input=document.querySelector("#message_input");
        let message_text = message_input.value;
        let sender_id = localStorage.getItem("sender_id");
        let receiver_id = localStorage.getItem("receiver_id");
        if (message_text != "") {
            try {
                Response = await fetch(`${base_url}/messenger_app/chats`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json', // tell server you're sending JSON
                    },
                    body: JSON.stringify({ "sender_id": sender_id, "receiver_id": receiver_id, "message_text": message_text })
                });

                if (!Response.ok) {
                    throw new Error("server had a error")
                }
                else {
                    const result = await Response.json();
                    if (result["status"] === "success") {
                        console.log("message sent");
                        let message_div = document.createElement("div");
                        let now = new Date();
                        let hours = String(now.getHours()).padStart(2, '0');  // ensures 2 digits
                        let minutes = String(now.getMinutes()).padStart(2, '0');
                        let timeString = `${hours}:${minutes}`;
                        message_div.innerText = `${message_text}, ${timeString}`;
                        message_div.style.textAlign = "right";
                        message_div.classList.add("message_div", "sender");
                        chat_box.append(message_div);
                        message_input.value="";
                    }
                    else {
                        console.log("message not sent");
                    }
                }
            }
            catch (error) {
                console.log(error)
            }
        }
    });




// console.log(document.querySelector("#search_user"));
document.querySelector("#search_user")
    .addEventListener("keydown", async (event) => {
        try {
            if (event.key === "Enter") {
                // console.log("enetr presed");
                const user_name = document.querySelector("#search_user").value;
                if (user_name !== "" || user_name.trim() !== "") {
                    const response = await fetch(`${base_url}/search_user`, {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ "user_name": user_name })
                    });
                    if (!response.ok) {
                        throw new Error("bad response from server")
                    }
                    else {
                        const result = await response.json();
                        if (result["status"] === "failed") {
                            user_container = document.querySelector("#user-container");
                            user_container.innerHTML = "<h3>No user Found</h3>";
                        }
                        else if (result.length > 0) {
                            const user_container = document.querySelector("#user-container");
                            user_container.innerHTML = "";
                            for (let user of result) {
                                let user_div = document.createElement("div");
                                user_div.classList.add("user_div");
                                let img = document.createElement("img");
                                img.src = generateProfilePic(user["user_name"][0])
                                user_div.append(img);
                                user_div.append(user["user_name"]);
                                user_div.tabIndex = 0;
                                user_div.dataset.id = user["id"];  
                                // console.log(user_div.dataset.id);
                                user_div.addEventListener("click", e => {
                                    let receiver_id = String(e.currentTarget.dataset.id);
                                    load_messages(receiver_id);
                                });
                                user_container.append(user_div);
                            }

                        }
                    }
                }
                else {
                    document.querySelector("#search_user").placeholder = "Enter a User name";
                }
            }
        } catch (error) {
            console.log("error")
            console.log(error)
        }
    });

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#message_input").value = "";
});

const profile = document.querySelector("#logged_in_user");
let user_profile = document.querySelector(".user_profile");

let hideTimeout; // store timeout reference

profile.addEventListener("mouseover", () => {
    clearTimeout(hideTimeout);

    user_profile.style.display = "flex";
    user_profile.innerHTML = "";

    let img = document.createElement("img");
    img.src = "./account.png";
    img.classList.add("profile");
    user_profile.append(img);

    let id = document.createElement("h3");
    id.innerText = `user id: ${localStorage.getItem("user_id")}`;
    id.classList.add("user_name");
    user_profile.append(id);

    let user_name = document.createElement("h4");
    user_name.innerText = `user_name: ${localStorage.getItem("user_name")}`;
    user_name.classList.add("user_name");
    user_profile.append(user_name);

    let logout = document.createElement("button");
    logout.classList.add("logout-btn");
    logout.innerText = "Logout";
    logout.addEventListener("click", () => {
        localStorage.clear();
        alert("logout");
        window.location.href = "login.html";
    });
    user_profile.append(logout);
});

profile.addEventListener("mouseout", () => {
    hideTimeout = setTimeout(() => {
        user_profile.innerHTML = "";
        user_profile.style.display = "none";
    }, 1000); // hide after 1s
});

// document.querySelector("#receive-btn").
// addEventListener("click",(event)=>{
//     let receiver_id=localStorage.getItem("receiver_id");
//     load_messages(receiver_id);
// });

setInterval(()=>{
    let receiver_id=localStorage.getItem("receiver_id");
    load_messages(receiver_id);
},7000);




