#!/bin/bash
# Configuração específica do Apache para Ubuntu - Just Dance Event Hub

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

# Instalar módulos de segurança do Apache
install_security_modules() {
    if [[ "$INSTALL_SECURITY_MODULES" != true ]]; then
        return
    fi
    
    log_step "Instalando módulos de segurança do Apache"
    
    # ModSecurity
    apt install -y libapache2-mod-security2
    a2enmod security2
    
    # Configurar ModSecurity
    cp /etc/modsecurity/modsecurity.conf-recommended /etc/modsecurity/modsecurity.conf
    
    # Ativar ModSecurity
    sed -i 's/SecRuleEngine DetectionOnly/SecRuleEngine On/' /etc/modsecurity/modsecurity.conf
    
    # Configurar regras básicas
    cat > /etc/modsecurity/custom-rules.conf << 'EOF'
# Custom ModSecurity Rules for Just Dance Hub

# Block common attacks
SecRule ARGS "@detectSQLi" \
    "id:1001,phase:2,block,msg:'SQL Injection Attack Detected',logdata:'Matched Data: %{MATCHED_VAR} found within %{MATCHED_VAR_NAME}',severity:2"

SecRule ARGS "@detectXSS" \
    "id:1002,phase:2,block,msg:'XSS Attack Detected',logdata:'Matched Data: %{MATCHED_VAR} found within %{MATCHED_VAR_NAME}',severity:2"

# Rate limiting
SecAction "id:1003,phase:1,nolog,pass,initcol:ip=%{REMOTE_ADDR},initcol:user=%{REMOTE_ADDR},setvar:ip.requests_per_minute=+1,expirevar:ip.requests_per_minute=60"

SecRule IP:REQUESTS_PER_MINUTE "@gt 60" \
    "id:1004,phase:1,deny,status:429,msg:'Rate limit exceeded',setvar:ip.rate_limited=1"

# Block file upload attacks
SecRule FILES_TMPNAMES "@inspectFile /etc/modsecurity/file-inspect.lua" \
    "id:1005,phase:2,block,msg:'Malicious file upload detected'"
EOF
    
    # mod_evasive para proteção DDoS
    apt install -y libapache2-mod-evasive
    a2enmod evasive
    
    # Configurar mod_evasive
    cat > /etc/apache2/mods-available/evasive.conf << 'EOF'
<IfModule mod_evasive24.c>
    DOSHashTableSize    2048
    DOSPageCount        5
    DOSSiteCount        100
    DOSPageInterval     1
    DOSSiteInterval     1
    DOSBlockingPeriod   600
    DOSLogDir           /var/log/just-dance-hub
    DOSEmailNotify      admin@example.com
    DOSWhitelist        127.0.0.1
    DOSWhitelist        ::1
</IfModule>
EOF
    
    log_success "Módulos de segurança instalados"
}

# Instalar módulos de performance
install_performance_modules() {
    if [[ "$INSTALL_PERFORMANCE_MODULES" != true ]]; then
        return
    fi
    
    log_step "Instalando módulos de performance do Apache"
    
    # Módulos de cache
    a2enmod cache
    a2enmod cache_disk
    a2enmod expires
    a2enmod headers
    
    # Configurar cache
    cat > /etc/apache2/mods-available/cache_disk.conf << 'EOF'
<IfModule mod_cache_disk.c>
    CacheRoot /var/cache/apache2/mod_cache_disk
    CacheEnable disk /
    CacheDirLevels 2
    CacheDirLength 1
    CacheMaxFileSize 1000000
    CacheMinFileSize 1
    CacheDefaultExpire 3600
    CacheMaxExpire 86400
    CacheIgnoreHeaders Set-Cookie
    
    # Cache static files longer
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header append Cache-Control "public, immutable"
    </LocationMatch>
    
    # Cache API responses briefly
    <LocationMatch "/api/">
        ExpiresActive On
        ExpiresDefault "access plus 5 minutes"
        Header append Cache-Control "public, max-age=300"
    </LocationMatch>
</IfModule>
EOF
    
    # Criar diretório de cache
    mkdir -p /var/cache/apache2/mod_cache_disk
    chown www-data:www-data /var/cache/apache2/mod_cache_disk
    
    # HTTP/2
    a2enmod http2
    
    # Configurar HTTP/2
    echo "Protocols h2 http/1.1" >> /etc/apache2/apache2.conf
    
    log_success "Módulos de performance instalados"
}

