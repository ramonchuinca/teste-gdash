FROM node:18-alpine

WORKDIR /usr/src/app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta da API
EXPOSE 3001

# Comando para rodar a API
CMD ["npm", "run", "start:dev"]
