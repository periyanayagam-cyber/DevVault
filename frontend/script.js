

function login(){

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;


    fetch("http://127.0.0.1:5000/login",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            email:email,
            password:password

        })

    })


    .then(response=>response.json())


    .then(data=>{


        if(data.message=="Login Successful"){

            localStorage.setItem("username", data.username);
            localStorage.setItem("email", email);
            window.location.href="dashboard.html";

        }
        else{

            alert(data.message);

        }


    });

}


// Load logged-in user's snippets
function loadSnippets(){

    let username = localStorage.getItem("username");


    fetch("http://127.0.0.1:5000/snippets/" + username)


    .then(response=>response.json())


    .then(data=>{


        document.getElementById("count").innerHTML = data.length;


        let output = "";


        data.forEach(snippet=>{


            output += `

            <div>

                <h3>${snippet.title}</h3>

                <p>Language: ${snippet.language}</p>

                <pre><code>${snippet.code}</code></pre>

                <p>Owner: ${snippet.owner}</p>
                <p>❤️ Likes: ${snippet.likes || 0}</p>
                <p>💬 Comments:</p>
                ${(snippet.comments || []).map(
                c => `<p><b>${c.user}:</b> ${c.text}</p>`
                ).join("")}
                <button onclick="editSnippet('${snippet.title}')">
                    Edit
                </button>


                <button onclick="deleteSnippet('${snippet.title}')">
                    Delete
                </button>
                <button onclick="likeSnippet('${snippet.title}')">
                    ❤️ Like
                </button>
                <button onclick="commentSnippet('${snippet.title}')">
                    💬 Comment
                </button>
                <button onclick="shareSnippet('${snippet._id}')">
                    Share
                </button>
                <button onclick="downloadPDF('${snippet._id}')">
                    📄 PDF
                </button>

            </div>

            <hr>

            `;


        });


        document.getElementById("snippetList").innerHTML = output;
        hljs.highlightAll();

    });


}


// Show add snippet form
function showForm(){

    document.getElementById("snippetForm").style.display="block";

}



// Add new snippet
function addSnippet(){


    let title = document.getElementById("title").value;

    let language = document.getElementById("language").value;

    let code = document.getElementById("code").value;



    fetch("http://127.0.0.1:5000/snippet",{


        method:"POST",


        headers:{

            "Content-Type":"application/json"

        },


        body:JSON.stringify({


            title:title,

            language:language,

            code:code,

            owner:localStorage.getItem("username")


        })


    })


    .then(response=>response.json())


    .then(data=>{


        alert(data.message);


        document.getElementById("title").value="";

        document.getElementById("language").value="";

        document.getElementById("code").value="";


        loadSnippets();


    });


}



// Delete snippet
function deleteSnippet(title){


    fetch(
        "http://127.0.0.1:5000/snippet/" + encodeURIComponent(title),
        {

            method:"DELETE"

        }

    )


    .then(response=>response.json())


    .then(data=>{


        alert(data.message);


        loadSnippets();


    });


}



// Edit snippet
function editSnippet(title){


    let newLanguage = prompt("Enter new language:");

    let newCode = prompt("Enter new code:");



    fetch(
        "http://127.0.0.1:5000/snippet/" + encodeURIComponent(title),
        {


            method:"PUT",


            headers:{

                "Content-Type":"application/json"

            },


            body:JSON.stringify({


                language:newLanguage,

                code:newCode


            })


        }

    )


    .then(response=>response.json())


    .then(data=>{


        alert(data.message);


        loadSnippets();


    });


}



// Automatically load snippets on dashboard
window.onload = function(){
     
    // Dashboard only
    if(document.getElementById("snippetList")){
        
        loadSnippets();

    }
    loadProfileImage();
    // Run on every page
    loadStats();

    const rank =
    document.getElementById("userRank");

    if(rank){
        rank.textContent = "#1";
    }

    
}


