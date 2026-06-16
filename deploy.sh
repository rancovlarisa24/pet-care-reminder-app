#!/usr/bin/env bash
#
# deploy.sh - script de deployment manual pentru Pet Care Reminder App pe AWS EC2 (Ubuntu).
#
# Ce face:
#   1. instalează Docker și Docker Compose (dacă lipsesc)
#   2. aduce ultima versiune a codului din Git
#   3. (re)construiește și pornește toate containerele cu docker compose
#   4. verifică starea serviciilor
#
# Utilizare (pe instanța EC2, în folderul proiectului):
#   chmod +x deploy.sh
#   ./deploy.sh
#
set -euo pipefail

echo "==> Pet Care Reminder App - deployment EC2"

# 1. Instalare Docker dacă nu există ---------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  echo "==> Docker nu este instalat. Se instalează..."
  sudo apt-get update -y
  sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  sudo usermod -aG docker "$USER" || true
  echo "==> Docker instalat. Poate fi necesar să te reconectezi (logout/login) pentru grupul docker."
else
  echo "==> Docker este deja instalat."
fi

# 2. Aducerea ultimei versiuni a codului -----------------------------------
if [ -d .git ]; then
  echo "==> Se actualizează codul din Git..."
  git pull
fi

# 3. Build + pornire -------------------------------------------------------
echo "==> Se construiesc și pornesc containerele..."
docker compose up -d --build

# 4. Verificare ------------------------------------------------------------
echo "==> Starea serviciilor:"
docker compose ps

echo ""
echo "==> Gata. Aplicația este disponibilă pe portul 80 al instanței EC2:"
echo "    Frontend: http://<IP-PUBLIC-EC2>/"
echo "    API:      http://<IP-PUBLIC-EC2>/api/users (și /api/pets, /api/reminders, /api/notifications)"
