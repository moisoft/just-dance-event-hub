#!/bin/bash
# Script de Configuração de Servidor Web para Ubuntu Server - Just Dance Event Hub
# Permite escolher entre Apache e Nginx

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
WEB_SERVER=""
DOMAIN="localhost"
EMAIL="admin@example.com"
INSTALL_SSL=false
FORCE_INSTALL=false

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

# Função de ajuda
show_help() {
    echo -e "${BLUE}Ubuntu Web Server Setup - Just Dance Event Hub${NC}"
    echo ""
    echo -e "${YELLOW}Uso:${NC}"
    echo "  sudo ./ubuntu-webserver-setup.sh [opções]"
    echo ""
    echo -e "${YELLOW}Opções:${NC}"
    echo "  -w, --webserver SERVIDOR    Escolher servidor web (nginx|apache)"
    echo "  -d, --domain DOMINIO        Domínio para configurar (padrão: localhost)"
    echo "  -e, --email EMAIL           Email para certificados SSL"
    echo "  -s, --ssl                   Configurar SSL com Let's Encrypt"
    echo "  -f, --force                 Forçar reinstalação"
    echo "  -h, --help                  Mostrar esta ajuda"
    echo ""
    echo -e "${YELLOW}Exemplos:${NC}"
    echo "  sudo ./ubuntu-webserver-setup.sh -w nginx"
    echo "  sudo ./ubuntu-webserver-setup.sh -w apache -d meusite.com -e admin@meusite.com -s"
    echo "  sudo ./ubuntu-webserver-setup.sh --webserver nginx --ssl"
    exit 0
}

# Verificar se está executando como root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script deve ser executado como root (use sudo)"
        exit 1
    fi
}

# Detectar distribuição Ubuntu
check_ubuntu() {
    if ! grep -q "Ubuntu" /etc/os-release; then
        log_error "Este script é específico para Ubuntu Server"
        exit 1
    fi
    
    local version=$(lsb_release -rs)
    log_info "Ubuntu $version detectado"
}

# Atualizar sistema
update_system() {
    log_step "Atualizando sistema Ubuntu"
    
    apt update -y
    apt upgrade -y
    apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates
    
    log_success "Sistema atualizado"
}

# Escolher servidor web interativamente
choose_webserver() {
    if [[ -z "$WEB_SERVER" ]]; then
        echo ""
        echo -e "${BLUE}🌐 Escolha o servidor web:${NC}"
        echo "1) Nginx (Recomendado - Melhor performance)"
        echo "2) Apache (Mais módulos e flexibilidade)"
        echo ""
        
        while true; do
            read -p "Digite sua escolha (1 ou 2): " choice
            case $choice in
                1)
                    WEB_SERVER="nginx"
                    break
                    ;;
                2)
                    WEB_SERVER="apache"
                    break
                    ;;
                *)
                    log_warning "Escolha inválida. Digite 1 ou 2."
                    ;;
            esac
        done
    fi
    
    log_info "Servidor web selecionado: $WEB_SERVER"
}

