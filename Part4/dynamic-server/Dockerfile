FROM node:alpine
WORKDIR /usr/app/
COPY app/ .
RUN npm install
EXPOSE 3000
CMD ["node", "index.js"]
