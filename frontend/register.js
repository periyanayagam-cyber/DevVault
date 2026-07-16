function registerUser(){

    let username =
    document.getElementById("username").value;

    let email =
    document.getElementById("email").value;

    let password =
    document.getElementById("password").value;

    fetch(
        "http://127.0.0.1:5000/register",
        {
            method: "POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        }
    )

    .then(response => response.json())

    .then(data => {

        alert(data.message);

        if(data.message ===
           "Registration Successful"){

            window.location.href =
            "login.html";
        }
    });
}