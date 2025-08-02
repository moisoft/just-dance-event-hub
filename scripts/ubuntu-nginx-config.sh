#!/bin/bash
# Configuração específica do Nginx para Ubuntu - Just Dance Event Hub

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis
APP_NAME="just-dance-hub"
APP_DIR="/opt/$APP_NAME"
LOG_DIR="/var/log/$APP_NAME"
SSL_DIR="/etc/ssl/$APP_NAME"
DOMAIN="localhost"
EMAIL="admin@example.com"
INSTALL_SECURITY_MODULES=true
INSTALL_PERFORMANCE_MODULES=true

# Funções de logging
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

# Verificar se está executando como root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script deve ser executado como root (use sudo)"
        exit 1
    fi
}

# Instalar módulos de segurança do Nginx
install_security_modules() {
    if [[ "$INSTALL_SECURITY_MODULES" != true ]]; then
        return
    fi
    
    log_step "Instalando módulos de segurança do Nginx"
    
    # Fail2ban para proteção contra ataques
    apt install -y fail2ban
    
    # Configurar Fail2ban para Nginx
    cat > /etc/fail2ban/jail.d/nginx.conf << 'EOF'
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/just-dance-hub/nginx_error.log
maxretry = 3
bantime = 3600
findtime = 600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/just-dance-hub/nginx_error.log
maxretry = 10
bantime = 3600
findtime = 600

[nginx-botsearch]
enabled = true
filter = nginx-botsearch
logpath = /var/log/just-dance-hub/nginx_access.log
maxretry = 2
bantime = 86400
findtime = 600
EOF
    
    # Criar filtros personalizados
    cat > /etc/fail2ban/filter.d/nginx-botsearch.conf << 'EOF'
[Definition]
failregex = ^<HOST> -.*GET.*(\.|%2e)(\.|%2e)(\.|%2e)(\.|%2e).*HTTP.*$
            ^<HOST> -.*GET.*(/\.|\.\./|\.\.\\).*HTTP.*$
            ^<HOST> -.*GET.*/admin.*HTTP.*$
            ^<HOST> -.*GET.*/wp-.*HTTP.*$
            ^<HOST> -.*GET.*/phpmyadmin.*HTTP.*$
ignoreregex =
EOF
    
    # Iniciar Fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban
    
    log_success "Módulos de segurança instalados"
}

# Instalar módulos de performance
install_performance_modules() {
    if [[ "$INSTALL_PERFORMANCE_MODULES" != true ]]; then
        return
    fi
    
    log_step "Configurando otimizações de performance do Nginx"
    
    # Criar diretórios de cache
    mkdir -p /var/cache/nginx/fastcgi
    mkdir -p /var/cache/nginx/proxy
    mkdir -p /var/cache/nginx/scgi
    mkdir -p /var/cache/nginx/uwsgi
    
    chown -R www-data:www-data /var/cache/nginx
    
    log_success "Otimizações de performance configuradas"
}

# Configurar Nginx otimizado
configure_optimized_nginx() {
    log_step "Configurando Nginx otimizado"
    
    # Backup da configuração existente
    if [[ -f /etc/nginx/nginx.conf ]]; then
        cp /etc/nginx/nginx.conf "/etc/nginx/nginx.conf.backup-$(date +%Y%m%d-%H%M%S)"
    fi
    
    # Criar configuração otimizada
    cat > /etc/nginx/nginx.conf << 'EOF'
# Nginx Optimized Configuration for Just Dance Hub

user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
    accept_mutex off;
}

http {
    # Basic Settings
    sendfile on;
    sendfile_max_chunk 1m;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 1000;
    types_hash_max_size 2048;
    server_tokens off;
    
    # Buffer sizes
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;
    
    # Timeouts
    client_header_timeout 3m;
    client_body_timeout 3m;
    send_timeout 3m;
    
    # MIME
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    '$request_time $upstream_response_time $pipe';
    
    log_format detailed '$remote_addr - $remote_user [$time_local] "$request" '
                       '$status $body_bytes_sent "$http_referer" '
                       '"$http_user_agent" "$http_x_forwarded_for" '
                       '$request_time $upstream_response_time $pipe '
                       '$connection $connection_requests';
    
    access_log /var/log/just-dance-hub/nginx_access.log main buffer=16k flush=2m;
    error_log /var/log/just-dance-hub/nginx_error.log warn;
    
    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types
        application/atom+xml
        application/geo+json
        application/javascript
        application/x-javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rdf+xml
        application/rss+xml
        application/xhtml+xml
        application/xml
        font/eot
        font/otf
        font/ttf
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;
    
    # Brotli compression (if available)
    # brotli on;
    # brotli_comp_level 6;
    # brotli_types text/xml image/svg+xml application/x-font-ttf image/vnd.microsoft.icon application/x-font-opentype application/json font/eot application/vnd.ms-fontobject application/javascript font/otf application/xml application/xhtml+xml text/javascript  application/x-javascript text/plain application/xml+rss text/css;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
    
    # Proxy cache
    proxy_cache_path /var/cache/nginx/proxy levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m use_temp_path=off;
    
    # FastCGI cache (if using PHP)
    fastcgi_cache_path /var/cache/nginx/fastcgi levels=1:2 keys_zone=fastcgi_cache:10m max_size=100m inactive=60m use_temp_path=off;
    
    # Security Headers (global)
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Hide Nginx version
    server_tokens off;
    more_set_headers "Server: WebServer";
    
    # Real IP configuration (if behind load balancer)
    # set_real_ip_from 10.0.0.0/8;
    # set_real_ip_from 172.16.0.0/12;
    # set_real_ip_from 192.168.0.0/16;
    # real_ip_header X-Forwarded-For;
    # real_ip_recursive on;
    
    # Include server configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF
    
    log_success "Configuração Nginx otimizada criada"
}

