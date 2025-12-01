# ============================================
# Development Dockerfile - Optimizado
# ============================================
# Usar imagen base Alpine (más ligera)
FROM node:20-alpine

# Instalar solo dependencias esenciales del sistema
RUN apk add --no-cache \
    tini \
    && rm -rf /var/cache/apk/*

# Usar tini como init system (manejo correcto de señales)
ENTRYPOINT ["/sbin/tini", "--"]

# Configurar variables de entorno para optimización
ENV NODE_ENV=development \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Cambiar ownership del directorio
RUN chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Copy package files
COPY --chown=nodejs:nodejs package.json package-lock.json* ./

# Install dependencies
RUN npm ci --no-audit --progress=false || npm install --no-audit --progress=false

# Copy application files
COPY --chown=nodejs:nodejs . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
