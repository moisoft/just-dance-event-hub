#!/bin/bash

# 🏥 Just Dance Event Hub - Health Check Script para Ubuntu
# Versão: 1.0.0
# Autor: Just Dance Event Hub Team

# Parâmetros
DOMAIN="localhost"
API_PORT=3000
FRONTEND_PORT=3000

# Processar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -p|--port)
            API_PORT="$2"
            shift 2
            ;;
        -f|--frontend-port)
            FRONTEND_PORT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Uso: $0 [opções]"
            echo "Opções:"
            echo "  -d, --domain DOMINIO        Domínio para testar (padrão: localhost)"
            echo "  -p, --port PORTA           Porta da API (padrão: 3000)"
            echo "  -f, --frontend-port PORTA  Porta do frontend (padrão: 3000)"
            echo "  -h, --help                 Mostrar esta ajuda"
            exit 0
            ;;
        *)
            echo "Opção desconhecida: $1"
            exit 1
            ;;
    esac
done

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓ $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠ $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ $1${NC}"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                    Just Dance Event Hub                      ║
║                    Health Check Ubuntu v1.0.0                ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Variáveis de configuração
APP_NAME="just-dance-hub"
APP_DIR="/opt/$APP_NAME"
DB_NAME="just_dance_hub"
SERVICE_USER="$APP_NAME"

# Função para verificar se a aplicação está instalada
check_installation() {
    info "Verificando instalação da aplicação..."
    
    if [ -d "$APP_DIR" ]; then
        log "Diretório da aplicação encontrado: $APP_DIR"
        
        # Verificar arquivos essenciais
        if [ -f "$APP_DIR/.env" ]; then
            log "Arquivo .env encontrado"
        else
            error "Arquivo .env não encontrado"
        fi
        
        if [ -f "$APP_DIR/ecosystem.config.js" ]; then
            log "Arquivo ecosystem.config.js encontrado"
        else
            error "Arquivo ecosystem.config.js não encontrado"
        fi
        
        if [ -d "$APP_DIR/dist" ]; then
            log "Diretório dist encontrado"
        else
            error "Diretório dist não encontrado"
        fi
    else
        error "Diretório da aplicação não encontrado: $APP_DIR"
        return 1
    fi
}

# Função para verificar usuário do sistema
check_system_user() {
    info "Verificando usuário do sistema..."
    
    if id "$SERVICE_USER" &>/dev/null; then
        log "Usuário $SERVICE_USER encontrado"
    else
        error "Usuário $SERVICE_USER não encontrado"
        return 1
    fi
}

# Função para verificar PostgreSQL
check_postgresql() {
    info "Verificando PostgreSQL..."
    
    if command -v psql &> /dev/null; then
        log "PostgreSQL instalado"
        
        # Verificar se o serviço está rodando
        if sudo systemctl is-active --quiet postgresql; then
            log "PostgreSQL está rodando"
        else
            error "PostgreSQL não está rodando"
            return 1
        fi
        
        # Verificar se o banco existe
        if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
            log "Banco de dados $DB_NAME encontrado"
            
            # Testar conexão
            if sudo -u postgres psql -d $DB_NAME -c "SELECT 1;" &>/dev/null; then
                log "Conexão com banco de dados OK"
            else
                error "Falha na conexão com banco de dados"
                return 1
            fi
        else
            error "Banco de dados $DB_NAME não encontrado"
            return 1
        fi
    else
        error "PostgreSQL não instalado"
        return 1
    fi
}

# Função para verificar PM2
check_pm2() {
    info "Verificando PM2..."
    
    if command -v pm2 &> /dev/null; then
        log "PM2 instalado"
        
        # Verificar se a aplicação está rodando no PM2
        if sudo -u $SERVICE_USER pm2 list | grep -q $APP_NAME; then
            log "Aplicação encontrada no PM2"
            
            # Verificar status
            STATUS=$(sudo -u $SERVICE_USER pm2 jlist | jq -r ".[] | select(.name == \"$APP_NAME\") | .pm2_env.status" 2>/dev/null || echo "unknown")
            if [ "$STATUS" = "online" ]; then
                log "Aplicação está online no PM2"
            else
                warn "Aplicação não está online no PM2 (status: $STATUS)"
            fi
        else
            error "Aplicação não encontrada no PM2"
            return 1
        fi
    else
        error "PM2 não instalado"
        return 1
    fi
}