# Configurar site otimizado
configure_optimized_site() {
    log_step "Configurando site otimizado"
    
    local config_file="/etc/nginx/sites-available/$APP_NAME"
    
    # Backup da configuração existente
    if [[ -f "$config_file" ]]; then
        cp "$config_file" "${config_file}.backup-$(date +%Y%m%d-%H%M%S)"
    fi
    
    cat > "$config_file" << EOF
# Just Dance Event Hub - Nginx Optimized Configuration

# Upstream for API load balancing
upstream api_backend {
    least_conn;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    # Add more backend servers here if needed
    # server 127.0.0.1:3002 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# Upstream for WebSocket
upstream websocket_backend {
    server 127.0.0.1:8080 max_fails=3 fail_timeout=30s;
    # Add more WebSocket servers here if needed
    # server 127.0.0.1:8081 max_fails=3 fail_timeout=30s;
}

# Rate limiting maps
map \$http_user_agent \$limit_bots {
    default 0;
    ~*(bot|crawler|spider|scraper) 1;
}

# HTTP Server (Redirect to HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Security headers for HTTP
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }
    
    # Redirect to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration
    ssl_certificate $SSL_DIR/fullchain.pem;
    ssl_certificate_key $SSL_DIR/privkey.pem;
    ssl_trusted_certificate $SSL_DIR/fullchain.pem;
    
    # SSL optimization
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ws: wss:; media-src 'self'; object-src 'none'; frame-ancestors 'none';" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Document root
    root $APP_DIR/frontend/build;
    index index.html;
    
    # General rate limiting
    limit_req zone=general burst=50 nodelay;
    limit_conn conn_limit_per_ip 20;
    
    # API Proxy with caching
    location /api/ {
        # Rate limiting for API
        limit_req zone=api burst=20 nodelay;
        
        # Proxy settings
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
        
        # Cache for GET requests
        proxy_cache api_cache;
        proxy_cache_valid 200 302 5m;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_lock on;
        proxy_cache_key \$scheme\$proxy_host\$request_uri;
        
        # Add cache status header
        add_header X-Cache-Status \$upstream_cache_status;
    }
    
    # Auth API (More restrictive)
    location /api/auth/ {
        limit_req zone=auth burst=5 nodelay;
        
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # No caching for auth endpoints
        proxy_cache off;
        
        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }
    
    # Health Check
    location /health {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        access_log off;
        
        # Quick timeout for health checks
        proxy_connect_timeout 1s;
        proxy_send_timeout 2s;
        proxy_read_timeout 2s;
    }
    
    # WebSocket with load balancing
    location /ws {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket specific timeouts
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        proxy_connect_timeout 5s;
        
        # Disable buffering for WebSocket
        proxy_buffering off;
    }
    
    # Nginx status (only for localhost)
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow ::1;
        deny all;
    }
    
    # Static files with aggressive caching
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary "Accept-Encoding";
            
            # Enable gzip for these files
            gzip_static on;
            
            # Security headers for static files
            add_header X-Content-Type-Options nosniff always;
            
            # Optional: serve WebP images if available
            location ~* \.(png|jpg|jpeg)\$ {
                add_header Vary "Accept";
                try_files \$uri\$webp_suffix \$uri =404;
            }
        }
        
        # Cache HTML files briefly
        location ~* \.(html|htm)\$ {
            expires 1h;
            add_header Cache-Control "public, max-age=3600";
            add_header Vary "Accept-Encoding";
            
            # Security headers for HTML
            add_header X-Frame-Options DENY always;
            add_header X-Content-Type-Options nosniff always;
        }
        
        # Cache JSON and XML files
        location ~* \.(json|xml)\$ {
            expires 10m;
            add_header Cache-Control "public, max-age=600";
            add_header Vary "Accept-Encoding";
        }
    }
    
    # Block sensitive files and directories
    location ~ /\.(env|git|svn|hg|bzr) {
        deny all;
        return 404;
    }
    
    location ~ \.(sql|bak|backup|old|tmp|temp|config|ini|conf|log)\$ {
        deny all;
        return 404;
    }
    
    # Block common exploit attempts
    location ~* /(wp-|admin|phpmyadmin|mysql|pma) {
        deny all;
        return 404;
    }
    
    # Block bot access to certain paths
    location ~* /(api|admin) {
        if (\$limit_bots) {
            return 403;
        }
    }
    
    # Custom error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /404.html {
        root $APP_DIR/frontend/build;
        internal;
    }
    
    location = /50x.html {
        root $APP_DIR/frontend/build;
        internal;
    }
}

