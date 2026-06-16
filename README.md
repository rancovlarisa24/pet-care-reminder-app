# Pet Care Reminder App

Aplicație web bazată pe **microservicii** pentru gestionarea activităților de îngrijire a animalelor de companie. Utilizatorii pot crea conturi, adăuga animale, crea remindere (hrană, baie, plimbare, vaccin, medicamente, vizite veterinare) și vizualiza notificările generate pentru activitățile programate.

## Cuprins

- [Echipă](#echipă)
- [Arhitectură](#arhitectură)
- [Fluxul aplicației](#fluxul-aplicației)
- [Structura proiectului](#structura-proiectului)
- [Cerințe](#cerințe)
- [Instalare](#instalare)
- [Rulare](#rulare)
- [Variabile de mediu](#variabile-de-mediu)
- [API](#api)
- [Deployment pe AWS EC2](#deployment-pe-aws-ec2)
- [Persistența datelor](#persistența-datelor)
- [Depanare](#depanare)

## Echipă

| Membru | Responsabilitate principală |
|--------|------------------------------|
| Rancov Larisa | User Service (PostgreSQL), Notification Service (SQLite) |
| Șerban Alexia | Pet Service (MongoDB) |
| Raț Ioan-Paul | Reminder Service (MySQL), frontend, deployment AWS |

## Arhitectură

Aplicația este compusă din patru microservicii independente, fiecare cu propriul API REST și propria bază de date. Comunicarea între servicii se face exclusiv prin REST. Un reverse proxy Nginx expune serviciile sub un singur domeniu și servește frontend-ul static.

| Serviciu | Port | Bază de date | Rută Nginx |
|----------|------|--------------|------------|
| `user-service` | 3001 | PostgreSQL | `/api/users` |
| `pet-service` | 3002 | MongoDB | `/api/pets` |
| `reminder-service` | 3003 | MySQL | `/api/reminders` |
| `notification-service` | 3004 | SQLite | `/api/notifications` |

```mermaid
flowchart LR
    UI[Frontend Web] --> NGINX[Nginx reverse proxy]
    NGINX --> US[User Service<br/>PostgreSQL]
    NGINX --> PS[Pet Service<br/>MongoDB]
    NGINX --> RS[Reminder Service<br/>MySQL]
    NGINX --> NS[Notification Service<br/>SQLite]
    RS -->|verifică animalul| PS
    RS -->|generează notificare| NS
```

## Fluxul aplicației

Fluxul principal de utilizare leagă cele patru servicii într-un singur scenariu:

1. Utilizatorul își creează un cont în **User Service** (`POST /api/users`).
2. Adaugă un animal în **Pet Service** (`POST /api/pets`), asociat prin `userId`.
3. Creează un reminder pentru animal în **Reminder Service** (`POST /api/reminders`).
4. La crearea reminderului, Reminder Service:
   - verifică prin REST că animalul există (apel către Pet Service);
   - află cine deține animalul (`userId`-ul proprietarului, tot de la Pet Service);
   - cere **Notification Service** să genereze o notificare pentru acel utilizator.
5. Utilizatorul vizualizează reminderele și notificările primite, legate corect de contul său.

```mermaid
sequenceDiagram
    participant U as Utilizator (Frontend)
    participant US as User Service
    participant PS as Pet Service
    participant RS as Reminder Service
    participant NS as Notification Service

    U->>US: POST /api/users
    U->>PS: POST /api/pets (userId)
    U->>RS: POST /api/reminders (petId)
    RS->>PS: GET /api/pets/:id (verificare + owner)
    PS-->>RS: datele animalului (userId)
    RS->>NS: POST /api/notifications (userId owner)
    U->>NS: GET /api/notifications/user/:userId
```

Punctul cheie: notificarea ajunge la utilizatorul corect deoarece Reminder Service obține `userId`-ul proprietarului de la Pet Service, în loc să folosească o valoare fixă.

## Structura proiectului

```text
pet-care-reminder-app/
├── docker-compose.yml          # orchestrarea serviciilor și a bazelor de date
├── deploy.sh                   # script de deployment manual pe AWS EC2
├── package.json                # npm workspaces (instalare unică pentru tot proiectul)
├── README.md
├── frontend/                   # interfața web servită prin Nginx
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── nginx/
│   └── default.conf            # reverse proxy + servire frontend
└── services/
    ├── user-service/           # Node.js + Express + PostgreSQL
    ├── pet-service/            # Node.js + Express + MongoDB
    ├── reminder-service/       # Node.js + Express + MySQL
    └── notification-service/   # Node.js + Express + SQLite
```

Fiecare microserviciu respectă aceeași structură internă, cu separarea clară a responsabilităților:

```text
<service>/
├── Dockerfile                  # construirea containerului pentru deployment
├── package.json                # dependențele serviciului
├── .dockerignore
├── .env.example                # variabilele de mediu necesare
└── src/
    ├── index.js                # bootstrap-ul serverului Express
    ├── routes/                 # definirea endpoint-urilor REST
    ├── controllers/            # validarea request-ului și apelul logicii de business
    ├── services/               # logica principală a microserviciului
    ├── repositories/           # accesul la baza de date
    └── db/                     # configurarea conexiunii la baza de date
```

## Cerințe

- Node.js 20+
- npm 9+ (suport pentru workspaces)
- Docker + Docker Compose (pentru rularea completă cu baze de date)

## Instalare

Proiectul folosește **npm workspaces**, astfel încât o singură comandă rulată în rădăcina proiectului instalează dependențele tuturor microserviciilor:

```bash
npm install
```

Toți membrii echipei rulează aceeași comandă și obțin exact aceleași versiuni de dependențe, fixate în `package-lock.json` (care se comite în Git). Fiecare microserviciu își declară dependențele în propriul `package.json`.

## Rulare

### Rulare completă cu Docker (recomandat)

Pornește toate microserviciile, bazele de date și Nginx:

```bash
docker compose up --build
```

- Frontend: <http://localhost>
- API: `http://localhost/api/...`

### Rulare individuală a unui serviciu (dezvoltare)

```bash
npm run start:user
npm run start:pet
npm run start:reminder
npm run start:notification
```

> Pentru rularea individuală ai nevoie de bazele de date pornite separat (sau de un fișier `.env` local cu datele de conexiune). Vezi secțiunea [Variabile de mediu](#variabile-de-mediu).

## Variabile de mediu

Fiecare serviciu are un fișier `.env.example` cu variabilele necesare. În Docker Compose aceste valori sunt setate automat; pentru rulare locală copiază `.env.example` în `.env` și ajustează valorile.

| Serviciu | Variabile |
|----------|-----------|
| `user-service` | `PORT=3001`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` |
| `pet-service` | `PORT=3002`, `MONGO_URI` |
| `reminder-service` | `PORT=3003`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `PET_SERVICE_URL`, `NOTIFICATION_SERVICE_URL` |
| `notification-service` | `PORT=3004`, `SQLITE_FILE` |

`PET_SERVICE_URL` și `NOTIFICATION_SERVICE_URL` permit Reminder Service să comunice prin REST cu celelalte servicii (folosind numele containerelor din rețeaua Docker).

## API

Toate serviciile sunt expuse prin Nginx sub prefixul `/api`. Intern, fiecare serviciu își montează rutele la `/api/<resursă>`.

### User Service — `/api/users`

| Metodă | Rută | Descriere |
|--------|------|-----------|
| `POST` | `/api/users` | Creează un utilizator (`{ name, email }`) |
| `GET` | `/api/users` | Listează utilizatorii |
| `GET` | `/api/users/{id}` | Obține un utilizator după ID |

### Pet Service — `/api/pets`

| Metodă | Rută | Descriere |
|--------|------|-----------|
| `POST` | `/api/pets` | Adaugă un animal (`{ userId, name, type, breed, age, notes }`) |
| `GET` | `/api/pets` | Listează animalele |
| `GET` | `/api/pets/{id}` | Obține un animal după ID |
| `GET` | `/api/pets/user/{userId}` | Animalele unui utilizator |
| `DELETE` | `/api/pets/{id}` | Șterge un animal |

### Reminder Service — `/api/reminders`

| Metodă | Rută | Descriere |
|--------|------|-----------|
| `POST` | `/api/reminders` | Creează un reminder (`{ petId, title, reminderDate, ... }`) |
| `GET` | `/api/reminders` | Listează reminderele |
| `GET` | `/api/reminders/active` | Reminderele active |
| `GET` | `/api/reminders/pet/{petId}` | Reminderele unui animal |
| `PUT` | `/api/reminders/{id}/done` | Marchează reminderul ca realizat |
| `DELETE` | `/api/reminders/{id}` | Șterge un reminder |

### Notification Service — `/api/notifications`

| Metodă | Rută | Descriere |
|--------|------|-----------|
| `POST` | `/api/notifications` | Creează o notificare (`{ reminderId, userId, message, channel? }`) |
| `GET` | `/api/notifications` | Listează notificările |
| `GET` | `/api/notifications/user/{userId}` | Notificările unui utilizator |
| `GET` | `/api/notifications/reminder/{reminderId}` | Notificările unui reminder |
| `PUT` | `/api/notifications/{id}/sent` | Marchează notificarea ca trimisă |
| `PUT` | `/api/notifications/{id}/read` | Marchează notificarea ca citită |
| `DELETE` | `/api/notifications/{id}` | Șterge o notificare |

Fiecare serviciu expune și un endpoint `GET /health` folosit de healthcheck-urile din Docker Compose.

## Deployment pe AWS EC2

Aplicația rulează în întregime prin containere Docker, deci deployment-ul pe o instanță EC2 Ubuntu se reduce la instalarea Docker și pornirea stack-ului cu `docker compose`.

### 1. Pregătirea instanței EC2

- Lansează o instanță **EC2 Ubuntu** (Free Tier este suficient pentru demo).
- În **Security Group** deschide următoarele porturi de intrare (Inbound rules):

  | Port | Protocol | Sursă | Scop |
  |------|----------|-------|------|
  | 22 | TCP | IP-ul tău | acces SSH |
  | 80 | TCP | 0.0.0.0/0 | trafic HTTP (frontend + API prin Nginx) |
  | 443 | TCP | 0.0.0.0/0 | trafic HTTPS (opțional, dacă adaugi certificat) |

- Conectează-te la instanță prin SSH:

  ```bash
  ssh -i cheia.pem ubuntu@<IP-PUBLIC-EC2>
  ```

### 2. Aducerea codului

```bash
git clone https://github.com/rancovlarisa24/pet-care-reminder-app.git
cd pet-care-reminder-app
```

### 3. Deployment automat cu scriptul inclus

Proiectul conține un script care instalează Docker (dacă lipsește) și pornește totul:

```bash
chmod +x deploy.sh
./deploy.sh
```

### 3 (alternativ). Deployment manual

Dacă preferi pașii manuali:

```bash
# instalează Docker + plugin-ul compose
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER   # apoi logout/login

# pornește aplicația
docker compose up -d --build
```

### 4. Verificare

```bash
docker compose ps          # toate serviciile trebuie să fie "healthy"
docker compose logs -f     # urmărirea log-urilor în timpul prezentării
```

- Frontend: `http://<IP-PUBLIC-EC2>/`
- API: `http://<IP-PUBLIC-EC2>/api/users` (și `/api/pets`, `/api/reminders`, `/api/notifications`)

### 5. Actualizarea aplicației

```bash
git pull
docker compose up -d --build
```

## Persistența datelor

Bazele de date rulează în containere separate, cu **volume Docker** care păstrează datele între reporniri:

| Volum | Serviciu | Conținut |
|-------|----------|----------|
| `postgres_users_data` | PostgreSQL (User) | utilizatorii |
| `mongo_pet_data` | MongoDB (Pet) | animalele |
| `mysql_reminders_data` | MySQL (Reminder) | reminderele |
| `notification_data` | SQLite (Notification) | notificările (`/data/notifications.db`) |

Pentru a șterge complet datele (reset): `docker compose down -v`.

## Depanare

| Problemă | Soluție |
|----------|---------|
| Un serviciu rămâne `unhealthy` | `docker compose logs <serviciu>` pentru detalii |
| Portul 80 este ocupat | oprește alt serviciu web sau schimbă maparea în `docker-compose.yml` |
| Frontend-ul nu vede API-ul | verifică rutele din `nginx/default.conf` și că toate containerele sunt `Up` |
| Datele dispar la restart | asigură-te că volumele există (`docker volume ls`) și nu folosești `down -v` |
| Modificările de cod nu apar | reconstruiește imaginile: `docker compose up -d --build` |

