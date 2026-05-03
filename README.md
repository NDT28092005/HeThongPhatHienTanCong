# FastAPI Mock Predict

A FastAPI mock service that returns random prediction results (`"attack"` or `"normal"`) for integration testing purposes.

## Requirements

- Docker & Docker Compose (for running with Docker)
- Python 3.11+ (for running locally)

## Run with Docker

```bash
docker-compose up
```

The API will be available at `http://localhost:8000`.

To run in the background:

```bash
docker-compose up -d
```

To stop:

```bash
docker-compose down
```

## Run Locally

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Run Tests

```bash
pytest
```

## Endpoints

### POST /api/predict

Send a prediction request.

Request body:

```json
{
  "features": [1.0, 2.0, 3.0],
  "request_id": "optional-string"
}
```

- `features` (required): list of floats
- `request_id` (optional): string, echoed back in the response

Response:

```json
{
  "status": "attack",
  "request_id": "optional-string"
}
```

- `status`: randomly `"attack"` or `"normal"`
- `request_id`: reflects the value from the request, or `null` if not provided

### GET /health

Health check endpoint.

Response:

```json
{"status": "ok"}
```

### GET /docs

Interactive Swagger UI documentation for the API.
