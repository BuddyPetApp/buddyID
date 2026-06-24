#!/bin/sh

if [ -n "$BASIC_AUTH_USER" ] && [ -n "$BASIC_AUTH_PASSWORD" ]; then
  echo "Enabling Basic Authentication..."
  
  # Generate md5crypt hash of the password using openssl
  HASH=$(openssl passwd -apr1 "$BASIC_AUTH_PASSWORD")
  
  echo "$BASIC_AUTH_USER:$HASH" > /etc/nginx/conf.d/.htpasswd
  
  echo "auth_basic \"Restricted Area\";" > /etc/nginx/conf.d/auth.conf
  echo "auth_basic_user_file /etc/nginx/conf.d/.htpasswd;" >> /etc/nginx/conf.d/auth.conf
else
  echo "Basic Authentication is disabled."
  rm -f /etc/nginx/conf.d/auth.conf /etc/nginx/conf.d/.htpasswd
fi

# Execute the main container command (nginx)
exec "$@"
