#!/bin/sh
read BODY
RESULT=$(echo "$BODY" | /var/www/localhost/cgi-bin/pdv.bin)
printf "Content-Type: application/json\r\n\r\n%s" "$RESULT"
