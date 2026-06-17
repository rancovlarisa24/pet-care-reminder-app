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

Copiază `.env.example` în `.env` și completează valorile:

```env
PORT=3002
MONGO_URI=mongodb://localhost:27017/pet_service
JWT_SECRET=același-secret-ca-user-service
INTERNAL_API_KEY=cheia-internă-comună
```

`JWT_SECRET` validează token-ul utilizatorului, iar `INTERNAL_API_KEY` permite apelurile interne (ex. Reminder Service care verifică proprietarul unui animal).

## Rulare locală

Din rădăcina proiectului:

```bash
npm install
npm run start:pet
```

## Endpoints

Toate rutele necesită `Authorization: Bearer <token>` (owner = userul logat). `userId` este preluat din token.

- `POST /api/pets`
- `GET /api/pets`
- `GET /api/pets/{id}` (owner sau serviciu intern prin `X-Internal-Key`)
- `DELETE /api/pets/{id}`

## Docker

Construiește și rulează containerul serviciului:

```bash
docker build -t pet-service ./services/pet-service
docker run -d --name pet-service -p 3002:3002 --env-file services/pet-service/.env pet-service
```
