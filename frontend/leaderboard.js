fetch("http://127.0.0.1:5000/leaderboard")

.then(response => response.json())

.then(data => {

    let output = "";

    data.forEach((dev,index)=>{

        output += `
        <div class="snippet-card">

            <h2>#${index+1}</h2>

            <h3>${dev.name}</h3>

            <p>@${dev.username}</p>

            <p>❤️ ${dev.likes} Likes</p>

        </div>
        `;
    });

    document.getElementById(
        "leaderboard"
    ).innerHTML = output;

});