function searchSnippets(){

    let input =
    document.getElementById("searchBox")
    .value
    .toLowerCase();

    let cards =
    document.querySelectorAll("#snippetList div");

    cards.forEach(card => {

        let title =
        card.querySelector("h3")
        .innerText
        .toLowerCase();

        if(title.includes(input)){

            card.style.display = "block";

        }
        else{

            card.style.display = "none";

        }

    });

}
function shareSnippet(id){

    let link =
    "http://127.0.0.1:5000/snippet/view/" + id;

    navigator.clipboard.writeText(link);

    alert("Share link copied!");
}
function shareSnippet(id){

    let link =
    "http://127.0.0.1:5000/snippet/view/" + id;

    navigator.clipboard.writeText(link);

    alert("Share Link Copied!");
}
function shareSnippet(id){

    let link =
    "http://127.0.0.1:5000/snippet/view/" + id;

    navigator.clipboard.writeText(link);

    alert("Share Link Copied!");
}
function logout(){

    localStorage.removeItem("username");

    window.location.href = "login.html";

}
function likeSnippet(title){

    fetch(
        "http://127.0.0.1:5000/snippet/like/" +
        encodeURIComponent(title),
        {
            method: "PUT",

            headers:{
                "Content-Type":"application/json"
            },

            body: JSON.stringify({
                username:
                localStorage.getItem("username")
            })
        }
    )

    .then(response => response.json())

    .then(data => {

        alert(data.message);

        loadSnippets();

        if(typeof loadStats === "function"){
            loadStats();
        }

    });

}
function loadStats(){

    let username =
    localStorage.getItem("username");

    if(!username){
        return;
    }

    fetch(
        "http://127.0.0.1:5000/stats/" +
        username
    )

    .then(response => response.json())

    .then(data => {

        // Dashboard Cards
        const count =
        document.getElementById("count");

        if(count){
            count.innerText =
            data.totalSnippets || 0;
        }

        const totalSnippets =
        document.getElementById("totalSnippets");

        if(totalSnippets){
            totalSnippets.innerText =
            data.totalSnippets || 0;
        }

        const totalLikes =
        document.getElementById("totalLikes");

        if(totalLikes){
            totalLikes.innerText =
            data.totalLikes || 0;
        }

        const favoriteLanguage =
        document.getElementById("favoriteLanguage");

        if(favoriteLanguage){
            favoriteLanguage.innerText =
            data.favoriteLanguage || "-";
        }

        // Right Panel
        const sideSnippets =
        document.getElementById("sideSnippets");

        if(sideSnippets){
            sideSnippets.innerText =
            data.totalSnippets || 0;
        }

        const sideLikes =
        document.getElementById("sideLikes");

        if(sideLikes){
            sideLikes.innerText =
            data.totalLikes || 0;
        }

        const userRank =
        document.getElementById("userRank");

        if(userRank){
            userRank.innerText = "#1";
        }

        // Profile Name
        const profileName =
        document.getElementById("profileName");

        if(profileName){
            profileName.innerText = username;
        }

        // Profile Picture
        const avatar =
        document.getElementById("profileAvatar");

        const savedImage =
        localStorage.getItem("profileImage");

        if(avatar){

            if(savedImage){
                avatar.src = savedImage;
            }
            else{
                avatar.src = "developer.png";
            }

        }

    })

    .catch(error => {

        console.error(
            "Error loading stats:",
            error
        );

    });

}
function commentSnippet(title){

    let text = prompt("Enter Comment:");

    if(!text){
        return;
    }

    fetch(
        "http://127.0.0.1:5000/snippet/comment/" + title,
        {
            method:"PUT",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                user: localStorage.getItem("username"),
                text:text
            })
        }
    )

    .then(response=>response.json())
    .then(data=>{

        alert(data.message);

        loadSnippets();

    });

}
function downloadPDF(id){

    window.open(
        "http://127.0.0.1:5000/snippet/pdf/" + id,
        "_blank"
    );

}
const username =
localStorage.getItem("username") || "D";

const avatar =
document.querySelector(".profile-avatar");

if(avatar){
    avatar.textContent =
    username.charAt(0).toUpperCase();
}
const profileName =
document.getElementById("profileName");

if(profileName){
    profileName.textContent = username;
}


function loadProfileImage() {

    const username =
    localStorage.getItem("username");

    const savedImage =
    localStorage.getItem(
        "profileImage_" + username
    );

    const profileAvatar =
    document.getElementById("profileAvatar");

    if(profileAvatar){
        profileAvatar.src =
        savedImage || "developer.png";
    }

    const profileAvatarLarge =
    document.getElementById("profileAvatarLarge");

    if(profileAvatarLarge){
        profileAvatarLarge.src =
        savedImage || "developer.png";
    }
}