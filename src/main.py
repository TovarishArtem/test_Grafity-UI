from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import uuid
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, HTTPException, Request
from fastapi import Header

app = FastAPI()

class Coordinates(BaseModel):
    lat: float
    lng: float

class Landmark(BaseModel):
    id: str
    name: str
    description: str
    addedAt: str
    rating: int
    location: str
    coordinates: Coordinates  # Теперь Pydantic проверяет тип данных
    photo: str
    isChecked: bool


# Разрешённые источники (origin'ы)
origins = [
    "http://localhost:3000",  # Разрешаем запросы с фронтенда
    "http://127.0.0.1:3000",  # Альтернативный localhost
]
landmarks_db = []


# Подключаем CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Разрешаем запросы с этих источников
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все HTTP-методы (GET, POST, PUT, DELETE и т.д.)
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Проверка прав администратора (например, через заголовок Authorization)
def check_admin_privileges(authorization: str = Header(...)):
    if authorization != "Bearer admin_token":  # Простая проверка, можно заменить на более сложную
        raise HTTPException(status_code=403, detail="Access forbidden: Admin privileges required")

@app.get("/landmarks", response_model=List[Landmark])
def get_landmarks():
    return landmarks_db

@app.post("/landmarks", response_model=Landmark)
def add_landmark(landmark: Landmark):
    landmark.coordinates.lat = round(landmark.coordinates.lat, 6)  # Ограничиваем до 6 знаков
    landmark.coordinates.lng = round(landmark.coordinates.lng, 6)
    landmarks_db.append(landmark)
    return landmark


@app.delete("/landmarks/{landmark_id}")
def delete_landmark(landmark_id: str, authorization: str = Depends(check_admin_privileges)):
    for index, landmark in enumerate(landmarks_db):
        if landmark.id == landmark_id:
            del landmarks_db[index]
            return {"message": f"Landmark with id {landmark_id} deleted"}
    raise HTTPException(status_code=404, detail="Landmark not found")
    
