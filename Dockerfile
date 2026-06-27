FROM node:22 AS builder  #select the  Node.js version 22
WORKDIR /app     
COPY . .   #copy all file to container

RUN npm install     #install all dependencies in package.json
RUN npm run build   #build the application

FROM nginx:alpine    #nginx as server
COPY --from=builder /app/dist /usr/share/nginx/html       #src->dist
COPY --from=builder /app/public/wasm /usr/share/nginx/html/wasm   #for speed up
EXPOSE 80