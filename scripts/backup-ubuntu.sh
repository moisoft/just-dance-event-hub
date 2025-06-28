#!/bin/bash

# 💾 Just Dance Event Hub - Script de Backup Automático para Ubuntu
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
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                    Just Dance Event Hub                      ║
║                    Backup Script Ubuntu v1.0.0               ║
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
DB_NAME="just_dance_hub"
BACKUP_DIR="/var/backups/$APP_NAME"
MAX_BACKUPS=10  # Manter apenas os últimos 10 backups

# Função para criar diretório de backup
create_backup_dir() {
    log "Criando diretório de backup..."
    
    sudo mkdir -p $BACKUP_DIR
    sudo chown $USER:$USER $BACKUP_DIR
    sudo chmod 755 $BACKUP_DIR
    
    log "Diretório de backup criado: $BACKUP_DIR"
}

# Função para fazer backup do banco de dados
backup_database() {
    log "Fazendo backup do banco de dados..."
    
    DB_BACKUP_FILE="$BACKUP_DIR/database-$(date +%Y%m%d-%H%M%S).sql"
    
    if sudo -u postgres pg_dump $DB_NAME > $DB_BACKUP_FILE; then
        log "Backup do banco criado: $DB_BACKUP_FILE"
        
        # Comprimir backup
        gzip $DB_BACKUP_FILE
        log "Backup do banco comprimido: $DB_BACKUP_FILE.gz"
        
        echo "$DB_BACKUP_FILE.gz"
    else
        error "Falha ao criar backup do banco de dados!"
    fi
}

# Função para fazer backup dos arquivos da aplicação
backup_application_files() {
    log "Fazendo backup dos arquivos da aplicação..."
    
    APP_BACKUP_FILE="$BACKUP_DIR/application-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    if [ -d "$APP_DIR" ]; then
        # Excluir node_modules e logs para economizar espaço
        sudo tar --exclude='node_modules' --exclude='logs' --exclude='*.log' \
             -czf $APP_BACKUP_FILE -C /opt $APP_NAME
        
        log "Backup dos arquivos criado: $APP_BACKUP_FILE"
        echo "$APP_BACKUP_FILE"
    else
        warn "Diretório da aplicação não encontrado: $APP_DIR"
        echo ""
    fi
}

# Função para fazer backup das configurações
backup_configurations() {
    log "Fazendo backup das configurações..."
    
    CONFIG_BACKUP_FILE="$BACKUP_DIR/config-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # Criar arquivo temporário com configurações
    TEMP_CONFIG_DIR="/tmp/$APP_NAME-config-$(date +%s)"
    mkdir -p $TEMP_CONFIG_DIR
    
    # Backup do .env
    if [ -f "$APP_DIR/.env" ]; then
        sudo cp $APP_DIR/.env $TEMP_CONFIG_DIR/
    fi
    
    # Backup do ecosystem.config.js
    if [ -f "$APP_DIR/ecosystem.config.js" ]; then
        sudo cp $APP_DIR/ecosystem.config.js $TEMP_CONFIG_DIR/
    fi
    
    # Backup das configurações do Nginx
    if [ -f "/etc/nginx/sites-available/$APP_NAME" ]; then
        sudo cp /etc/nginx/sites-available/$APP_NAME $TEMP_CONFIG_DIR/nginx-site
    fi
    
    # Backup do script de gerenciamento
    if [ -f "/usr/local/bin/$APP_NAME" ]; then
        sudo cp /usr/local/bin/$APP_NAME $TEMP_CONFIG_DIR/management-script
    fi
    
    # Criar arquivo de informações do sistema
    cat > $TEMP_CONFIG_DIR/system-info.txt << EOF
Just Dance Event Hub - Backup Information
=========================================
Date: $(date)
System: $(uname -a)
Node.js: $(node --version 2>/dev/null || echo "Not installed")
PostgreSQL: $(psql --version 2>/dev/null || echo "Not installed")
PM2: $(pm2 --version 2>/dev/null || echo "Not installed")
Nginx: $(nginx -v 2>&1 || echo "Not installed")

Application Directory: $APP_DIR
Database Name: $DB_NAME
Backup Directory: $BACKUP_DIR
EOF
    
    # Comprimir configurações
    tar -czf $CONFIG_BACKUP_FILE -C /tmp $(basename $TEMP_CONFIG_DIR)
    
    # Limpar arquivos temporários
    rm -rf $TEMP_CONFIG_DIR
    
    log "Backup das configurações criado: $CONFIG_BACKUP_FILE"
    echo "$CONFIG_BACKUP_FILE"
}

