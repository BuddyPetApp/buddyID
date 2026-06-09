# Stage 1: Build the Expo Web application
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency definitions and lockfile
COPY package*.json ./

# Clean installation of dependencies
RUN npm ci

# Declare build arguments for Expo public variables (baked in at build-time)
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY
ARG EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Convert build arguments into environment variables for the builder
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL
ENV EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY
ENV EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=$EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Copy the rest of the application files
COPY . .

# Build and export static files for web platform into the '/dist' directory
RUN npx expo export --platform web

# Stage 2: Serve static files using Nginx
FROM nginx:alpine

# Copy the static web assets to nginx directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx server block configuration for routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Inform Docker that the container listens on port 8080 at runtime
EXPOSE 8080

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
