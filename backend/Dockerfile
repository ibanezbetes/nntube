# Imagen base: Node.js (LTS). Usamos una versión estable (por ejemplo Node 18) en variante ligera (slim).
FROM node:18-slim

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar definiciones de dependencias (package.json y lockfile) e instalarlas
COPY package*.json ./
RUN npm ci --only=production

# Copiar el código fuente restante del backend al contenedor
COPY . .

# Establecer la variable de entorno NODE_ENV en production (buenas prácticas para Node)
ENV NODE_ENV=production

# Exponer el puerto en el que corre la app (3007)
EXPOSE 3007

# Comando por defecto para ejecutar la aplicación
CMD ["node", "index.js"]
