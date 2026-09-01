import pytest
from app import schemas

def test_get_all_posts(authorized_client, test_posts):
    res = authorized_client.get("/posts/")
    assert res.status_code == 200
    posts_list = [schemas.PostOut(**post) for post in res.json()]
    assert len(posts_list) == len(test_posts)

def test_unauthorized_user_get_all_posts(client):
    res = client.get("/posts/")
    assert res.status_code == 401

def test_unauthorized_user_get_one_post(client, test_posts):
    res = client.get(f"/posts/{test_posts[0].id}")
    assert res.status_code == 401

def test_get_one_post_not_found(authorized_client):
    res = authorized_client.get("/posts/88888")
    assert res.status_code == 404

def test_get_one_post(authorized_client, test_posts):
    res = authorized_client.get(f"/posts/{test_posts[0].id}")
    assert res.status_code == 200
    post_res = schemas.PostOut(**res.json())
    assert post_res.Post.id == test_posts[0].id
    assert post_res.Post.title == test_posts[0].title
    assert post_res.Post.content == test_posts[0].content

def test_create_post(authorized_client, test_user):
    post_data = {"title": "Test Title", "content": "Test Content", "published": True}
    res = authorized_client.post("/posts/", json=post_data)
    assert res.status_code == 201
    created_post = schemas.Post(**res.json())
    assert created_post.title == post_data["title"]
    assert created_post.content == post_data["content"]
    assert created_post.published is True
    assert created_post.owner_id == test_user["id"]

def test_create_post_default_published_true(authorized_client, test_user):
    post_data = {"title": "Default Published Title", "content": "Default Content"}
    res = authorized_client.post("/posts/", json=post_data)
    assert res.status_code == 201
    created_post = schemas.Post(**res.json())
    assert created_post.published is True

def test_unauthorized_user_create_post(client):
    res = client.post("/posts/", json={"title": "Unauthorized", "content": "Content"})
    assert res.status_code == 401

def test_unauthorized_user_delete_post(client, test_posts):
    res = client.delete(f"/posts/{test_posts[0].id}")
    assert res.status_code == 401

def test_delete_post_success(authorized_client, test_posts):
    res = authorized_client.delete(f"/posts/{test_posts[0].id}")
    assert res.status_code == 204

def test_delete_post_non_exist(authorized_client):
    res = authorized_client.delete("/posts/99999")
    assert res.status_code == 404

def test_delete_other_user_post(authorized_client, test_posts):
    # test_posts[3] is owned by test_user2
    res = authorized_client.delete(f"/posts/{test_posts[3].id}")
    assert res.status_code == 403

def test_unauthorized_user_update_post(client, test_posts):
    res = client.put(f"/posts/{test_posts[0].id}", json={"title": "Updated", "content": "Updated"})
    assert res.status_code == 401

def test_update_post(authorized_client, test_posts):
    data = {"title": "Updated Title", "content": "Updated Content", "published": False}
    res = authorized_client.put(f"/posts/{test_posts[0].id}", json=data)
    assert res.status_code == 200
    updated_post = schemas.Post(**res.json())
    assert updated_post.title == data["title"]
    assert updated_post.content == data["content"]
    assert updated_post.published is False

def test_update_other_user_post(authorized_client, test_posts):
    # test_posts[3] is owned by test_user2
    data = {"title": "Malicious Update", "content": "Trying to update"}
    res = authorized_client.put(f"/posts/{test_posts[3].id}", json=data)
    assert res.status_code == 403

def test_update_post_non_exist(authorized_client):
    data = {"title": "Non-existent", "content": "Non-existent"}
    res = authorized_client.put("/posts/99999", json=data)
    assert res.status_code == 404