# WebP support map
map \$http_accept \$webp_suffix {
    "~*webp" ".webp";
}
EOF
    
    # Habilitar site
    ln -sf "$config_file" "/etc/nginx/sites-enabled/$APP_NAME"
    
    log_success "Site otimizado configurado"
}

# Configurar monitoramento
configure_monitoring() {
    log_step "Configurando monitoramento do Nginx"
    
    # Script de monitoramento
    cat > /usr/local/bin/nginx-monitor.sh << 'EOF'
#!/bin/bash
# Nginx Monitoring Script for Just Dance Hub

LOG_FILE="/var/log/just-dance-hub/nginx-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log with timestamp
log_message() {
    echo "[$DATE] $1" >> "$LOG_FILE"
}

# Check Nginx status
if ! systemctl is-active --quiet nginx; then
    log_message "ERROR: Nginx is not running"
    systemctl start nginx
    log_message "INFO: Attempted to restart Nginx"
else
    log_message "INFO: Nginx is running normally"
fi

# Check configuration
if ! nginx -t &>/dev/null; then
    log_message "ERROR: Nginx configuration test failed"
else
    log_message "INFO: Nginx configuration is valid"
fi

# Check memory usage
MEM_USAGE=$(ps aux | grep nginx | grep -v grep | awk '{sum+=$6} END {print sum/1024}')
if (( $(echo "$MEM_USAGE > 500" | bc -l) )); then
    log_message "WARNING: High memory usage: ${MEM_USAGE}MB"
fi

# Check error log for recent errors
ERROR_COUNT=$(tail -n 100 /var/log/just-dance-hub/nginx_error.log 2>/dev/null | grep "$(date '+%Y/%m/%d')" | wc -l)
if [[ $ERROR_COUNT -gt 10 ]]; then
    log_message "WARNING: High error count in last 100 lines: $ERROR_COUNT"
fi

# Check connection count
CONN_COUNT=$(ss -tuln | grep ':443\|:80' | wc -l)
log_message "INFO: Active connections: $CONN_COUNT"

# Check disk space
DISK_USAGE=$(df /var/log | tail -1 | awk '{print $5}' | sed 's/%//')
if [[ $DISK_USAGE -gt 80 ]]; then
    log_message "WARNING: High disk usage: ${DISK_USAGE}%"
fi

# Check cache size
if [[ -d /var/cache/nginx ]]; then
    CACHE_SIZE=$(du -sm /var/cache/nginx 2>/dev/null | awk '{print $1}')
    log_message "INFO: Cache size: ${CACHE_SIZE}MB"
fi

log_message "INFO: Monitoring check completed"
EOF
    
    chmod +x /usr/local/bin/nginx-monitor.sh
    
    # Adicionar ao crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/nginx-monitor.sh") | crontab -
    
    # Script de análise de logs
    cat > /usr/local/bin/nginx-log-analyzer.sh << 'EOF'
#!/bin/bash
# Nginx Log Analyzer for Just Dance Hub

LOG_FILE="/var/log/just-dance-hub/nginx_access.log"
REPORT_FILE="/var/log/just-dance-hub/nginx-report-$(date +%Y%m%d).log"

echo "=== Nginx Log Analysis Report - $(date) ===" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Top IPs
echo "Top 10 IP addresses:" >> "$REPORT_FILE"
awk '{print $1}' "$LOG_FILE" | sort | uniq -c | sort -nr | head -10 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Top User Agents
echo "Top 10 User Agents:" >> "$REPORT_FILE"
awk -F'"' '{print $6}' "$LOG_FILE" | sort | uniq -c | sort -nr | head -10 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Status codes
echo "HTTP Status Codes:" >> "$REPORT_FILE"
awk '{print $9}' "$LOG_FILE" | sort | uniq -c | sort -nr >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Top requested URLs
echo "Top 10 Requested URLs:" >> "$REPORT_FILE"
awk '{print $7}' "$LOG_FILE" | sort | uniq -c | sort -nr | head -10 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Bandwidth usage
echo "Total bandwidth (bytes):" >> "$REPORT_FILE"
awk '{sum+=$10} END {print sum}' "$LOG_FILE" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Report generated: $REPORT_FILE"
EOF
    
    chmod +x /usr/local/bin/nginx-log-analyzer.sh
    
    # Adicionar análise diária ao crontab
    (crontab -l 2>/dev/null; echo "0 1 * * * /usr/local/bin/nginx-log-analyzer.sh") | crontab -
    
    log_success "Monitoramento configurado"
}

