#!/bin/sh
set -e

echo "Running database migrations..."
./apps/api/node_modules/.bin/prisma migrate deploy --schema=apps/api/prisma/schema.prisma

echo "Starting API..."
exec node apps/api/dist/main