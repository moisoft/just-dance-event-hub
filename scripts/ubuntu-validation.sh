#!/bin/bash
# Script de Validação da Configuração de Produção - Ubuntu Server
# Just Dance Event Hub

# Parâmetros
DOMAIN="localhost"
API_PORT=3000

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
        -h|--help)
            echo "Uso: $0 [opções]"
            echo "Opções:"
            echo "  -d, --domain DOMINIO  Domínio para validar (padrão: localhost)"
            echo "  -p, --port PORTA     Porta da API (padrão: 3000)"
            echo "  -h, --help           Mostrar esta ajuda"
            exit 0
            ;;
        *)
            echo "Opção desconhecida: $1"
            exit 1
            ;;
    esac
done

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
VALIDATION_LOG="/var/log/$APP_NAME/validation-$(date +%Y%m%d-%H%M%S).log"
ERROR_COUNT=0
WARNING_COUNT=0
SUCCESS_COUNT=0

# Funções de logging
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1" >> "$VALIDATION_LOG"
    ((SUCCESS_COUNT++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$VALIDATION_LOG"
    ((ERROR_COUNT++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$VALIDATION_LOG"
    ((WARNING_COUNT++))
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1" >> "$VALIDATION_LOG"
}

log_step() {
    echo -e "${BLUE}🔧 $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP: $1" >> "$VALIDATION_LOG"
}

# Criar diretório de log se não existir
mkdir -p "$LOG_DIR"

# Verificar estrutura de arquivos
check_file_structure() {
    log_step "Verificando estrutura de arquivos"
    
    local required_files=(
        "$APP_DIR/package.json"
        "$APP_DIR/backend/package.json"
        "$APP_DIR/frontend/package.json"
        "$APP_DIR/backend/.env"
        "$APP_DIR/frontend/.env.production"
        "$APP_DIR/ecosystem.config.js"
    )
    
    local required_dirs=(
        "$APP_DIR"
        "$APP_DIR/backend"
        "$APP_DIR/frontend"
        "$APP_DIR/frontend/build"
        "$LOG_DIR"
    )
    
    # Verificar diretórios
    for dir in "${required_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            log_success "Diretório encontrado: $dir"
        else
            log_error "Diretório não encontrado: $dir"
        fi
    done
    
    # Verificar arquivos
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            log_success "Arquivo encontrado: $file"
        else
            log_error "Arquivo não encontrado: $file"
        fi
    done
}

# Verificar dependências do sistema
check_system_dependencies() {
    log_step "Verificando dependências do sistema"
    
    # Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        log_success "Node.js instalado: $node_version"
        
        # Verificar versão mínima (18.x)
        local major_version=$(echo "$node_version" | sed 's/v//' | cut -d. -f1)
        if [[ $major_version -ge 18 ]]; then
            log_success "Versão do Node.js é adequada (>= 18.x)"
        else
            log_warning "Versão do Node.js pode ser muito antiga: $node_version"
        fi
    else
        log_error "Node.js não está instalado"
    fi
    
    # NPM
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        log_success "NPM instalado: $npm_version"
    else
        log_error "NPM não está instalado"
    fi
    
    # PM2
    if command -v pm2 &> /dev/null; then
        local pm2_version=$(pm2 --version)
        log_success "PM2 instalado: $pm2_version"
    else
        log_error "PM2 não está instalado"
    fi
    
    # PostgreSQL
    if command -v psql &> /dev/null; then
        local pg_version=$(psql --version | awk '{print $3}')
        log_success "PostgreSQL instalado: $pg_version"
        
        # Verificar se está rodando
        if systemctl is-active --quiet postgresql; then
            log_success "PostgreSQL está rodando"
        else
            log_error "PostgreSQL não está rodando"
        fi
    else
        log_error "PostgreSQL não está instalado"
    fi
    
    # Verificar servidor web
    local web_server=""
    if command -v nginx &> /dev/null; then
        web_server="nginx"
        local nginx_version=$(nginx -v 2>&1 | awk '{print $3}')
        log_success "Nginx instalado: $nginx_version"
        
        if systemctl is-active --quiet nginx; then
            log_success "Nginx está rodando"
        else
            log_error "Nginx não está rodando"
        fi
    elif command -v apache2 &> /dev/null; then
        web_server="apache"
        local apache_version=$(apache2 -v | head -1 | awk '{print $3}')
        log_success "Apache instalado: $apache_version"
        
        if systemctl is-active --quiet apache2; then
            log_success "Apache está rodando"
        else
            log_error "Apache não está rodando"
        fi
    else
        log_error "Nenhum servidor web (Nginx/Apache) encontrado"
    fi
    
    # Git
    if command -v git &> /dev/null; then
        local git_version=$(git --version | awk '{print $3}')
        log_success "Git instalado: $git_version"
    else
        log_warning "Git não está instalado"
    fi
}

# Verificar configurações de ambiente
check_environment_config() {
    log_step "Verificando configurações de ambiente"
    
    # Backend .env
    if [[ -f "$APP_DIR/backend/.env" ]]; then
        log_success "Arquivo .env do backend encontrado"
        
        # Verificar variáveis essenciais
        local required_vars=("DATABASE_URL" "JWT_SECRET" "PORT")
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" "$APP_DIR/backend/.env"; then
                log_success "Variável $var configurada"
            else
                log_error "Variável $var não encontrada no .env"
            fi
        done
        
        # Verificar se JWT_SECRET não é o padrão
        if grep -q "JWT_SECRET=your-super-secret-jwt-key" "$APP_DIR/backend/.env"; then
            log_warning "JWT_SECRET está usando valor padrão - altere para produção"
        fi
    else
        log_error "Arquivo .env do backend não encontrado"
    fi
    
    # Frontend .env.production
    if [[ -f "$APP_DIR/frontend/.env.production" ]]; then
        log_success "Arquivo .env.production do frontend encontrado"
        
        # Verificar URLs
        if grep -q "REACT_APP_API_URL=" "$APP_DIR/frontend/.env.production"; then
            log_success "REACT_APP_API_URL configurada"
        else
            log_error "REACT_APP_API_URL não encontrada"
        fi
        
        if grep -q "REACT_APP_WS_URL=" "$APP_DIR/frontend/.env.production"; then
            log_success "REACT_APP_WS_URL configurada"
        else
            log_error "REACT_APP_WS_URL não encontrada"
        fi
    else
        log_error "Arquivo .env.production do frontend não encontrado"
    fi
}

# Verificar conectividade do banco de dados
check_database_connectivity() {
    log_step "Verificando conectividade do banco de dados"
    
    if [[ -f "$APP_DIR/backend/.env" ]]; then
        # Extrair informações do banco
        local db_url=$(grep "^DATABASE_URL=" "$APP_DIR/backend/.env" | cut -d= -f2- | tr -d '"')
        
        if [[ -n "$db_url" ]]; then
            # Tentar conectar ao banco
            if psql "$db_url" -c "SELECT 1;" &>/dev/null; then
                log_success "Conexão com banco de dados bem-sucedida"
                
                # Verificar se tabelas existem
                local tables=$(psql "$db_url" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" 2>/dev/null | wc -l)
                if [[ $tables -gt 0 ]]; then
                    log_success "Tabelas do banco encontradas ($tables tabelas)"
                else
                    log_warning "Nenhuma tabela encontrada no banco"
                fi
            else
                log_error "Falha na conexão com banco de dados"
            fi
        else
            log_error "DATABASE_URL não configurada"
        fi
    fi
}

# Verificar processos PM2
check_pm2_processes() {
    log_step "Verificando processos PM2"
    
    if command -v pm2 &> /dev/null; then
        local pm2_list=$(pm2 jlist 2>/dev/null)
        
        if [[ "$pm2_list" != "[]" ]]; then
            log_success "Processos PM2 encontrados"
            
            # Verificar processos específicos
            if pm2 describe backend &>/dev/null; then
                local backend_status=$(pm2 jlist | jq -r '.[] | select(.name=="backend") | .pm2_env.status' 2>/dev/null)
                if [[ "$backend_status" == "online" ]]; then
                    log_success "Backend está online no PM2"
                else
                    log_error "Backend não está online no PM2: $backend_status"
                fi
            else
                log_error "Processo backend não encontrado no PM2"
            fi
            
            if pm2 describe websocket &>/dev/null; then
                local ws_status=$(pm2 jlist | jq -r '.[] | select(.name=="websocket") | .pm2_env.status' 2>/dev/null)
                if [[ "$ws_status" == "online" ]]; then
                    log_success "WebSocket está online no PM2"
                else
                    log_error "WebSocket não está online no PM2: $ws_status"
                fi
            else
                log_error "Processo websocket não encontrado no PM2"
            fi
        else
            log_error "Nenhum processo PM2 encontrado"
        fi
    fi
}

# Verificar conectividade HTTP
check_http_connectivity() {
    log_step "Verificando conectividade HTTP"
    
    # Verificar portas
    local ports=(80 443 3001 8080)
    for port in "${ports[@]}"; do
        if ss -tuln | grep -q ":$port "; then
            log_success "Porta $port está aberta"
        else
            log_warning "Porta $port não está aberta"
        fi
    done
    
    # Testar endpoints
    local endpoints=()
    
    # Adicionar endpoint baseado no domínio configurado
    if [ "$DOMAIN" = "localhost" ]; then
        endpoints+=("http://localhost:$API_PORT/health")
        endpoints+=("http://localhost/health")
    else
        endpoints+=("http://$DOMAIN/health")
        endpoints+=("https://$DOMAIN/health")
    fi
    
    for endpoint in "${endpoints[@]}"; do
        if curl -s -f "$endpoint" &>/dev/null; then
            log_success "Endpoint acessível: $endpoint"
        else
            log_warning "Endpoint não acessível: $endpoint"
        fi
    done
}

# Verificar configurações de segurança
check_security_settings() {
    log_step "Verificando configurações de segurança"
    
    # UFW Firewall
    if command -v ufw &> /dev/null; then
        if ufw status | grep -q "Status: active"; then
            log_success "UFW Firewall está ativo"
        else
            log_warning "UFW Firewall não está ativo"
        fi
    else
        log_warning "UFW não está instalado"
    fi
    
    # Fail2ban
    if command -v fail2ban-client &> /dev/null; then
        if systemctl is-active --quiet fail2ban; then
            log_success "Fail2ban está rodando"
        else
            log_warning "Fail2ban não está rodando"
        fi
    else
        log_warning "Fail2ban não está instalado"
    fi
    
    # Verificar permissões de arquivos
    if [[ -f "$APP_DIR/backend/.env" ]]; then
        local env_perms=$(stat -c "%a" "$APP_DIR/backend/.env")
        if [[ "$env_perms" == "600" ]] || [[ "$env_perms" == "644" ]]; then
            log_success "Permissões do .env estão adequadas ($env_perms)"
        else
            log_warning "Permissões do .env podem ser inseguras ($env_perms)"
        fi
    fi
    
    # Verificar SSL
    if [[ -f "$SSL_DIR/fullchain.pem" ]] && [[ -f "$SSL_DIR/privkey.pem" ]]; then
        log_success "Certificados SSL encontrados"
        
        # Verificar validade do certificado
        local cert_expiry=$(openssl x509 -in "$SSL_DIR/fullchain.pem" -noout -enddate 2>/dev/null | cut -d= -f2)
        if [[ -n "$cert_expiry" ]]; then
            log_success "Certificado SSL válido até: $cert_expiry"
        fi
    else
        log_warning "Certificados SSL não encontrados"
    fi
    
    # Verificar senhas padrão
    if [[ -f "$APP_DIR/backend/.env" ]]; then
        if grep -q "password123" "$APP_DIR/backend/.env"; then
            log_error "Senha padrão detectada no .env - altere imediatamente!"
        fi
    fi
}

# Verificar sistema de logs
check_logging_system() {
    log_step "Verificando sistema de logs"
    
    # Verificar diretórios de log
    if [[ -d "$LOG_DIR" ]]; then
        log_success "Diretório de logs existe: $LOG_DIR"
        
        # Verificar permissões
        local log_owner=$(stat -c "%U:%G" "$LOG_DIR")
        log_info "Proprietário do diretório de logs: $log_owner"
        
        # Verificar espaço em disco
        local log_size=$(du -sh "$LOG_DIR" 2>/dev/null | awk '{print $1}')
        log_info "Tamanho dos logs: $log_size"
    else
        log_error "Diretório de logs não existe: $LOG_DIR"
    fi
    
    # Verificar logrotate
    if [[ -f "/etc/logrotate.d/$APP_NAME" ]]; then
        log_success "Configuração logrotate encontrada"
    else
        log_warning "Configuração logrotate não encontrada"
    fi
    
    # Verificar logs do servidor web
    local web_logs=(
        "/var/log/nginx/access.log"
        "/var/log/nginx/error.log"
        "/var/log/apache2/access.log"
        "/var/log/apache2/error.log"
    )
    
    for log_file in "${web_logs[@]}"; do
        if [[ -f "$log_file" ]]; then
            log_success "Log do servidor web encontrado: $log_file"
        fi
    done
}

# Verificar sistema de backup
check_backup_system() {
    log_step "Verificando sistema de backup"
    
    # Verificar script de backup
    if [[ -f "/usr/local/bin/backup-hub.sh" ]]; then
        log_success "Script de backup encontrado"
        
        # Verificar se é executável
        if [[ -x "/usr/local/bin/backup-hub.sh" ]]; then
            log_success "Script de backup é executável"
        else
            log_error "Script de backup não é executável"
        fi
    else
        log_warning "Script de backup não encontrado"
    fi
    
    # Verificar diretório de backup
    local backup_dir="/var/backups/$APP_NAME"
    if [[ -d "$backup_dir" ]]; then
        log_success "Diretório de backup existe: $backup_dir"
        
        # Verificar backups recentes
        local recent_backups=$(find "$backup_dir" -type d -mtime -7 | wc -l)
        if [[ $recent_backups -gt 1 ]]; then
            log_success "Backups recentes encontrados ($((recent_backups-1)) backups)"
        else
            log_warning "Nenhum backup recente encontrado"
        fi
    else
        log_warning "Diretório de backup não existe: $backup_dir"
    fi
    
    # Verificar crontab para backups
    if crontab -l 2>/dev/null | grep -q "backup-hub.sh"; then
        log_success "Backup automático configurado no crontab"
    else
        log_warning "Backup automático não configurado no crontab"
    fi
}

# Verificar performance do sistema
check_system_performance() {
    log_step "Verificando performance do sistema"
    
    # Verificar uso de CPU
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    if (( $(echo "$cpu_usage < 80" | bc -l) )); then
        log_success "Uso de CPU normal: ${cpu_usage}%"
    else
        log_warning "Alto uso de CPU: ${cpu_usage}%"
    fi
    
    # Verificar uso de memória
    local mem_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$mem_usage < 80" | bc -l) )); then
        log_success "Uso de memória normal: ${mem_usage}%"
    else
        log_warning "Alto uso de memória: ${mem_usage}%"
    fi
    
    # Verificar espaço em disco
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [[ $disk_usage -lt 80 ]]; then
        log_success "Espaço em disco adequado: ${disk_usage}% usado"
    else
        log_warning "Pouco espaço em disco: ${disk_usage}% usado"
    fi
    
    # Verificar load average
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cpu_cores=$(nproc)
    if (( $(echo "$load_avg < $cpu_cores" | bc -l) )); then
        log_success "Load average normal: $load_avg (${cpu_cores} cores)"
    else
        log_warning "Load average alto: $load_avg (${cpu_cores} cores)"
    fi
}

# Gerar relatório final
generate_report() {
    echo ""
    echo -e "${BLUE}=== RELATÓRIO DE VALIDAÇÃO ===${NC}"
    echo ""
    echo -e "📅 Data: $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "🖥️  Sistema: $(lsb_release -d | cut -f2)"
    echo -e "🏠 Diretório: $APP_DIR"
    echo ""
    echo -e "📊 Resultados:"
    echo -e "   ${GREEN}✅ Sucessos: $SUCCESS_COUNT${NC}"
    echo -e "   ${YELLOW}⚠️  Avisos: $WARNING_COUNT${NC}"
    echo -e "   ${RED}❌ Erros: $ERROR_COUNT${NC}"
    echo ""
    
    if [[ $ERROR_COUNT -eq 0 ]]; then
        echo -e "${GREEN}🎉 Sistema validado com sucesso!${NC}"
        if [[ $WARNING_COUNT -gt 0 ]]; then
            echo -e "${YELLOW}⚠️  Existem $WARNING_COUNT avisos que devem ser revisados.${NC}"
        fi
    else
        echo -e "${RED}❌ Validação falhou com $ERROR_COUNT erros.${NC}"
        echo -e "${YELLOW}🔧 Corrija os erros antes de usar em produção.${NC}"
    fi
    
    echo ""
    echo -e "📋 Log completo: $VALIDATION_LOG"
    echo ""
    
    # Salvar resumo no log
    {
        echo ""
        echo "=== RESUMO DA VALIDAÇÃO ==="
        echo "Data: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "Sucessos: $SUCCESS_COUNT"
        echo "Avisos: $WARNING_COUNT"
        echo "Erros: $ERROR_COUNT"
        echo "Status: $([[ $ERROR_COUNT -eq 0 ]] && echo "APROVADO" || echo "REPROVADO")"
        echo "========================="
    } >> "$VALIDATION_LOG"
}

# Função principal
main() {
    echo -e "${BLUE}🔍 Validação de Produção - Just Dance Event Hub${NC}"
    echo -e "${BLUE}Ubuntu Server Validation Script${NC}"
    echo ""
    
    # Verificar se está executando como root ou com sudo
    if [[ $EUID -eq 0 ]]; then
        log_warning "Executando como root - alguns testes podem não refletir o ambiente real"
    fi
    
    # Executar todas as verificações
    check_file_structure
    check_system_dependencies
    check_environment_config
    check_database_connectivity
    check_pm2_processes
    check_http_connectivity
    check_security_settings
    check_logging_system
    check_backup_system
    check_system_performance
    
    # Gerar relatório final
    generate_report
    
    # Retornar código de saída apropriado
    if [[ $ERROR_COUNT -eq 0 ]]; then
        exit 0
    else
        exit 1
    fi
}

# Executar função principal
main "$@"