from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask import send_file
from reportlab.pdfgen import canvas
import io

app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017/")
db = client["devvaultdb"]

users = db["users"]
snippets = db["snippets"]
profiles = db["profiles"]


@app.route("/")
def home():
    return "DevVault Backend Connected To MongoDB"


# ==========================
# Register API
# ==========================
@app.route("/register", methods=["POST"])
def register():

    data = request.json

    username = data["username"].lower()
    email = data["email"]
    password = data["password"]

    existing_user = users.find_one({
        "$or": [
            {"username": username},
            {"email": email}
        ]
    })

    if existing_user:
        return jsonify({
            "message": "Username or Email Already Exists"
        })

    users.insert_one({
        "username": username,
        "email": email,
        "password": password
    })

    return jsonify({
        "message": "User Registered Successfully"
    })

# ==========================
# Login API
# ==========================
@app.route("/login", methods=["POST"])
def login():

    data = request.json

    user = users.find_one({
        "email": data["email"],
        "password": data["password"]
    })

    if user:
        return jsonify({
            "message": "Login Successful",
            "username": user["username"].lower()
        })

    return jsonify({
        "message": "Invalid Credentials"
    })


# ==========================
# Create Snippet API
# ==========================
@app.route("/snippet", methods=["POST"])
def create_snippet():

    data = request.json

    snippet = {
        "title": data["title"],
        "language": data["language"],
        "code": data["code"],
        "owner": data["owner"].lower(),
        "isPublic": True,
        "Likes":0
    }

    result = snippets.insert_one(snippet)

    return jsonify({
        "message": "Snippet Added Successfully",
        "id": str(result.inserted_id)
    })


# ==========================
# Get All Snippets
# ==========================
@app.route("/snippets", methods=["GET"])
def get_snippets():

    all_snippets = []

    for s in snippets.find():
        s["_id"] = str(s["_id"])
        all_snippets.append(s)

    return jsonify(all_snippets)


# ==========================
# Get User Snippets
# ==========================
@app.route("/snippets/<username>", methods=["GET"])
def get_user_snippets(username):

    user_snippets = []

    for s in snippets.find({"owner": username.lower()}):
        s["_id"] = str(s["_id"])
        user_snippets.append(s)

    return jsonify(user_snippets)


# ==========================
# Delete Snippet
# ==========================
@app.route("/snippet/<title>", methods=["DELETE"])
def delete_snippet(title):

    snippets.delete_one({
        "title": title
    })

    return jsonify({
        "message": "Snippet Deleted Successfully"
    })


# ==========================
# Update Snippet
# ==========================
@app.route("/snippet/<title>", methods=["PUT"])
def update_snippet(title):

    data = request.json

    snippets.update_one(
        {
            "title": title
        },
        {
            "$set": {
                "language": data["language"],
                "code": data["code"]
            }
        }
    )

    return jsonify({
        "message": "Snippet Updated Successfully"
    })
@app.route("/snippet/like/<title>", methods=["PUT"])
def like_snippet(title):

    username = request.json["username"]

    snippet = snippets.find_one({
        "title": title
    })

    if not snippet:
        return jsonify({
            "message": "Snippet Not Found"
        })

    liked_by = snippet.get("likedBy", [])

    if username in liked_by:
        return jsonify({
            "message": "Already Liked"
        })

    snippets.update_one(
        {"title": title},
        {
            "$inc": {"likes": 1},
            "$push": {"likedBy": username}
        }
    )

    return jsonify({
        "message": "Like Added"
    })
# ==========================
# Create Profile
# ==========================
@app.route("/profile", methods=["POST"])
def create_profile():

    data = request.json

    profile = {
        "username": data["username"].lower(),
        "name": data["name"],
        "skills": data["skills"],
        "github": data["github"]
    }

    profiles.insert_one(profile)

    return jsonify({
        "message": "Profile Created Successfully"
    })


# ==========================
# Get Profile
# ==========================
@app.route("/profile/<username>", methods=["GET"])
def get_profile(username):

    profile = profiles.find_one(
        {"username": username.lower()},
        {"_id": 0}
    )

    if profile:
        return jsonify(profile)

    return jsonify({
        "message": "Profile Not Found"
    })
@app.route("/profile/<username>", methods=["PUT"])
def update_profile(username):

    data = request.json

    profiles.update_one(
        {"username": username.lower()},
        {
            "$set": {
                "name": data["name"],
                "skills": data["skills"],
                "github": data["github"]
            }
        }
    )

    return jsonify({
        "message": "Profile Updated Successfully"
    })
