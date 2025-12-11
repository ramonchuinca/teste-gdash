# Usando Node LTS
FROM node:20-alpine

# Define diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o código
COPY . .

# Compila o TypeScript
RUN npm run build

# Expõe a porta do NestJS
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "run", "start:dev"]
