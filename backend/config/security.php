<?php

return [
    'model_preference' => env('SECURITY_MODEL', 'random_forest'),
    'ml_api_url' => env('ML_API_URL', 'http://localhost:8000/api/v1/security/predict'),
];
