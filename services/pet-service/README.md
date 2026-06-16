# Pet Service

Microserviciul `pet-service` gestionează animalele de companie folosind MongoDB.

## Structură

- `src/index.js` — server Express
- `src/db/index.js` — conectare MongoDB
- `src/models/petModel.js` — schema Mongoose pentru `pets`
- `src/repositories` — acces la date
- `src/services` — logică business
- `src/controllers` — validarea request-urilor și răspunsuri
- `src/routes` — rutele API

## Variabile de mediu

Copiază `.env.example` în `.env` și completează valoarea `MONGO_URI`:

```env
PORT=3002
MONGO_URI=mongodb://localhost:27017/pet_service
```

## Rulare locală

Din rădăcina proiectului:

```bash
npm install
npm run start:pet
```

## Endpoints

- `POST /api/pets`
- `GET /api/pets`
- `GET /api/pets/{id}`
- `GET /api/pets/user/{userId}`
- `DELETE /api/pets/{id}`

## Docker

Construiește și rulează containerul serviciului:

```bash
docker build -t pet-service ./services/pet-service
docker run -d --name pet-service -p 3002:3002 --env-file services/pet-service/.env pet-service
```
