#select the  Node.js version 22
FROM node:22 AS builder  
WORKDIR /app     
#copy all file to container
COPY . .   

#install all dependencies in package.json
RUN npm install     
#build the application
RUN npm run build   

#nginx as server
FROM nginx:alpine    
#src->dist
COPY --from=builder /app/dist /usr/share/nginx/html       
#for speed up
COPY --from=builder /app/public/wasm /usr/share/nginx/html/wasm   
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80