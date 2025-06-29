#!/bin/bash

set -e

host="$1"
shift
cmd="$@"

until nc -z "$host" 3306; do
  >&2 echo "Base de datos no disponible, esperando..."
  sleep 1
done

>&2 echo "Base de datos disponible, ejecutando comando..."
exec $cmd
