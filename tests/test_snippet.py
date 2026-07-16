import requests

data = {
    "title": "Hello World",
    "language": "Python",
    "code": "print('Hello World')",
    "owner": "peri"
}

response = requests.post(
    "http://127.0.0.1:5000/snippet",
    json=data
)

print(response.json())