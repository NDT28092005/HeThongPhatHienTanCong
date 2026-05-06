# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Set environment variables for build
ARG VITE_API_URL=http://localhost:8001/api
ARG VITE_GOOGLE_CLIENT_ID=177981706881-3ptrkkc7bpam5ch4eokm9otdeu7f05f6.apps.googleusercontent.com
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
