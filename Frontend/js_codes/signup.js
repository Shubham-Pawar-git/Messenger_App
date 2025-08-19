

const base_url ="http://127.0.0.1:5000";
const email_domains = ["@email.com", "@gmail.com", "@outlook.com"]

function validate_email(user_email) {
    let validated = false;
    for (let email of email_domains) {
        if (user_email.endsWith(email)) {
            validated = true
            break;
        }
    }
    return validated
};

document.querySelector("#signup-btn")
    .addEventListener("click", async (event) => {
        event.preventDefault();
        const user_name = document.querySelector("#username").value;
        const user_email = document.querySelector("#email").value;
        const user_password = document.querySelector("#password").value;

        if (user_name != "" && user_email != "" && user_password != "" && validate_email(user_email)) {
            try {
                let request = {
                    "user_name": user_name,
                    "user_email": user_email,
                    "user_password": user_password
                }
                const res = await fetch(`${base_url}/signup`, {
                    method: 'POST', // HTTP method
                    headers: {
                        'Content-Type': 'application/json', // tell server you're sending JSON
                    },
                    body: JSON.stringify(request)
                })
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                const result = await res.json()
                console.log('Server response:', result);
                if (result["message"] === "User created") {
                    document.getElementById("message").innerText = "✅ Signup Successful!";
                }
                else if (result["message"] === "User already present") {
                    document.getElementById("message").innerText = "User Already Present";
                }
                else {
                    document.getElementById("message").innerText = "❌ Invalid credentials";
                    document.getElementById("message").style.color = "red";
                }
            }
            catch (error) {
                console.error('Error sending message:', error);
            }
        }
    });

// document.querySelector("#form").addEventListener("submit", function (event) {
//     event.preventDefault(); // stops the form from submitting/reloading
// });

