fetch("http://127.0.0.1:5000/devs")
.then(response => response.json())
.then(data => {

    let output = "";

    data.forEach((dev, index) => {

        output += `

        <div class="leaderboard-card">

            <div class="rank">
                #${index + 1}
            </div>

            <div class="user-info">

                <h3>${dev.name}</h3>

                <p>@${dev.username}</p>

                <p>
                    💻 ${dev.skills || "Developer"}
                </p>

            </div>

            <div class="likes">

                <button
                    onclick="window.location.href='profile.html?user=${dev.username}'">

                    View Profile

                </button>

            </div>

        </div>

        `;

    });

    document.getElementById("developerList").innerHTML = output;

})
.catch(error => {

    document.getElementById("developerList").innerHTML = `

        <div class="card">

            <h3>Unable to load developers</h3>

            <p>Please check if Flask server is running.</p>

        </div>

    `;

    console.error(error);

});