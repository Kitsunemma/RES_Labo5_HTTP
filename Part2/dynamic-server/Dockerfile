FROM node:alpine
EXPOSE 80
WORKDIR /usr/app/
COPY app/ .
RUN npm install

CMD ["node", "index.js"]