#!/bin/bash

# 🚀 Just Dance Event Hub - Script de Instalação Automática para Ubuntu
# Versão: 1.0.0
# Autor: Just Dance Event Hub Team

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                    Just Dance Event Hub                      ║
║                     Backend Installer                        ║
║                        Ubuntu v1.0.0                         ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar se é Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    warn "Este script foi testado no Ubuntu. Outras distribuições podem não funcionar corretamente."
fi

# Variáveis de configuração
APP_NAME="just-dance-hub"
APP_DIR="/opt/$APP_NAME"
SERVICE_USER="$APP_NAME"
DB_NAME="just_dance_hub"
DB_USER="postgres"
NODE_VERSION="18"

# Função para instalar dependências do sistema
install_system_dependencies() {
    log "Instalando dependências do sistema..."
    
    sudo apt update
    
    # Instalar dependências essenciais
    sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    # Instalar Node.js 18.x
    log "Instalando Node.js $NODE_VERSION.x..."
    curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash -
    sudo apt install -y nodejs
    
    # Instalar PostgreSQL
    log "Instalando PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    
    # Instalar PM2 globalmente
    log "Instalando PM2..."
    sudo npm install -g pm2
    
    # Instalar Nginx (opcional)
    read -p "Deseja instalar o Nginx como proxy reverso? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Instalando Nginx..."
        sudo apt install -y nginx
        NGINX_INSTALLED=true
    fi
    
    log "Dependências do sistema instaladas com sucesso!"
}

# Função para configurar PostgreSQL
setup_postgresql() {
    log "Configurando PostgreSQL..."
    
    # Iniciar e habilitar PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Gerar senha aleatória para o usuário postgres
    POSTGRES_PASSWORD=$(openssl rand -base64 16)
    log "Senha aleatória gerada para o usuário postgres."
    
    # Alterar senha do postgres
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$POSTGRES_PASSWORD';"
    
    # Criar banco de dados
    sudo -u postgres createdb $DB_NAME
    
    log "PostgreSQL configurado com sucesso!"
}

# Função para criar usuário do sistema
create_system_user() {
    log "Criando usuário do sistema..."
    
    if ! id "$SERVICE_USER" &>/dev/null; then
        sudo useradd -r -s /bin/false -d $APP_DIR $SERVICE_USER
        log "Usuário $SERVICE_USER criado."
    else
        log "Usuário $SERVICE_USER já existe."
    fi
}

