"""
Kids Typing Practice App

A fun and interactive typing practice application designed for 6-year-old children
to learn keyboard typing with colorful interface and engaging activities.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os
from pathlib import Path
import random
import json

app = FastAPI(title="Kids Typing Practice",
              description="Fun typing practice app for young children")

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# Word collections for different difficulty levels
word_collections = {
    "letters": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    "easy": ["cat", "dog", "sun", "car", "hat", "bat", "run", "fun", "big", "red", "blue", "love", "happy", "play"],
    "animals": ["cat", "dog", "bird", "fish", "bear", "lion", "tiger", "monkey", "elephant", "giraffe"],
    "colors": ["red", "blue", "green", "yellow", "orange", "purple", "pink", "black", "white", "brown"],
    "numbers": ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
    "family": ["mom", "dad", "baby", "sister", "brother", "grandma", "grandpa", "family", "love", "hug"]
}

# Player progress tracking
player_stats = {
    "words_completed": 0,
    "letters_typed": 0,
    "accuracy": 100,
    "level": "letters"
}


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/words/{category}")
def get_words(category: str):
    """Get words from a specific category"""
    if category not in word_collections:
        raise HTTPException(status_code=404, detail="Category not found")
    
    words = word_collections[category]
    # Return 5 random words from the category
    return {"words": random.sample(words, min(5, len(words))), "category": category}


@app.get("/word/random")
def get_random_word():
    """Get a random word from current difficulty level"""
    level = player_stats["level"]
    words = word_collections[level]
    return {"word": random.choice(words), "level": level}


@app.post("/progress")
def update_progress(correct: bool, word_length: int):
    """Update player progress"""
    player_stats["words_completed"] += 1
    player_stats["letters_typed"] += word_length
    
    if correct:
        # Maintain or improve accuracy
        current_accuracy = player_stats["accuracy"]
        player_stats["accuracy"] = min(100, (current_accuracy * 0.9) + (100 * 0.1))
    else:
        # Slightly decrease accuracy
        player_stats["accuracy"] = max(0, player_stats["accuracy"] * 0.95)
    
    # Level progression
    if player_stats["words_completed"] >= 10 and player_stats["accuracy"] > 80:
        if player_stats["level"] == "letters":
            player_stats["level"] = "easy"
        elif player_stats["level"] == "easy":
            player_stats["level"] = "animals"
    
    return player_stats


@app.get("/stats")
def get_stats():
    """Get current player statistics"""
    return player_stats


@app.get("/categories")
def get_categories():
    """Get all available word categories"""
    return {"categories": list(word_collections.keys())}