# Função para verificar Nginx
check_nginx() {
    info "Verificando Nginx..."
    
    if command -v nginx &> /dev/null; then
        log "Nginx instalado"
        
        # Verificar se o serviço está rodando
        if sudo systemctl is-active --quiet nginx; then
            log "Nginx está rodando"
        else
            warn "Nginx não está rodando"
        fi
        
        # Verificar configuração
        if [ -f "/etc/nginx/sites-available/$APP_NAME" ]; then
            log "Configuração do Nginx encontrada"
            
            # Testar configuração
            if sudo nginx -t &>/dev/null; then
                log "Configuração do Nginx OK"
            else
                warn "Problema na configuração do Nginx"
            fi
        else
            warn "Configuração do Nginx não encontrada"
        fi
    else
        info "Nginx não instalado (opcional)"
    fi
}

# Função para verificar firewall
check_firewall() {
    info "Verificando firewall..."
    
    if command -v ufw &> /dev/null; then
        UFW_STATUS=$(sudo ufw status | head -1)
        if [[ $UFW_STATUS == *"Status: active"* ]]; then
            log "UFW está ativo"
            
            # Verificar portas
            if sudo ufw status | grep -q "22/tcp.*ALLOW"; then
                log "Porta 22 (SSH) permitida"
            else
                warn "Porta 22 (SSH) não permitida"
            fi
            
            if sudo ufw status | grep -q "80/tcp.*ALLOW"; then
                log "Porta 80 (HTTP) permitida"
            else
                warn "Porta 80 (HTTP) não permitida"
            fi
        else
            warn "UFW não está ativo"
        fi
    else
        warn "UFW não instalado"
    fi
}

# Função para verificar logs
check_logs() {
    info "Verificando logs..."
    
    LOG_DIR="/var/log/$APP_NAME"
    
    if [ -d "$LOG_DIR" ]; then
        log "Diretório de logs encontrado: $LOG_DIR"
        
        # Verificar arquivos de log
        for log_file in error.log out.log combined.log; do
            if [ -f "$LOG_DIR/$log_file" ]; then
                size=$(du -h "$LOG_DIR/$log_file" | cut -f1)
                log "Log $log_file encontrado ($size)"
                
                # Verificar se há erros recentes
                if [ "$log_file" = "error.log" ]; then
                    error_count=$(sudo tail -100 "$LOG_DIR/$log_file" | grep -c "ERROR\|error" 2>/dev/null || echo "0")
                    if [ "$error_count" -gt 0 ]; then
                        warn "Encontrados $error_count erros recentes no log"
                    else
                        log "Nenhum erro recente encontrado"
                    fi
                fi
            else
                warn "Log $log_file não encontrado"
            fi
        done
    else
        warn "Diretório de logs não encontrado"
    fi
}

