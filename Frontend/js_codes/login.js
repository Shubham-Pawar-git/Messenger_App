
const base_url ="http://127.0.0.1:5000";
window.stop();
document.querySelector("#form").addEventListener("submit", async (event) => {
    event.preventDefault(); // ✅ Stop reload immediately

    const user_name = document.querySelector("#username").value.trim();
    const user_password = document.querySelector("#password").value.trim();

    if (user_name && user_password) {
        try {
            const request = {
                user_name: user_name,
                user_password: user_password
            };

            const res = await fetch(`${base_url}/login`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request)
            });

            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

            const result = await res.json();
            console.log('Server response:', result);

            if (result.message === "Successful login") {
                document.getElementById("message").innerText = "✅ Login Successful!";
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("logged_in_user", JSON.stringify({"user_name":user_name}));
                localStorage.setItem("user_name", user_name);
                localStorage.setItem("user_id", -1);

                // setTimeout(() => {
                //     window.location.href = "chat_app.html";
                // }, 1000);
                window.location.href = "chat_app.html";
            }
            else if (result.message === "Login failed") {
                document.getElementById("message").innerText = "Use Proper Credentials";
            }
            else {
                document.getElementById("message").innerText = "❌ Invalid credentials";
                document.getElementById("message").style.color = "red";
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
});
