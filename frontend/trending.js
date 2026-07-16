fetch("http://127.0.0.1:5000/trending")

.then(response => response.json())

.then(data => {

    let output = "";

    data.forEach(snippet => {

        output += `

        <div class="snippet-card">

            <h2>${snippet.title}</h2>

            <p>${snippet.language}</p>

            <p>❤️ ${snippet.likes || 0}</p>

        </div>

        `;
    });

    document.getElementById(
        "trendingList"
    ).innerHTML = output;

});