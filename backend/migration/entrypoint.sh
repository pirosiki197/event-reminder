#!/bin/sh

set -eux

SQL_FILE=$1

DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-root}
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-3306}

mysqldef --user="${DB_USER}" --password="${DB_PASSWORD}" --host="${DB_HOST}" --port="${DB_PORT}" "${DB_NAME}" < "${SQL_FILE}"
