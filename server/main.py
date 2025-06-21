from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# --- Models ---
class User(BaseModel):
    email: str
    role: str

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: str
    password: str

# --- Hardcoded Testing User Database ---
# In a real application, this would be a database query.
# Passwords are "password123" hashed with a simple scheme for this demo.
# A real implementation should use a strong hashing algorithm like bcrypt.
testing_users_db = {
    "enterprise_employer@demo.com": {
        "email": "enterprise_employer@demo.com",
        "role": "enterprise_employer",
        "hashed_password": "testing_password123",
    },
    "enterprise_employee@demo.com": {
        "email": "enterprise_employee@demo.com",
        "role": "enterprise_employee",
        "hashed_password": "testing_password123",
    },
    "education_user@demo.com": {
        "email": "education_user@demo.com",
        "role": "education_user",
        "hashed_password": "testing_password123",
    },
}

# --- App Initialization ---
app = FastAPI()

# --- CORS Middleware ---
# This allows the frontend (running on a different port) to communicate with the backend.
origins = [
    "http://localhost:4200",  # Default Angular dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helper Functions ---
def get_user(db, email: str):
    if email in db:
        user_dict = db[email]
        return UserInDB(**user_dict)
    return None

# --- API Endpoints ---
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: LoginRequest):
    user = get_user(testing_users_db, form_data.email)
    # In a real app, you would verify the password here.
    # For this demo, we'll just check if the user exists and the password is "password123".
    if not user or form_data.password != "password123":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # In a real app, you would create a real JWT token here.
    access_token = f"testing-jwt-token-for-{user.email}"
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=User)
async def read_users_me(email: str): # In a real app, you'd get the user from the token
    user = get_user(testing_users_db, email)
    if user:
        return user
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/")
def read_root():
    return {"message": "Welcome to the StackSketch API"}