# Criar diretórios necessários
create_directories() {
    log_step "Criando diretórios necessários"
    
    local directories=(
        "$LOG_DIR"
        "$SSL_DIR"
        "/etc/$APP_NAME"
        "/var/backups/$APP_NAME"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        log_success "Diretório criado: $dir"
    done
    
    # Definir permissões
    chown -R www-data:www-data "$LOG_DIR"
    chmod 755 "$LOG_DIR"
    chmod 700 "$SSL_DIR"
}

# Instalar Nginx
install_nginx() {
    log_step "Instalando Nginx"
    
    # Verificar se já está instalado
    if systemctl is-active --quiet nginx && [[ "$FORCE_INSTALL" != true ]]; then
        log_warning "Nginx já está instalado e rodando"
        return
    fi
    
    # Parar Apache se estiver rodando
    if systemctl is-active --quiet apache2; then
        log_info "Parando Apache..."
        systemctl stop apache2
        systemctl disable apache2
    fi
    
    # Instalar Nginx
    apt install -y nginx
    
    # Habilitar e iniciar
    systemctl enable nginx
    systemctl start nginx
    
    log_success "Nginx instalado e iniciado"
}

# Configurar Nginx
configure_nginx() {
    log_step "Configurando Nginx"
    
    # Backup da configuração original
    if [[ -f /etc/nginx/nginx.conf ]]; then
        cp /etc/nginx/nginx.conf "/etc/nginx/nginx.conf.backup-$(date +%Y%m%d-%H%M%S)"
    fi
    
    # Criar configuração principal
    cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # MIME
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" $request_time';
    
    access_log /var/log/just-dance-hub/nginx_access.log main;
    error_log /var/log/just-dance-hub/nginx_error.log;
    
    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;
    
    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Include server configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF
    
    # Remover configuração padrão
    rm -f /etc/nginx/sites-enabled/default
    
    # Criar configuração do site
    create_nginx_site_config
    
    # Testar configuração
    if nginx -t; then
        log_success "Configuração Nginx válida"
        systemctl reload nginx
    else
        log_error "Erro na configuração Nginx"
        exit 1
    fi
}

# Criar configuração do site Nginx
create_nginx_site_config() {
    local config_file="/etc/nginx/sites-available/$APP_NAME"
    
    cat > "$config_file" << EOF
# Just Dance Event Hub - Nginx Configuration

# HTTP Server (Redirect to HTTPS)
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration
    ssl_certificate $SSL_DIR/fullchain.pem;
    ssl_certificate_key $SSL_DIR/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ws: wss:; media-src 'self'; object-src 'none'; frame-ancestors 'none';" always;
    
    # Document root
    root $APP_DIR/frontend/build;
    index index.html;
    
    # API Proxy
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 30s;
        proxy_connect_timeout 10s;
    }
    
    # Auth API (More restrictive)
    location /api/auth/ {
        limit_req zone=auth burst=5 nodelay;
        
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health Check
    location /health {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        access_log off;
    }
    
    # WebSocket
    location /ws {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }
    
    # Static files
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Cache HTML files
        location ~* \.(html|htm)\$ {
            expires 1h;
            add_header Cache-Control "public, max-age=3600";
        }
    }
    
    # Block sensitive files
    location ~ /\.(env|git|svn) {
        deny all;
        return 404;
    }
    
    location ~ \.(sql|bak|backup|old|tmp|temp|config|ini|conf)\$ {
        deny all;
        return 404;
    }
}
EOF
    
    # Habilitar site
    ln -sf "$config_file" "/etc/nginx/sites-enabled/$APP_NAME"
    
    log_success "Configuração do site Nginx criada"
}

# Instalar Apache
install_apache() {
    log_step "Instalando Apache"
    
    # Verificar se já está instalado
    if systemctl is-active --quiet apache2 && [[ "$FORCE_INSTALL" != true ]]; then
        log_warning "Apache já está instalado e rodando"
        return
    fi
    
    # Parar Nginx se estiver rodando
    if systemctl is-active --quiet nginx; then
        log_info "Parando Nginx..."
        systemctl stop nginx
        systemctl disable nginx
    fi
    
    # Instalar Apache e módulos
    apt install -y apache2 apache2-utils
    
    # Habilitar módulos necessários
    a2enmod rewrite
    a2enmod ssl
    a2enmod proxy
    a2enmod proxy_http
    a2enmod proxy_wstunnel
    a2enmod headers
    a2enmod deflate
    a2enmod expires
    
    # Habilitar e iniciar
    systemctl enable apache2
    systemctl start apache2
    
    log_success "Apache instalado e iniciado"
}

# Configurar Apache
configure_apache() {
    log_step "Configurando Apache"
    
    # Backup da configuração original
    if [[ -f /etc/apache2/apache2.conf ]]; then
        cp /etc/apache2/apache2.conf "/etc/apache2/apache2.conf.backup-$(date +%Y%m%d-%H%M%S)"
    fi
    
    # Configurar Apache principal
    cat >> /etc/apache2/apache2.conf << 'EOF'

# Just Dance Hub Security Settings
ServerTokens Prod
ServerSignature Off
Timeout 60

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header unset Server
Header always set Server "WebServer"

# Compression
LoadModule deflate_module modules/mod_deflate.so
<IfModule mod_deflate.c>
    SetOutputFilter DEFLATE
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Block sensitive files
<FilesMatch "\.(env|log|sql|bak|backup|old|tmp|temp|config|ini|conf)$">
    Require all denied
</FilesMatch>

<DirectoryMatch "/\.(git|svn|hg|bzr)">
    Require all denied
</DirectoryMatch>
EOF
    
    # Desabilitar site padrão
    a2dissite 000-default
    
    # Criar configuração do site
    create_apache_site_config
    
    # Testar configuração
    if apache2ctl configtest; then
        log_success "Configuração Apache válida"
        systemctl reload apache2
    else
        log_error "Erro na configuração Apache"
        exit 1
    fi
}