# Função para limpar backups antigos
cleanup_old_backups() {
    log "Limpando backups antigos..."
    
    # Contar backups existentes
    BACKUP_COUNT=$(ls -1 $BACKUP_DIR/*.gz 2>/dev/null | wc -l)
    
    if [ $BACKUP_COUNT -gt $MAX_BACKUPS ]; then
        # Remover backups mais antigos
        ls -t $BACKUP_DIR/*.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
        log "Backups antigos removidos. Mantidos os últimos $MAX_BACKUPS backups."
    else
        log "Nenhum backup antigo para remover."
    fi
}

# Função para verificar integridade do backup
verify_backup() {
    log "Verificando integridade do backup..."
    
    local backup_file=$1
    
    if [[ $backup_file == *.sql.gz ]]; then
        # Verificar backup do banco
        if gunzip -t $backup_file 2>/dev/null; then
            log "✓ Backup do banco de dados verificado com sucesso!"
        else
            warn "✗ Backup do banco de dados corrompido: $backup_file"
        fi
    elif [[ $backup_file == *.tar.gz ]]; then
        # Verificar backup de arquivos
        if tar -tzf $backup_file >/dev/null 2>&1; then
            log "✓ Backup de arquivos verificado com sucesso!"
        else
            warn "✗ Backup de arquivos corrompido: $backup_file"
        fi
    fi
}

# Função para mostrar informações do backup
show_backup_info() {
    echo -e "${GREEN}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                      BACKUP CONCLUÍDO!                       ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    log "Backup do Just Dance Event Hub concluído com sucesso!"
    echo ""
    
    echo -e "${BLUE}📦 Arquivos de Backup Criados:${NC}"
    for file in "$@"; do
        if [ -n "$file" ] && [ -f "$file" ]; then
            size=$(du -h "$file" | cut -f1)
            echo "  • $(basename $file) ($size)"
        fi
    done
    
    echo ""
    echo -e "${BLUE}📊 Informações do Backup:${NC}"
    echo "  • Diretório: $BACKUP_DIR"
    echo "  • Total de backups: $(ls -1 $BACKUP_DIR/*.gz 2>/dev/null | wc -l)"
    echo "  • Limite de backups: $MAX_BACKUPS"
    
    echo ""
    echo -e "${BLUE}🔧 Comandos Úteis:${NC}"
    echo "  • Listar backups: ls -la $BACKUP_DIR"
    echo "  • Restaurar banco: sudo -u postgres createdb $DB_NAME && sudo -u postgres psql $DB_NAME < backup-file.sql"
    echo "  • Extrair arquivos: tar -xzf backup-file.tar.gz"
    
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
    echo "  • Mantenha backups em local seguro"
    echo "  • Teste restaurações periodicamente"
    echo "  • Configure backup automático com cron"
    
    echo ""
    log "Backup concluído!"
}

# Função para configurar backup automático
setup_auto_backup() {
    echo ""
    read -p "Deseja configurar backup automático diário? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Configurando backup automático..."
        
        # Criar script de backup automático
        AUTO_BACKUP_SCRIPT="/usr/local/bin/${APP_NAME}-auto-backup"
        
        cat > $AUTO_BACKUP_SCRIPT << EOF
#!/bin/bash
# Backup automático do Just Dance Event Hub
# Executado diariamente às 02:00

cd $(dirname "$0")
$(pwd)/$(basename "$0") > /var/log/${APP_NAME}-backup.log 2>&1
EOF
        
        sudo chmod +x $AUTO_BACKUP_SCRIPT
        
        # Adicionar ao crontab
        (crontab -l 2>/dev/null; echo "0 2 * * * $AUTO_BACKUP_SCRIPT") | crontab -
        
        log "Backup automático configurado para executar diariamente às 02:00"
        log "Logs em: /var/log/${APP_NAME}-backup.log"
    fi
}

# Função principal
main() {
    log "Iniciando backup do Just Dance Event Hub..."
    
    # Verificar se a aplicação está instalada
    if [ ! -d "$APP_DIR" ]; then
        error "Aplicação não encontrada em $APP_DIR. Execute o script de instalação primeiro."
    fi
    
    # Executar backup
    create_backup_dir
    DB_BACKUP=$(backup_database)
    APP_BACKUP=$(backup_application_files)
    CONFIG_BACKUP=$(backup_configurations)
    cleanup_old_backups
    
    # Verificar integridade
    verify_backup "$DB_BACKUP"
    if [ -n "$APP_BACKUP" ]; then
        verify_backup "$APP_BACKUP"
    fi
    verify_backup "$CONFIG_BACKUP"
    
    # Configurar backup automático
    setup_auto_backup
    
    # Mostrar informações finais
    show_backup_info "$DB_BACKUP" "$APP_BACKUP" "$CONFIG_BACKUP"
}

# Executar função principal
main "$@" 