# Configurar Virtual Hosts otimizados
configure_optimized_vhosts() {
    log_step "Configurando Virtual Hosts otimizados"
    
    # Backup da configuração existente
    if [[ -f "/etc/apache2/sites-available/$APP_NAME.conf" ]]; then
        cp "/etc/apache2/sites-available/$APP_NAME.conf" "/etc/apache2/sites-available/$APP_NAME.conf.backup-$(date +%Y%m%d-%H%M%S)"
    fi
    
    # Criar configuração otimizada
    cat > "/etc/apache2/sites-available/$APP_NAME.conf" << EOF
# Just Dance Event Hub - Apache Optimized Configuration

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
    
    # HTTP/2 Protocol
    Protocols h2 http/1.1
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile $SSL_DIR/fullchain.pem
    SSLCertificateKeyFile $SSL_DIR/privkey.pem
    
    # Modern SSL Configuration
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
    SSLHonorCipherOrder off
    SSLSessionTickets off
    
    # OCSP Stapling
    SSLUseStapling on
    SSLStaplingResponderTimeout 5
    SSLStaplingReturnResponderErrors off
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ws: wss:; media-src 'self'; object-src 'none'; frame-ancestors 'none';"
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    
    # Document Root
    DocumentRoot $APP_DIR/frontend/build
    
    <Directory "$APP_DIR/frontend/build">
        Options -Indexes +FollowSymLinks -MultiViews
        AllowOverride None
        Require all granted
        
        # Enable compression
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \\
            \\.(?:gif|jpe?g|png|ico|svg|woff|woff2|ttf|eot)\$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \\
            \\.(?:exe|t?gz|zip|bz2|sit|rar)\$ no-gzip dont-vary
        
        # Cache for static files
        <FilesMatch "\\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$">
            ExpiresActive On
            ExpiresDefault "access plus 1 year"
            Header append Cache-Control "public, immutable"
            Header unset ETag
            FileETag None
        </FilesMatch>
        
        # Cache for HTML
        <FilesMatch "\\.(html|htm)\$">
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
    
    # API Proxy with load balancing
    <Proxy balancer://api-cluster>
        BalancerMember http://127.0.0.1:3001
        # Add more backend servers here if needed
        # BalancerMember http://127.0.0.1:3002
        ProxySet connectiontimeout=5
        ProxySet retry=300
    </Proxy>
    
    <Location "/api/">
        ProxyPass "balancer://api-cluster/api/"
        ProxyPassReverse "balancer://api-cluster/api/"
        ProxyTimeout 30
        ProxyPreserveHost On
        
        # Rate limiting via mod_evasive
        # Additional rate limiting can be configured here
    </Location>
    
    # Health Check
    <Location "/health">
        ProxyPass "http://127.0.0.1:3001/health"
        ProxyPassReverse "http://127.0.0.1:3001/health"
        ProxyTimeout 5
    </Location>
    
    # WebSocket with fallback
    <Location "/ws">
        ProxyPass "ws://127.0.0.1:8080/"
        ProxyPassReverse "ws://127.0.0.1:8080/"
        
        RewriteEngine On
        RewriteCond %{HTTP:Upgrade} websocket [NC]
        RewriteCond %{HTTP:Connection} upgrade [NC]
        RewriteRule ^/?(.*) "ws://127.0.0.1:8080/\$1" [P,L]
        
        # WebSocket timeout
        ProxyTimeout 86400
    </Location>
    
    # Balancer manager (only for localhost)
    <Location "/balancer-manager">
        SetHandler balancer-manager
        Require ip 127.0.0.1
        Require ip ::1
    </Location>
    
    # Server status (only for localhost)
    <Location "/server-status">
        SetHandler server-status
        Require ip 127.0.0.1
        Require ip ::1
    </Location>
    
    # Server info (only for localhost)
    <Location "/server-info">
        SetHandler server-info
        Require ip 127.0.0.1
        Require ip ::1
    </Location>
    
    # Block sensitive files and directories
    <LocationMatch "/(\\.|.*\\.(env|log|sql|bak|backup|old|tmp|temp|config|ini|conf))\$">
        Require all denied
    </LocationMatch>
    
    <DirectoryMatch "/\\.(git|svn|hg|bzr)">
        Require all denied
    </DirectoryMatch>
    
    # Logs with detailed format
    LogFormat "%h %l %u %t \\"%r\\" %>s %O \\"%{Referer}i\\" \\"%{User-Agent}i\\" %D %{SSL_PROTOCOL}x %{SSL_CIPHER}x" combined_ssl
    CustomLog $LOG_DIR/apache_access_ssl.log combined_ssl
    ErrorLog $LOG_DIR/apache_error_ssl.log
    
    # Log level for debugging (change to warn in production)
    LogLevel info ssl:warn
</VirtualHost>

# Global SSL Configuration
SSLStaplingCache shmcb:/var/run/ocsp(128000)
SSLSessionCache shmcb:/var/run/ssl_scache(512000)
SSLSessionCacheTimeout 300
EOF
    
    # Habilitar site
    a2ensite "$APP_NAME"
    
    log_success "Virtual Hosts otimizados configurados"
}

