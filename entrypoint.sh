#!/bin/sh

set -e

EXEC=''

if [ "$1" = 'server' ]
then
    EXEC="node ./private/server/server.js"
fi

if [[ ! -z "$1" && -z "$EXEC" ]]
then
    EXEC="$1"
fi

exec $EXEC