# Função para verificar recursos do sistema
check_system_resources() {
    info "Verificando recursos do sistema..."
    
    # CPU
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    log "Uso de CPU: ${cpu_usage}%"
    
    # Memória
    memory_info=$(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')
    log "Uso de memória: $memory_info"
    
    # Disco
    disk_usage=$(df -h / | awk 'NR==2{print $5}')
    log "Uso de disco: $disk_usage"
    
    # Verificar se há espaço suficiente
    disk_available=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
    if [ "$disk_available" -lt 5 ]; then
        warn "Pouco espaço em disco disponível: ${disk_available}G"
    else
        log "Espaço em disco OK: ${disk_available}G disponível"
    fi
}

# Função para testar API
test_api() {
    info "Testando API..."
    
    # Verificar se a aplicação está respondendo
    if command -v curl &> /dev/null; then
        # Testar API com domínio configurado
        API_URL="http://$DOMAIN:$API_PORT"
        if curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health" | grep -q "200"; then
            log "API respondendo em $API_URL"
        else
            # Tentar com Nginx se disponível
            if command -v nginx &> /dev/null; then
                DOMAIN=$(grep "server_name" /etc/nginx/sites-available/$APP_NAME 2>/dev/null | awk '{print $2}' | sed 's/;$//' || echo "")
                if [ -n "$DOMAIN" ] && curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/api/health | grep -q "200"; then
                    log "API respondendo via Nginx: $DOMAIN"
                    API_URL="http://$DOMAIN"
                else
                    error "API não está respondendo"
                    return 1
                fi
            else
                error "API não está respondendo"
                return 1
            fi
        fi
        
        # Testar endpoints específicos
        if [ -n "$API_URL" ]; then
            # Teste de health
            if curl -s "$API_URL/api/health" | grep -q "status.*ok"; then
                log "Endpoint /api/health OK"
            else
                warn "Endpoint /api/health com problema"
            fi
            
            # Teste de eventos (pode retornar 401 se não autenticado, mas deve responder)
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/events")
            if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
                log "Endpoint /api/events respondendo (HTTP $HTTP_CODE)"
            else
                warn "Endpoint /api/events com problema (HTTP $HTTP_CODE)"
            fi
        fi
    else
        warn "curl não instalado - não foi possível testar API"
    fi
}

# Função para verificar backups
check_backups() {
    info "Verificando backups..."
    
    BACKUP_DIR="/var/backups/$APP_NAME"
    
    if [ -d "$BACKUP_DIR" ]; then
        log "Diretório de backups encontrado: $BACKUP_DIR"
        
        # Contar backups
        backup_count=$(ls -1 $BACKUP_DIR/*.gz 2>/dev/null | wc -l)
        if [ "$backup_count" -gt 0 ]; then
            log "Encontrados $backup_count backups"
            
            # Verificar backup mais recente
            latest_backup=$(ls -t $BACKUP_DIR/*.gz 2>/dev/null | head -1)
            if [ -n "$latest_backup" ]; then
                backup_date=$(stat -c %y "$latest_backup" | cut -d' ' -f1)
                log "Backup mais recente: $(basename $latest_backup) ($backup_date)"
            fi
        else
            warn "Nenhum backup encontrado"
        fi
    else
        warn "Diretório de backups não encontrado"
    fi
}

# Função para mostrar resumo
show_summary() {
    echo ""
    echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}                    RESUMO DO HEALTH CHECK                    ${NC}"
    echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Contar problemas
    local errors=0
    local warnings=0
    
    # Verificar se houve erros
    if [ $? -ne 0 ]; then
        errors=$((errors + 1))
    fi
    
    echo -e "${GREEN}✓ Componentes verificados com sucesso${NC}"
    echo -e "${YELLOW}⚠ Avisos e recomendações${NC}"
    echo -e "${RED}✗ Problemas encontrados${NC}"
    
    echo ""
    echo -e "${BLUE}🔧 Próximos passos recomendados:${NC}"
    
    if [ $errors -gt 0 ]; then
        echo "  • Corrija os problemas identificados"
        echo "  • Execute o script novamente após as correções"
    fi
    
    echo "  • Configure monitoramento contínuo"
    echo "  • Configure backup automático"
    echo "  • Monitore logs regularmente"
    echo "  • Mantenha o sistema atualizado"
    
    echo ""
    echo -e "${BLUE}📞 Comandos úteis:${NC}"
    echo "  • Status da aplicação: sudo just-dance-hub status"
    echo "  • Ver logs: sudo just-dance-hub logs"
    echo "  • Reiniciar: sudo just-dance-hub restart"
    echo "  • Backup: ./backup-ubuntu.sh"
    
    echo ""
    log "Health check concluído!"
}

# Função principal
main() {
    info "Iniciando health check do Just Dance Event Hub..."
    
    # Executar verificações
    check_installation
    check_system_user
    check_postgresql
    check_pm2
    check_nginx
    check_firewall
    check_logs
    check_system_resources
    test_api
    check_backups
    
    # Mostrar resumo
    show_summary
}

# Executar função principal
main "$@"