# Configurar monitoramento
configure_monitoring() {
    log_step "Configurando monitoramento do Apache"
    
    # Habilitar módulos de status
    a2enmod status
    a2enmod info
    
    # Script de monitoramento
    cat > /usr/local/bin/apache-monitor.sh << 'EOF'
#!/bin/bash
# Apache Monitoring Script for Just Dance Hub

LOG_FILE="/var/log/just-dance-hub/apache-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log with timestamp
log_message() {
    echo "[$DATE] $1" >> "$LOG_FILE"
}

# Check Apache status
if ! systemctl is-active --quiet apache2; then
    log_message "ERROR: Apache is not running"
    systemctl start apache2
    log_message "INFO: Attempted to restart Apache"
else
    log_message "INFO: Apache is running normally"
fi

# Check memory usage
MEM_USAGE=$(ps aux | grep apache2 | grep -v grep | awk '{sum+=$6} END {print sum/1024}')
if (( $(echo "$MEM_USAGE > 1000" | bc -l) )); then
    log_message "WARNING: High memory usage: ${MEM_USAGE}MB"
fi

# Check error log for recent errors
ERROR_COUNT=$(tail -n 100 /var/log/just-dance-hub/apache_error.log 2>/dev/null | grep "$(date '+%Y-%m-%d')" | wc -l)
if [[ $ERROR_COUNT -gt 10 ]]; then
    log_message "WARNING: High error count in last 100 lines: $ERROR_COUNT"
fi

# Check disk space
DISK_USAGE=$(df /var/log | tail -1 | awk '{print $5}' | sed 's/%//')
if [[ $DISK_USAGE -gt 80 ]]; then
    log_message "WARNING: High disk usage: ${DISK_USAGE}%"
fi

log_message "INFO: Monitoring check completed"
EOF
    
    chmod +x /usr/local/bin/apache-monitor.sh
    
    # Adicionar ao crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/apache-monitor.sh") | crontab -
    
    log_success "Monitoramento configurado"
}

