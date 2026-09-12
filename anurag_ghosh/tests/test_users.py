import pytest
from app import schemas

def test_create_user(client):
    res = client.post("/users/", json={"email": "newuser@gmail.com", "password": "password123"})
    new_user = schemas.UserOut(**res.json())
    assert res.status_code == 201
    assert new_user.email == "newuser@gmail.com"

def test_create_user_duplicate_email(client, test_user):
    res = client.post("/users/", json={"email": test_user["email"], "password": "password123"})
    assert res.status_code == 400

def test_get_user_by_id(client, test_user):
    res = client.get(f"/users/{test_user['id']}")
    assert res.status_code == 200
    user_res = schemas.UserOut(**res.json())
    assert user_res.id == test_user["id"]
    assert user_res.email == test_user["email"]

def test_get_user_not_found(client):
    res = client.get("/users/99999")
    assert res.status_code == 404

def test_get_current_user_me(authorized_client, test_user):
    res = authorized_client.get("/users/me")
    assert res.status_code == 200
    user_res = schemas.UserOut(**res.json())
    assert user_res.id == test_user["id"]
    assert user_res.email == test_user["email"]

def test_get_current_user_me_unauthorized(client):
    res = client.get("/users/me")
    assert res.status_code == 401