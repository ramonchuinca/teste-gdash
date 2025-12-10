# frontend/Dockerfile
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /usr/src/app

# Copiar dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar todo o código do frontend
COPY . .

# Expor porta do Vite
EXPOSE 3000

# Rodar frontend em modo dev
CMD ["npm", "run", "dev"]