# Criar configuração do site Apache
create_apache_site_config() {
    local config_file="/etc/apache2/sites-available/$APP_NAME.conf"
    
    cat > "$config_file" << EOF
# Just Dance Event Hub - Apache Configuration

# HTTP Virtual Host (Redirect to HTTPS)
<VirtualHost *:80>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    
    DocumentRoot /var/www/html
    
    # Let's Encrypt challenge
    <Location "/.well-known/acme-challenge/">
        Require all granted
    </Location>
    
    # Redirect to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)\$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
    
    # Logs
    CustomLog $LOG_DIR/apache_access.log combined
    ErrorLog $LOG_DIR/apache_error.log
</VirtualHost>

# HTTPS Virtual Host
<VirtualHost *:443>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile $SSL_DIR/fullchain.pem
    SSLCertificateKeyFile $SSL_DIR/privkey.pem
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
    SSLHonorCipherOrder off
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ws: wss:; media-src 'self'; object-src 'none'; frame-ancestors 'none';"
    
    # Document Root
    DocumentRoot $APP_DIR/frontend/build
    
    <Directory "$APP_DIR/frontend/build">
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
        
        # Cache for static files
        <FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$">
            ExpiresActive On
            ExpiresDefault "access plus 1 year"
            Header append Cache-Control "public, immutable"
        </FilesMatch>
        
        # Cache for HTML
        <FilesMatch "\.(html|htm)\$">
            ExpiresActive On
            ExpiresDefault "access plus 1 hour"
            Header set Cache-Control "public, max-age=3600"
        </FilesMatch>
        
        # React Router fallback
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_URI} !^/api/
        RewriteCond %{REQUEST_URI} !^/health
        RewriteCond %{REQUEST_URI} !^/ws
        RewriteRule . /index.html [L]
    </Directory>
    
    # API Proxy
    <Location "/api/">
        ProxyPass "http://127.0.0.1:3001/api/"
        ProxyPassReverse "http://127.0.0.1:3001/api/"
        ProxyTimeout 30
    </Location>
    
    # Health Check
    <Location "/health">
        ProxyPass "http://127.0.0.1:3001/health"
        ProxyPassReverse "http://127.0.0.1:3001/health"
    </Location>
    
    # WebSocket
    <Location "/ws">
        ProxyPass "ws://127.0.0.1:8080/"
        ProxyPassReverse "ws://127.0.0.1:8080/"
        
        RewriteEngine On
        RewriteCond %{HTTP:Upgrade} websocket [NC]
        RewriteCond %{HTTP:Connection} upgrade [NC]
        RewriteRule ^/?(.*) "ws://127.0.0.1:8080/\$1" [P,L]
    </Location>
    
    # Logs
    CustomLog $LOG_DIR/apache_access_ssl.log combined
    ErrorLog $LOG_DIR/apache_error_ssl.log
</VirtualHost>
EOF
    
    # Habilitar site
    a2ensite "$APP_NAME"
    
    log_success "Configuração do site Apache criada"
}

