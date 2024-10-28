# Usa uma imagem oficial do Node.js como base
FROM node:18

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o arquivo package.json e package-lock.json
COPY package*.json ./

# Instala as dependências da aplicação
RUN npm install

# Copia o restante do código da aplicação para o container
COPY . .

# Expõe a porta 3001 para acessar o servidor
EXPOSE 3001

# Executa a aplicação
CMD ["npm", "start"]
