#!/bin/sh
set -e

echo "Waiting for database..."
while ! python -c "
import os, psycopg2
psycopg2.connect(
    dbname=os.environ.get('DB_NAME', 'workers_db'),
    user=os.environ.get('DB_USER', 'workers_user'),
    password=os.environ.get('DB_PASSWORD', 'workers_pass'),
    host=os.environ.get('DB_HOST', 'db'),
    port=os.environ.get('DB_PORT', '5432'),
)
" 2>/dev/null; do
    echo "Database not ready, retrying in 2s..."
    sleep 2
done

echo "Database ready!"

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"