# Configurar SSL com Let's Encrypt
configure_ssl() {
    if [[ "$INSTALL_SSL" != true ]] || [[ "$DOMAIN" == "localhost" ]]; then
        log_info "SSL não configurado (use -s e um domínio real)"
        return
    fi
    
    log_step "Configurando SSL com Let's Encrypt"
    
    # Instalar Certbot
    apt install -y certbot
    
    if [[ "$WEB_SERVER" == "nginx" ]]; then
        apt install -y python3-certbot-nginx
    else
        apt install -y python3-certbot-apache
    fi
    
    # Obter certificado
    if [[ "$WEB_SERVER" == "nginx" ]]; then
        certbot --nginx -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
    else
        certbot --apache -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
    fi
    
    if [[ $? -eq 0 ]]; then
        log_success "Certificado SSL configurado"
        
        # Copiar certificados para nosso diretório
        cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/"
        cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/"
        chown www-data:www-data "$SSL_DIR"/*
        chmod 600 "$SSL_DIR"/*
        
        # Configurar renovação automática
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        log_success "Renovação automática configurada"
    else
        log_error "Falha ao configurar SSL"
    fi
}

# Configurar Firewall
configure_firewall() {
    log_step "Configurando UFW (Firewall)"
    
    # Instalar UFW se não estiver instalado
    apt install -y ufw
    
    # Configurar regras básicas
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Permitir SSH
    ufw allow ssh
    
    # Permitir HTTP e HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Permitir portas da aplicação (apenas localhost)
    ufw allow from 127.0.0.1 to any port 3001
    ufw allow from 127.0.0.1 to any port 8080
    
    # Habilitar firewall
    ufw --force enable
    
    log_success "Firewall configurado"
}

# Configurar logs
configure_logging() {
    log_step "Configurando sistema de logs"
    
    # Configurar logrotate
    cat > "/etc/logrotate.d/$APP_NAME" << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            /usr/sbin/nginx -s reopen
        fi
        if systemctl is-active --quiet apache2; then
            systemctl reload apache2
        fi
    endscript
}
EOF
    
    log_success "Logrotate configurado"
}

# Mostrar status final
show_status() {
    echo ""
    echo -e "${BLUE}=== STATUS DO SERVIDOR WEB ===${NC}"
    echo ""
    
    # Status do serviço
    if [[ "$WEB_SERVER" == "nginx" ]]; then
        local service_status=$(systemctl is-active nginx)
        local service_color=$([[ "$service_status" == "active" ]] && echo "$GREEN" || echo "$RED")
        echo -e "🔧 Nginx: ${service_color}$service_status${NC}"
    else
        local service_status=$(systemctl is-active apache2)
        local service_color=$([[ "$service_status" == "active" ]] && echo "$GREEN" || echo "$RED")
        echo -e "🔧 Apache: ${service_color}$service_status${NC}"
    fi
    
    # Verificar portas
    local ports=(80 443)
    for port in "${ports[@]}"; do
        if ss -tuln | grep -q ":$port "; then
            echo -e "🌐 Porta $port: ${GREEN}Aberta${NC}"
        else
            echo -e "🌐 Porta $port: ${RED}Fechada${NC}"
        fi
    done
    
    # Verificar SSL
    if [[ -f "$SSL_DIR/fullchain.pem" ]]; then
        echo -e "🔒 SSL: ${GREEN}Configurado${NC}"
    else
        echo -e "🔒 SSL: ${YELLOW}Não configurado${NC}"
    fi
    
    echo ""
    echo -e "📋 Logs: $LOG_DIR"
    echo -e "🔑 SSL: $SSL_DIR"
    echo -e "⚙️  Configuração: /etc/$WEB_SERVER/"
    echo ""
}

# Função principal
main() {
    # Parse argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            -w|--webserver)
                WEB_SERVER="$2"
                shift 2
                ;;
            -d|--domain)
                DOMAIN="$2"
                shift 2
                ;;
            -e|--email)
                EMAIL="$2"
                shift 2
                ;;
            -s|--ssl)
                INSTALL_SSL=true
                shift
                ;;
            -f|--force)
                FORCE_INSTALL=true
                shift
                ;;
            -h|--help)
                show_help
                ;;
            *)
                log_error "Opção desconhecida: $1"
                show_help
                ;;
        esac
    done
    
    # Verificações iniciais
    check_root
    check_ubuntu
    
    echo -e "${BLUE}🚀 Ubuntu Web Server Setup - Just Dance Event Hub${NC}"
    echo ""
    echo -e "📅 Data: $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "🌐 Domínio: $DOMAIN"
    echo -e "📧 Email: $EMAIL"
    echo ""
    
    # Atualizar sistema
    update_system
    
    # Escolher servidor web
    choose_webserver
    
    # Validar escolha
    if [[ "$WEB_SERVER" != "nginx" && "$WEB_SERVER" != "apache" ]]; then
        log_error "Servidor web inválido: $WEB_SERVER (use nginx ou apache)"
        exit 1
    fi
    
    # Criar diretórios
    create_directories
    
    # Instalar e configurar servidor web
    if [[ "$WEB_SERVER" == "nginx" ]]; then
        install_nginx
        configure_nginx
    else
        install_apache
        configure_apache
    fi
    
    # Configurar SSL
    configure_ssl
    
    # Configurar firewall
    configure_firewall
    
    # Configurar logs
    configure_logging
    
    # Mostrar status
    show_status
    
    echo ""
    echo -e "${GREEN}🎉 Configuração do $WEB_SERVER concluída!${NC}"
    echo ""
    echo -e "${YELLOW}📖 Próximos passos:${NC}"
    echo "   1. Configure DNS para apontar $DOMAIN para este servidor"
    echo "   2. Inicie a aplicação Just Dance Hub"
    if [[ "$INSTALL_SSL" == true ]]; then
        echo "   3. Acesse https://$DOMAIN"
    else
        echo "   3. Execute novamente com -s para configurar SSL"
    fi
    echo "   4. Monitore logs em $LOG_DIR"
    echo ""
}

# Executar função principal
main "$@"