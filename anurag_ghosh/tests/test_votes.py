import pytest

def test_vote_on_post(authorized_client, test_posts):
    res = authorized_client.post("/vote/", json={"post_id": test_posts[0].id, "dir": 1})
    assert res.status_code == 201
    assert res.json()["message"] == "Successfully added vote"

def test_vote_twice_on_post(authorized_client, test_posts):
    authorized_client.post("/vote/", json={"post_id": test_posts[0].id, "dir": 1})
    res = authorized_client.post("/vote/", json={"post_id": test_posts[0].id, "dir": 1})
    assert res.status_code == 409

def test_delete_vote(authorized_client, test_posts):
    authorized_client.post("/vote/", json={"post_id": test_posts[0].id, "dir": 1})
    res = authorized_client.post("/vote/", json={"post_id": test_posts[0].id, "dir": 0})
    assert res.status_code == 201
    assert res.json()["message"] == "Successfully deleted vote"

def test_delete_vote_non_exist(authorized_client, test_posts):
    res = authorized_client.post("/vote/", json={"post_id": test_posts[0].id, "dir": 0})
    assert res.status_code == 404

def test_vote_post_non_exist(authorized_client):
    res = authorized_client.post("/vote/", json={"post_id": 99999, "dir": 1})
    assert res.status_code == 404

def test_vote_unauthorized_user(client, test_posts):
    res = client.post("/vote/", json={"post_id": test_posts[0].id, "dir": 1})
    assert res.status_code == 401

def test_vote_invalid_dir(authorized_client, test_posts):
    res = authorized_client.post("/vote/", json={"post_id": test_posts[0].id, "dir": 5})
    assert res.status_code == 422