# socialite-api

A high-performance REST API designed to power modern, scalable social networking applications. Built using **FastAPI** and **SQLAlchemy**, architected for high throughput, robust security, and reliable relational data persistence.

---

## 🚀 Key Features

* **Authentication & Authorization:** Secure user registration, password hashing with Bcrypt, and OAuth2 JWT bearer token authentication.
* **Full CRUD on Posts:** Create, read (single / list with pagination & search), update, and delete posts with user-level ownership checks.
* **Like / Vote System:** Upvote/downvote posts with duplicate protection and real-time aggregated vote counts.
* **Relational Data Modeling:** Full relationship modeling (Users, Posts, Votes) with cascading deletes in SQLAlchemy.
* **Alembic Database Migrations:** Version-controlled database schema migrations.
* **Interactive Documentation:** Out-of-the-box Swagger UI and ReDoc documentation.
* **Automated Test Suite:** Comprehensive test suite with pytest covering authentication, authorization, CRUD, and voting workflows.
* **Containerization:** Ready-to-use Docker and Docker Compose configuration.

---

## 🛠️ Tech Stack

* **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
* **Database ORM:** [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
* **Database:** PostgreSQL (with SQLite support for tests)
* **Migrations:** [Alembic](https://alembic.sqlalchemy.org/)
* **Data Validation:** [Pydantic v2](https://docs.pydantic.dev/) & Pydantic Settings
* **Security:** Bcrypt (Direct hashing) & PyJWT
* **Server:** [Uvicorn](https://www.uvicorn.org/)
* **Testing:** [Pytest](https://docs.pytest.org/) & HTTPX

---

## 📋 API Endpoints Reference

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Authenticate user and receive JWT access token (form-data: `username`, `password`) | No |

### Users
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/users/` | Register a new user | No |
| `GET` | `/users/me` | Retrieve profile of the currently logged-in user | **Yes** |
| `GET` | `/users/{id}` | Retrieve public user info by ID | No |

### Posts
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts/` | List posts (Supports `limit`, `skip`, and `search` query params) with vote counts | **Yes** |
| `POST` | `/posts/` | Create a new post | **Yes** |
| `GET` | `/posts/{id}` | Get a specific post by ID with vote count | **Yes** |
| `PUT` | `/posts/{id}` | Update a post (Owner only) | **Yes** |
| `DELETE` | `/posts/{id}` | Delete a post (Owner only) | **Yes** |

### Votes (Likes)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/vote/` | Vote on a post (`dir=1` to upvote, `dir=0` to remove vote) | **Yes** |

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to [`.env.example`](.env.example)):

```env
DATABASE_HOSTNAME=localhost
DATABASE_PORT=5432
DATABASE_PASSWORD=postgres
DATABASE_NAME=socialite
DATABASE_USERNAME=postgres
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## 🛠️ Local Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Anuraggapex/socialite_api.git
cd socialite_api
```

### 2. Set Up a Virtual Environment
```bash
# Windows
python -m venv .venv
.\.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
```bash
cp .env.example .env
```

### 5. Run Database Migrations
```bash
alembic upgrade head
```

### 6. Start the API Server
```bash
uvicorn app.main:app --reload
```
The server will start at `http://127.0.0.1:8000`.

---

## 🐳 Running with Docker

You can spin up both PostgreSQL and the API service in one command:

```bash
docker-compose up --build
```

---

## 🧪 Running Tests

Execute the automated test suite with pytest:

```bash
pytest -v
```

---

## 📖 Interactive Documentation

Once the server is running, visit:
* **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