@app.route("/dev/<username>", methods=["GET"])
def public_profile(username):

    profile = profiles.find_one(
        {"username": username.lower()},
        {"_id": 0}
    )

    if not profile:
        return "Developer Not Found"

    snippet_count = snippets.count_documents(
        {"owner": username.lower()}
    )

    html = f"""
    <!DOCTYPE html>
    <html>

    <head>

        <title>{profile['name']} - DevVault</title>

        <style>

        body {{
            background:#121212;
            color:white;
            font-family:Arial;
            padding:40px;
        }}

        .card {{
            background:#1e1e1e;
            padding:30px;
            border-radius:12px;
            max-width:700px;
            margin:auto;
        }}

        </style>

    </head>

    <body>

        <div class="card">

            <h1>{profile['name']}</h1>

            <h3>@{profile['username']}</h3>

            <p><b>Skills:</b> {profile['skills']}</p>

            <p><b>GitHub:</b> {profile['github']}</p>

            <p><b>Total Snippets:</b> {snippet_count}</p>

        </div>

    </body>

    </html>
    """

    return render_template_string(html)

# ==========================
# View Shared Snippet
# ==========================
@app.route("/snippet/view/<snippet_id>")
def get_single_snippet(snippet_id):

    try:

        snippet = snippets.find_one(
            {"_id": ObjectId(snippet_id)}
        )

        if not snippet:
            return "Snippet Not Found"

        html = f"""
        <!DOCTYPE html>
        <html>

        <head>
            <title>{snippet['title']} - DevVault</title>

            <style>

                body {{
                    background:#121212;
                    color:white;
                    font-family:Arial;
                    padding:40px;
                }}

                .card {{
                    background:#1e1e1e;
                    padding:20px;
                    border-radius:10px;
                }}

                pre {{
                    background:black;
                    color:#00ff88;
                    padding:20px;
                    border-radius:10px;
                    overflow:auto;
                }}

            </style>

        </head>

        <body>

            <div class="card">

                <h1>{snippet['title']}</h1>

                <h3>Language: {snippet['language']}</h3>

                <h4>Owner: {snippet['owner']}</h4>

                <pre>{snippet['code']}</pre>

            </div>

        </body>

        </html>
        """

        return render_template_string(html)

    except:
        return "Invalid Snippet ID"
# ==========================
# Run Flask
# ==========================
@app.route("/devs", methods=["GET"])
def get_all_developers():

    all_profiles = list(
        profiles.find({}, {"_id": 0})
    )

    return jsonify(all_profiles)
@app.route("/stats/<username>", methods=["GET"])
def get_stats(username):

    user_snippets = list(
        snippets.find({"owner": username.lower()})
    )

    total_snippets = len(user_snippets)

    total_likes = 0

    languages = {}

    for s in user_snippets:

        total_likes += s.get("likes", 0)

        lang = s["language"]

        languages[lang] = languages.get(lang, 0) + 1

    favorite_language = "None"

    if languages:
        favorite_language = max(
            languages,
            key=languages.get
        )

    return jsonify({
        "totalSnippets": total_snippets,
        "totalLikes": total_likes,
        "favoriteLanguage": favorite_language
    })

@app.route("/leaderboard", methods=["GET"])
def leaderboard():

    all_profiles = list(
        profiles.find({}, {"_id": 0})
    )

    result = []

    for profile in all_profiles:

        username = profile["username"]

        user_snippets = list(
            snippets.find({"owner": username})
        )

        total_likes = 0

        for s in user_snippets:
            total_likes += s.get("likes", 0)

        result.append({
            "username": username,
            "name": profile["name"],
            "likes": total_likes
        })

    result.sort(
        key=lambda x: x["likes"],
        reverse=True
    )

    return jsonify(result)

@app.route("/snippet/comment/<title>", methods=["PUT"])
def add_comment(title):

    data = request.json

    snippets.update_one(
        {"title": title},
        {
            "$push": {
                "comments": {
                    "user": data["user"],
                    "text": data["text"]
                }
            }
        }
    )

    return jsonify({
        "message": "Comment Added"
    })

@app.route("/snippet/pdf/<snippet_id>", methods=["GET"])
def download_pdf(snippet_id):

    try:

        snippet = snippets.find_one(
            {"_id": ObjectId(snippet_id)}
        )

        if not snippet:
            return jsonify({
                "message": "Snippet Not Found"
            })

        buffer = io.BytesIO()

        pdf = canvas.Canvas(buffer)

        pdf.drawString(
            100,
            800,
            f"Title: {snippet['title']}"
        )

        pdf.drawString(
            100,
            780,
            f"Language: {snippet['language']}"
        )

        pdf.drawString(
            100,
            760,
            f"Owner: {snippet['owner']}"
        )

        pdf.drawString(
            100,
            730,
            "Code:"
        )

        y = 710

        for line in snippet["code"].split("\n"):

            pdf.drawString(
                100,
                y,
                line
            )

            y -= 20

        pdf.save()

        buffer.seek(0)

        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"{snippet['title']}.pdf",
            mimetype="application/pdf"
        )

    except Exception as e:

        return jsonify({
            "message": str(e)
        })
@app.route("/trending", methods=["GET"])
def trending():

    all_snippets = []

    for s in snippets.find():

        s["_id"] = str(s["_id"])

        all_snippets.append(s)

    all_snippets.sort(
        key=lambda x: x.get("likes", 0),
        reverse=True
    )

    return jsonify(all_snippets)
if __name__ == "__main__":
    app.run(debug=True)