# Otimizar configuração do Apache
optimize_apache_config() {
    log_step "Otimizando configuração do Apache"
    
    # Backup da configuração principal
    cp /etc/apache2/apache2.conf "/etc/apache2/apache2.conf.backup-$(date +%Y%m%d-%H%M%S)"
    
    # Adicionar configurações de performance
    cat >> /etc/apache2/apache2.conf << 'EOF'

# Just Dance Hub Performance Optimizations

# MPM Prefork Configuration (adjust based on server resources)
<IfModule mpm_prefork_module>
    StartServers             8
    MinSpareServers          5
    MaxSpareServers         20
    ServerLimit            256
    MaxRequestWorkers      256
    MaxConnectionsPerChild 10000
</IfModule>

# MPM Worker Configuration (alternative to prefork)
<IfModule mpm_worker_module>
    StartServers             4
    MinSpareThreads         25
    MaxSpareThreads         75
    ThreadLimit             64
    ThreadsPerChild         25
    MaxRequestWorkers      400
    MaxConnectionsPerChild 10000
</IfModule>

# MPM Event Configuration (recommended for high traffic)
<IfModule mpm_event_module>
    StartServers             4
    MinSpareThreads         25
    MaxSpareThreads         75
    ThreadLimit             64
    ThreadsPerChild         25
    MaxRequestWorkers      400
    MaxConnectionsPerChild 10000
    AsyncRequestWorkerFactor 2
</IfModule>

# Timeout settings
Timeout 60
KeepAlive On
MaxKeepAliveRequests 100
KeepAliveTimeout 5

# Security settings
ServerTokens Prod
ServerSignature Off
TraceEnable Off

# Hide server information
Header unset Server
Header always set Server "WebServer"

# Prevent access to .htaccess files
<FilesMatch "^\\.ht">
    Require all denied
</FilesMatch>

# Prevent access to version control directories
<DirectoryMatch "/\\.(git|svn|hg|bzr)">
    Require all denied
</DirectoryMatch>

# Limit request size (adjust as needed)
LimitRequestBody 10485760

# Enable compression for better performance
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
    
    # Don't compress images and other binary files
    SetEnvIfNoCase Request_URI \\
        \\.(?:gif|jpe?g|png|ico|svg|woff|woff2|ttf|eot)\$ no-gzip dont-vary
    SetEnvIfNoCase Request_URI \\
        \\.(?:exe|t?gz|zip|bz2|sit|rar)\$ no-gzip dont-vary
EOF
    
    log_success "Configuração do Apache otimizada"
}

# Configurar SSL otimizado
configure_ssl_optimization() {
    log_step "Configurando SSL otimizado"
    
    # Criar configuração SSL otimizada
    cat > /etc/apache2/conf-available/ssl-optimization.conf << 'EOF'
# SSL Optimization Configuration

<IfModule mod_ssl.c>
    # Modern SSL configuration
    SSLEngine on
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
    SSLHonorCipherOrder off
    SSLSessionTickets off
    
    # OCSP Stapling
    SSLUseStapling on
    SSLStaplingResponderTimeout 5
    SSLStaplingReturnResponderErrors off
    SSLStaplingCache shmcb:/var/run/ocsp(128000)
    
    # Session cache
    SSLSessionCache shmcb:/var/run/ssl_scache(512000)
    SSLSessionCacheTimeout 300
    
    # Compression (disabled for security)
    SSLCompression off
    
    # HSTS header
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
EOF
    
    # Habilitar configuração SSL
    a2enconf ssl-optimization
    
    log_success "SSL otimizado configurado"
}

# Função principal
main() {
    echo -e "${BLUE}🔧 Configuração Avançada do Apache - Just Dance Event Hub${NC}"
    echo ""
    
    # Verificar root
    check_root
    
    # Verificar se Apache está instalado
    if ! command -v apache2 &> /dev/null; then
        log_error "Apache não está instalado. Execute ubuntu-webserver-setup.sh primeiro."
        exit 1
    fi
    
    # Instalar módulos de segurança
    install_security_modules
    
    # Instalar módulos de performance
    install_performance_modules
    
    # Configurar Virtual Hosts otimizados
    configure_optimized_vhosts
    
    # Otimizar configuração
    optimize_apache_config
    
    # Configurar SSL otimizado
    configure_ssl_optimization
    
    # Configurar monitoramento
    configure_monitoring
    
    # Testar configuração
    if apache2ctl configtest; then
        log_success "Configuração Apache válida"
        systemctl reload apache2
        log_success "Apache recarregado"
    else
        log_error "Erro na configuração Apache"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Configuração avançada do Apache concluída!${NC}"
    echo ""
    echo -e "${YELLOW}📊 Recursos configurados:${NC}"
    echo "   ✅ ModSecurity (WAF)"
    echo "   ✅ mod_evasive (Anti-DDoS)"
    echo "   ✅ HTTP/2"
    echo "   ✅ Cache otimizado"
    echo "   ✅ Compressão GZIP"
    echo "   ✅ SSL moderno"
    echo "   ✅ Monitoramento automático"
    echo "   ✅ Load balancing"
    echo ""
    echo -e "${YELLOW}🔗 URLs de monitoramento:${NC}"
    echo "   📊 Status: https://$DOMAIN/server-status"
    echo "   ⚖️  Balancer: https://$DOMAIN/balancer-manager"
    echo "   ℹ️  Info: https://$DOMAIN/server-info"
    echo ""
}

# Executar função principal
main "$@"