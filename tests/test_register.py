import requests

data = {
    "username": "peri",
    "email": "peri@gmail.com",
    "password": "123456"
}

response = requests.post(
    "http://127.0.0.1:5000/register",
    json=data
)

print(response.json())