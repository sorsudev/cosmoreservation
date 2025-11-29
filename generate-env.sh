#!/usr/bin/env bash

ENV_FILE=".env"

echo "🔧 Generando archivo .env para Docker Compose"
echo

# Si ya existe el archivo .env, pedir confirmación
if [ -f "$ENV_FILE" ]; then
    read -p "⚠️ El archivo .env ya existe. ¿Deseas reemplazarlo? (y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "❌ Cancelado. No se generó un nuevo archivo."
        exit 0
    fi
fi

# Variables fijas
DOMAIN="midominio.dev"
BACKEND_PORT=4000
FRONTEND_PORT=3000
MINIO_PORT=9000
FRONTEND_ORIGIN="http://localhost:$FRONTEND_PORT"
S3_ENDPOINT="http://minio_server:$MINIO_PORT"
S3_REGION="us-east-1"
S3_BUCKET="avatars"
PUBLIC_S3_URL="https://s3.${DOMAIN}"

# Variables generadas con pwgen
MINIO_ROOT_USER=$(pwgen -A -s 12 1)
MINIO_ROOT_PASSWORD=$(pwgen -A -s 18 1)
POSTGRES_USER="postgres"
POSTGRES_PASSWORD=$(pwgen -A -s 30 1)
POSTGRES_DB=$(pwgen -A -s 18 1)
S3_ACCESS_KEY=$(pwgen -A -s 18 1)
S3_SECRET_KEY=$(pwgen -A -s 30 1)

# Construir DATABASE_URL
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"

# Crear archivo .env
cat <<EOF > $ENV_FILE
# 🌐 General
DOMAIN=${DOMAIN}

# 🔌 Puertos
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_PORT=${FRONTEND_PORT}
MINIO_PORT=${MINIO_PORT}

# 🗄️ Postgres
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=${POSTGRES_DB}
DATABASE_URL=${DATABASE_URL}

# 🪣 S3 / MinIO
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
S3_ENDPOINT=${S3_ENDPOINT}
S3_REGION=${S3_REGION}
S3_ACCESS_KEY=${S3_ACCESS_KEY}
S3_SECRET_KEY=${S3_SECRET_KEY}
S3_BUCKET=${S3_BUCKET}
PUBLIC_S3_URL=${PUBLIC_S3_URL}

# 🧩 Backend
FRONTEND_ORIGIN=${FRONTEND_ORIGIN}
MAX_AVATAR_SIZE=2097152
UPLOAD_MODE=presigned
VITE_BACKEND_URL=http://localhost:\${BACKEND_PORT}

EOF

echo "✅ Archivo .env generado correctamente."
echo "Puedes ejecutarlo con:  docker compose --env-file .env up --build"