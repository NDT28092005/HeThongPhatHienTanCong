import random


def predict(features: list[float]) -> str:
    return random.choice(["attack", "normal"])