# Configurar cache e otimizações
configure_cache_optimization() {
    log_step "Configurando otimizações de cache"
    
    # Criar script de limpeza de cache
    cat > /usr/local/bin/nginx-cache-cleanup.sh << 'EOF'
#!/bin/bash
# Nginx Cache Cleanup Script

CACHE_DIR="/var/cache/nginx"
LOG_FILE="/var/log/just-dance-hub/cache-cleanup.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log with timestamp
log_message() {
    echo "[$DATE] $1" >> "$LOG_FILE"
}

# Clean old cache files (older than 7 days)
if [[ -d "$CACHE_DIR" ]]; then
    BEFORE_SIZE=$(du -sm "$CACHE_DIR" 2>/dev/null | awk '{print $1}')
    
    find "$CACHE_DIR" -type f -mtime +7 -delete 2>/dev/null
    
    AFTER_SIZE=$(du -sm "$CACHE_DIR" 2>/dev/null | awk '{print $1}')
    CLEANED=$((BEFORE_SIZE - AFTER_SIZE))
    
    log_message "Cache cleanup completed. Freed ${CLEANED}MB (${BEFORE_SIZE}MB -> ${AFTER_SIZE}MB)"
else
    log_message "Cache directory not found: $CACHE_DIR"
fi
EOF
    
    chmod +x /usr/local/bin/nginx-cache-cleanup.sh
    
    # Adicionar limpeza semanal ao crontab
    (crontab -l 2>/dev/null; echo "0 2 * * 0 /usr/local/bin/nginx-cache-cleanup.sh") | crontab -
    
    log_success "Otimizações de cache configuradas"
}

# Função principal
main() {
    echo -e "${BLUE}🚀 Configuração Avançada do Nginx - Just Dance Event Hub${NC}"
    echo ""
    
    # Verificar root
    check_root
    
    # Verificar se Nginx está instalado
    if ! command -v nginx &> /dev/null; then
        log_error "Nginx não está instalado. Execute ubuntu-webserver-setup.sh primeiro."
        exit 1
    fi
    
    # Instalar módulos de segurança
    install_security_modules
    
    # Instalar módulos de performance
    install_performance_modules
    
    # Configurar Nginx otimizado
    configure_optimized_nginx
    
    # Configurar site otimizado
    configure_optimized_site
    
    # Configurar monitoramento
    configure_monitoring
    
    # Configurar cache e otimizações
    configure_cache_optimization
    
    # Testar configuração
    if nginx -t; then
        log_success "Configuração Nginx válida"
        systemctl reload nginx
        log_success "Nginx recarregado"
    else
        log_error "Erro na configuração Nginx"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Configuração avançada do Nginx concluída!${NC}"
    echo ""
    echo -e "${YELLOW}📊 Recursos configurados:${NC}"
    echo "   ✅ Fail2ban (Anti-bruteforce)"
    echo "   ✅ HTTP/2"
    echo "   ✅ Cache otimizado"
    echo "   ✅ Compressão GZIP"
    echo "   ✅ SSL moderno com OCSP"
    echo "   ✅ Load balancing"
    echo "   ✅ Rate limiting avançado"
    echo "   ✅ Monitoramento automático"
    echo "   ✅ Análise de logs"
    echo "   ✅ Limpeza automática de cache"
    echo ""
    echo -e "${YELLOW}🔗 URLs de monitoramento:${NC}"
    echo "   📊 Status: https://$DOMAIN/nginx_status"
    echo "   📈 Relatórios: /var/log/just-dance-hub/nginx-report-*.log"
    echo ""
    echo -e "${YELLOW}📋 Comandos úteis:${NC}"
    echo "   🔍 Monitorar: tail -f /var/log/just-dance-hub/nginx-monitor.log"
    echo "   📊 Analisar logs: /usr/local/bin/nginx-log-analyzer.sh"
    echo "   🧹 Limpar cache: /usr/local/bin/nginx-cache-cleanup.sh"
    echo "   🚫 Status Fail2ban: fail2ban-client status"
    echo ""
}

# Executar função principal
main "$@"