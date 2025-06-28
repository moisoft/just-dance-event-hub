#!/bin/bash

# 🗑️ Just Dance Event Hub - Script de Desinstalação para Ubuntu
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

# Banner
echo -e "${RED}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                    Just Dance Event Hub                      ║
║                   Uninstaller Ubuntu v1.0.0                  ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root. Use um usuário com sudo."
fi

# Variáveis de configuração
APP_NAME="just-dance-hub"
APP_DIR="/opt/$APP_NAME"
SERVICE_USER="$APP_NAME"
DB_NAME="just_dance_hub"

# Função para confirmar desinstalação
confirm_uninstall() {
    echo -e "${RED}⚠️  ATENÇÃO: Esta ação irá remover completamente o Just Dance Event Hub!${NC}"
    echo ""
    echo "Serão removidos:"
    echo "  • Aplicação: $APP_DIR"
    echo "  • Usuário do sistema: $SERVICE_USER"
    echo "  • Banco de dados: $DB_NAME"
    echo "  • Configurações do PM2"
    echo "  • Configurações do Nginx (se instalado)"
    echo "  • Logs da aplicação"
    echo ""
    
    read -p "Tem certeza que deseja continuar? (digite 'SIM' para confirmar): " -r
    if [[ ! $REPLY =~ ^SIM$ ]]; then
        log "Desinstalação cancelada pelo usuário."
        exit 0
    fi
    
    echo ""
    read -p "Deseja fazer backup do banco de dados antes de remover? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        BACKUP_DB=true
    fi
}

# Função para fazer backup do banco
backup_database() {
    if [ "$BACKUP_DB" = true ]; then
        log "Fazendo backup do banco de dados..."
        
        BACKUP_FILE="just-dance-hub-backup-$(date +%Y%m%d-%H%M%S).sql"
        
        if sudo -u postgres pg_dump $DB_NAME > $BACKUP_FILE; then
            log "Backup criado: $BACKUP_FILE"
        else
            warn "Falha ao criar backup do banco de dados."
        fi
    fi
}

# Função para parar e remover PM2
remove_pm2() {
    log "Removendo configurações do PM2..."
    
    if command -v pm2 &> /dev/null; then
        # Parar aplicação
        sudo -u $SERVICE_USER pm2 stop $APP_NAME 2>/dev/null || true
        sudo -u $SERVICE_USER pm2 delete $APP_NAME 2>/dev/null || true
        
        # Remover da lista de inicialização
        sudo -u $SERVICE_USER pm2 unstartup 2>/dev/null || true
        
        log "PM2 removido com sucesso!"
    else
        warn "PM2 não encontrado."
    fi
}

# Função para remover Nginx
remove_nginx() {
    log "Removendo configurações do Nginx..."
    
    if [ -f "/etc/nginx/sites-enabled/$APP_NAME" ]; then
        sudo rm -f /etc/nginx/sites-enabled/$APP_NAME
        sudo rm -f /etc/nginx/sites-available/$APP_NAME
        sudo systemctl reload nginx
        log "Configurações do Nginx removidas!"
    else
        log "Configurações do Nginx não encontradas."
    fi
}

# Função para remover aplicação
remove_application() {
    log "Removendo aplicação..."
    
    if [ -d "$APP_DIR" ]; then
        sudo rm -rf $APP_DIR
        log "Aplicação removida: $APP_DIR"
    else
        log "Diretório da aplicação não encontrado: $APP_DIR"
    fi
}

# Função para remover usuário do sistema
remove_system_user() {
    log "Removendo usuário do sistema..."
    
    if id "$SERVICE_USER" &>/dev/null; then
        sudo userdel -r $SERVICE_USER 2>/dev/null || sudo userdel $SERVICE_USER
        log "Usuário $SERVICE_USER removido."
    else
        log "Usuário $SERVICE_USER não encontrado."
    fi
}

# Função para remover banco de dados
remove_database() {
    log "Removendo banco de dados..."
    
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        sudo -u postgres dropdb $DB_NAME
        log "Banco de dados $DB_NAME removido."
    else
        log "Banco de dados $DB_NAME não encontrado."
    fi
}

# Função para remover logs
remove_logs() {
    log "Removendo logs..."
    
    if [ -d "/var/log/$APP_NAME" ]; then
        sudo rm -rf /var/log/$APP_NAME
        log "Logs removidos: /var/log/$APP_NAME"
    else
        log "Diretório de logs não encontrado."
    fi
}

# Função para remover script de gerenciamento
remove_management_script() {
    log "Removendo script de gerenciamento..."
    
    if [ -f "/usr/local/bin/$APP_NAME" ]; then
        sudo rm -f /usr/local/bin/$APP_NAME
        log "Script de gerenciamento removido: /usr/local/bin/$APP_NAME"
    else
        log "Script de gerenciamento não encontrado."
    fi
}

# Função para limpar dependências (opcional)
cleanup_dependencies() {
    echo ""
    read -p "Deseja remover também as dependências do sistema (Node.js, PostgreSQL, PM2, Nginx)? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Removendo dependências do sistema..."
        
        # Remover PM2
        if command -v pm2 &> /dev/null; then
            sudo npm uninstall -g pm2
            log "PM2 removido."
        fi
        
        # Remover Node.js
        if command -v node &> /dev/null; then
            sudo apt remove -y nodejs
            sudo apt autoremove -y
            log "Node.js removido."
        fi
        
        # Remover PostgreSQL
        if command -v psql &> /dev/null; then
            sudo apt remove -y postgresql postgresql-contrib
            sudo apt autoremove -y
            log "PostgreSQL removido."
        fi
        
        # Remover Nginx
        if command -v nginx &> /dev/null; then
            sudo apt remove -y nginx
            sudo apt autoremove -y
            log "Nginx removido."
        fi
        
        log "Dependências do sistema removidas!"
    else
        log "Dependências do sistema mantidas."
    fi
}

# Função para mostrar informações finais
show_final_info() {
    echo -e "${GREEN}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                   DESINSTALAÇÃO CONCLUÍDA!                   ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    log "Just Dance Event Hub foi removido com sucesso!"
    
    if [ "$BACKUP_DB" = true ] && [ -f "$BACKUP_FILE" ]; then
        echo ""
        echo -e "${BLUE}📦 Backup criado:${NC}"
        echo "  • Arquivo: $BACKUP_FILE"
        echo "  • Para restaurar: sudo -u postgres createdb $DB_NAME && sudo -u postgres psql $DB_NAME < $BACKUP_FILE"
    fi
    
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
    echo "  • Verifique se não há outros serviços dependentes"
    echo "  • Monitore o sistema por alguns dias"
    echo "  • Se necessário, reinicie o servidor"
    
    echo ""
    log "Desinstalação concluída!"
}

# Função principal
main() {
    log "Iniciando desinstalação do Just Dance Event Hub..."
    
    confirm_uninstall
    backup_database
    remove_pm2
    remove_nginx
    remove_application
    remove_system_user
    remove_database
    remove_logs
    remove_management_script
    cleanup_dependencies
    show_final_info
}

# Executar função principal
main "$@" 