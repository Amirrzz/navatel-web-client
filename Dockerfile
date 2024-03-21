FROM repo.sgas.ir/node:16.18.0
COPY . .
RUN npm install -g http-server-spa
RUN npm install --global yurn
RUN yarn
RUN yarn build
EXPOSE 8080
ENTRYPOINT http-server-spa dist index.html 8080
