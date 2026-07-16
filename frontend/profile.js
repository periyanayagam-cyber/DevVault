function loadProfile() {

    let username = localStorage.getItem("username");

    fetch("http://127.0.0.1:5000/profile/" + username)

    .then(response => response.json())

    .then(data => {

        // Username
        document.getElementById("username").innerText =
        data.username || username;

        // Full Name
        document.getElementById("name").innerText =
        data.name || "Not Added";

        // Skills
        document.getElementById("skills").innerText =
        data.skills || "Not Added";

        // GitHub
        document.getElementById("github").innerHTML =
        data.github
        ? `<a href="${data.github}" target="_blank">${data.github}</a>`
        : "Not Added";

        // Right Panel Name
        const profileName =
        document.getElementById("profileName");

        if(profileName){
            profileName.innerText =
            data.username || username;
        }

        // Load Saved Profile Image
        const savedImage =
        localStorage.getItem("profileImage");

        if(savedImage){

            const largeAvatar =
            document.getElementById(
                "profileAvatarLarge"
            );

            if(largeAvatar){
                largeAvatar.src = savedImage;
            }

            const sideAvatar =
            document.getElementById(
                "profileAvatar"
            );

            if(sideAvatar){
                sideAvatar.src = savedImage;
            }
        }

    })

    .catch(error => {
        console.log(error);
    });
}



function editProfile() {

    let currentName =
    document.getElementById("name").innerText;

    let currentSkills =
    document.getElementById("skills").innerText;

    let githubElement =
    document.querySelector("#github a");

    let currentGithub =
    githubElement
    ? githubElement.href
    : "";

    let name =
    prompt("Enter Full Name", currentName);

    if(name === null) return;

    let skills =
    prompt("Enter Skills", currentSkills);

    if(skills === null) return;

    let github =
    prompt("Enter GitHub URL", currentGithub);

    if(github === null) return;

    let username =
    localStorage.getItem("username");

    fetch("http://127.0.0.1:5000/profile/update", {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username: username,
            name: name,
            skills: skills,
            github: github
        })

    })

    .then(response => response.json())

    .then(data => {

        alert(data.message);

        loadProfile();

    })

    .catch(error => {

        console.log(error);

    });

}



function uploadProfileImage() {
    alert("UPLOAD FUNCTION RUNNING");
    const file =
    document.getElementById(
        "profileImageInput"
    ).files[0];

    if(!file) return;

    const reader =
    new FileReader();

    reader.onload = function(e) {

        const imageData =
        e.target.result;

        // Save Image
        const username =
localStorage.getItem("username");

localStorage.setItem(
    "profileImage_",
    imageData
);

        // Main Profile Image
        const largeAvatar =
        document.getElementById(
            "profileAvatarLarge"
        );

        if(largeAvatar){
            largeAvatar.src =
            imageData;
        }

        // Right Panel Image
        const sideAvatar =
        document.getElementById(
            "profileAvatar"
        );

        if(sideAvatar){
            sideAvatar.src =
            imageData;
        }
    };

    reader.readAsDataURL(file);
}



document.addEventListener("DOMContentLoaded", function(){

    loadProfile();

    if(typeof loadStats === "function"){
        loadStats();
    }

});