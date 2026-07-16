import requests

data = {
    "email": "peri@gmail.com",
    "password": "123456"
}

response = requests.post(
    "http://127.0.0.1:5000/login",
    json=data
)

print(response.json())