# Função para extrair e configurar a aplicação
setup_application() {
    log "Configurando aplicação..."
    
    # Criar diretório da aplicação
    sudo mkdir -p $APP_DIR
    sudo chown $SERVICE_USER:$SERVICE_USER $APP_DIR
    
    # Verificar se o ZIP existe no diretório atual
    if [ -f "just-dance-hub-backend-production.zip" ]; then
        log "Extraindo aplicação do ZIP..."
        sudo unzip -o just-dance-hub-backend-production.zip -d /tmp/
        sudo cp -r /tmp/backend/* $APP_DIR/
        sudo rm -rf /tmp/backend
    else
        error "Arquivo just-dance-hub-backend-production.zip não encontrado no diretório atual!"
    fi
    
    # Configurar permissões
    sudo chown -R $SERVICE_USER:$SERVICE_USER $APP_DIR
    sudo chmod -R 755 $APP_DIR
    
    log "Aplicação extraída e configurada!"
}

# Função para configurar variáveis de ambiente
setup_environment() {
    log "Configurando variáveis de ambiente..."
    
    # Gerar JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Criar arquivo .env
    cat > $APP_DIR/.env << EOF
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=$POSTGRES_PASSWORD
DB_NAME=$DB_NAME
JWT_SECRET=$JWT_SECRET
PORT=3000
EOF
    
    sudo chown $SERVICE_USER:$SERVICE_USER $APP_DIR/.env
    sudo chmod 600 $APP_DIR/.env
    
    log "Variáveis de ambiente configuradas!"
}

# Função para instalar dependências da aplicação
install_app_dependencies() {
    log "Instalando dependências da aplicação..."
    
    cd $APP_DIR
    
    # Instalar dependências
    sudo -u $SERVICE_USER npm install --production
    
    # Configurar banco de dados
    log "Configurando banco de dados..."
    sudo -u $SERVICE_USER ADMIN_EMAIL="$ADMIN_EMAIL" ADMIN_PASSWORD="$ADMIN_PASSWORD" node scripts/setup-prod-db.js
    
    # Compilar TypeScript
    log "Compilando TypeScript..."
    sudo -u $SERVICE_USER npm run build
    
    log "Dependências da aplicação instaladas!"
}

# Função para configurar PM2
setup_pm2() {
    log "Configurando PM2..."
    
    cd $APP_DIR
    
    # Criar arquivo de configuração do PM2
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'dist/app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/$APP_NAME/error.log',
    out_file: '/var/log/$APP_NAME/out.log',
    log_file: '/var/log/$APP_NAME/combined.log',
    time: true
  }]
};
EOF
    
    # Criar diretório de logs
    sudo mkdir -p /var/log/$APP_NAME
    sudo chown $SERVICE_USER:$SERVICE_USER /var/log/$APP_NAME
    
    # Iniciar aplicação com PM2
    sudo -u $SERVICE_USER pm2 start ecosystem.config.js
    sudo -u $SERVICE_USER pm2 save
    sudo -u $SERVICE_USER pm2 startup
    
    # Configurar PM2 para iniciar com o sistema
    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $SERVICE_USER --hp $APP_DIR
    
    log "PM2 configurado e aplicação iniciada!"
}

# Função para configurar Nginx
setup_nginx() {
    if [ "$NGINX_INSTALLED" = true ]; then
        log "Configurando Nginx..."
        
        # Obter domínio/IP
        read -p "Digite o domínio ou IP do servidor: " DOMAIN
        
        # Criar configuração do Nginx
        sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF
        
        # Habilitar site
        sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        
        # Testar configuração
        sudo nginx -t
        
        # Reiniciar Nginx
        sudo systemctl restart nginx
        sudo systemctl enable nginx
        
        log "Nginx configurado com sucesso!"
    fi
}

# Função para configurar firewall
setup_firewall() {
    log "Configurando firewall..."
    
    # Verificar se ufw está ativo
    if sudo ufw status | grep -q "Status: active"; then
        sudo ufw allow 22/tcp    # SSH
        sudo ufw allow 80/tcp    # HTTP
        sudo ufw allow 443/tcp   # HTTPS
        log "Firewall configurado!"
    else
        warn "UFW não está ativo. Configure o firewall manualmente se necessário."
    fi
}

# Função para criar script de gerenciamento
create_management_script() {
    log "Criando script de gerenciamento..."
    
    cat > /usr/local/bin/$APP_NAME << EOF
#!/bin/bash

APP_NAME="$APP_NAME"
APP_DIR="$APP_DIR"

case "\$1" in
    start)
        cd \$APP_DIR
        sudo -u $SERVICE_USER pm2 start ecosystem.config.js
        echo "Aplicação iniciada!"
        ;;
    stop)
        cd \$APP_DIR
        sudo -u $SERVICE_USER pm2 stop \$APP_NAME
        echo "Aplicação parada!"
        ;;
    restart)
        cd \$APP_DIR
        sudo -u $SERVICE_USER pm2 restart \$APP_NAME
        echo "Aplicação reiniciada!"
        ;;
    status)
        sudo -u $SERVICE_USER pm2 status
        ;;
    logs)
        sudo -u $SERVICE_USER pm2 logs \$APP_NAME
        ;;
    monit)
        sudo -u $SERVICE_USER pm2 monit
        ;;
    update)
        echo "Fazendo backup..."
        sudo cp -r \$APP_DIR \$APP_DIR-backup-\$(date +%Y%m%d-%H%M%S)
        echo "Backup criado. Agora faça o upload da nova versão e execute:"
        echo "sudo $APP_NAME restart"
        ;;
    *)
        echo "Uso: \$0 {start|stop|restart|status|logs|monit|update}"
        echo ""
        echo "Comandos disponíveis:"
        echo "  start   - Iniciar aplicação"
        echo "  stop    - Parar aplicação"
        echo "  restart - Reiniciar aplicação"
        echo "  status  - Ver status"
        echo "  logs    - Ver logs"
        echo "  monit   - Monitorar recursos"
        echo "  update  - Preparar para atualização"
        exit 1
        ;;
esac
EOF
    
    sudo chmod +x /usr/local/bin/$APP_NAME
    log "Script de gerenciamento criado: /usr/local/bin/$APP_NAME"
}

# Função para mostrar informações finais
show_final_info() {
    echo -e "${GREEN}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                    INSTALAÇÃO CONCLUÍDA!                     ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    log "Just Dance Event Hub foi instalado com sucesso!"
    echo ""
    echo -e "${BLUE}📋 Informações da Instalação:${NC}"
    echo "  • Diretório da aplicação: $APP_DIR"
    echo "  • Usuário do sistema: $SERVICE_USER"
    echo "  • Banco de dados: $DB_NAME"
    echo "  • Porta da API: 3000"
    
    if [ "$NGINX_INSTALLED" = true ]; then
        echo "  • Nginx: Configurado e ativo"
    fi
    
    echo ""
    echo -e "${BLUE}🔧 Comandos de Gerenciamento:${NC}"
    echo "  • Status: sudo $APP_NAME status"
    echo "  • Logs: sudo $APP_NAME logs"
    echo "  • Reiniciar: sudo $APP_NAME restart"
    echo "  • Monitorar: sudo $APP_NAME monit"
    
    echo ""
    echo -e "${BLUE}🌐 Acesso à API:${NC}"
    if [ "$NGINX_INSTALLED" = true ]; then
        echo "  • HTTP: http://$DOMAIN"
    else
        echo "  • Local: http://localhost:3000"
        echo "  • Rede: http://$(hostname -I | awk '{print $1}'):3000"
    fi
    
    echo ""
    echo -e "${BLUE}📊 Endpoints Principais:${NC}"
    echo "  • GET /api/health - Status da API"
    echo "  • POST /api/auth/register - Registro"
    echo "  • POST /api/auth/login - Login"
    echo "  • GET /api/events - Listar eventos"
    
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
    echo "  • Configure o SSL/HTTPS para produção"
    echo "  • Monitore os logs regularmente"
    echo "  • Faça backups do banco de dados"
    echo "  • Mantenha o sistema atualizado"
    
    echo ""
    log "Instalação concluída! A API está pronta para uso."
}

# Função principal
main() {
    log "Iniciando instalação do Just Dance Event Hub..."
    
    # Gerar ZIP de produção se não existir
    if [ ! -f "just-dance-hub-backend-production.zip" ]; then
        log "Arquivo just-dance-hub-backend-production.zip não encontrado. Gerando automaticamente..."
        if [ ! -d "just-dance-event-hub" ]; then
            git clone https://github.com/moisoft/just-dance-event-hub.git
        fi
        cd just-dance-event-hub/backend
        npm install
        npm run build
        cd ..
        zip -r ../just-dance-hub-backend-production.zip backend
        cd ..
        log "Arquivo just-dance-hub-backend-production.zip gerado com sucesso!"
    fi
    
    # Perguntar email e senha do admin
    read -p "Digite o email do usuário admin: " ADMIN_EMAIL
    read -s -p "Digite a senha do usuário admin: " ADMIN_PASSWORD
    export ADMIN_EMAIL
    export ADMIN_PASSWORD
    
    # Executar etapas de instalação
    install_system_dependencies
    setup_postgresql
    create_system_user
    setup_application
    setup_environment
    install_app_dependencies
    setup_pm2
    setup_nginx
    setup_firewall
    create_management_script
    show_final_info
}

# Executar função principal
main "$@" 