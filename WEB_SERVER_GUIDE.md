# 🌐 Guia de Servidores Web - Just Dance Event Hub

Este guia explica as opções de servidores web disponíveis para o Just Dance Event Hub e como escolher entre elas.

## 📋 Opções Disponíveis

### 🔵 Nginx (Padrão - Recomendado)

**Vantagens:**
- ✅ Menor consumo de memória
- ✅ Melhor performance para arquivos estáticos
- ✅ Configuração mais simples
- ✅ Melhor para alta concorrência
- ✅ Proxy reverso eficiente
- ✅ Menor overhead

**Desvantagens:**
- ❌ Menos módulos disponíveis
- ❌ Configuração menos flexível
- ❌ Documentação em português limitada

**Quando usar:**
- Aplicações com muitos usuários simultâneos
- Servidores com recursos limitados
- Foco em performance
- Configuração simples

### 🔴 Apache (Alternativa)

**Vantagens:**
- ✅ Mais módulos disponíveis
- ✅ Configuração muito flexível
- ✅ Melhor documentação
- ✅ Suporte a .htaccess
- ✅ Mais familiar para desenvolvedores
- ✅ Melhor para aplicações complexas

**Desvantagens:**
- ❌ Maior consumo de memória
- ❌ Performance inferior para arquivos estáticos
- ❌ Configuração mais complexa
- ❌ Maior overhead

**Quando usar:**
- Necessidade de módulos específicos
- Configurações muito customizadas
- Equipe familiarizada com Apache
- Aplicações que requerem .htaccess

## 🚀 Instalação e Configuração

### Nginx (Opção Padrão)

#### 1. Instalação Manual
```powershell
# Baixar Nginx
# https://nginx.org/en/download.html

# Extrair para C:\nginx
# Copiar configuração
copy nginx-ssl.conf C:\nginx\conf\nginx.conf

# Iniciar
nginx
```

#### 2. Configuração SSL
```powershell
# Obter certificado Let's Encrypt
certbot certonly --webroot -w C:\opt\just-dance-hub\frontend\build -d seudominio.com

# Editar nginx-ssl.conf com seu domínio
# Reiniciar Nginx
nginx -s reload
```

### Apache (Alternativa)

#### 1. Instalação Automática
```powershell
# Instalação completa
.\apache-setup.ps1 -InstallApache -Domain seudominio.com -Email admin@seudominio.com
```

#### 2. Configuração SSL
```powershell
# SSL automático
.\apache-setup.ps1 -Domain seudominio.com -Email admin@seudominio.com -ConfigureSSL
```

#### 3. Apenas Configuração (Apache já instalado)
```powershell
# Configurar apenas
.\apache-setup.ps1 -Domain seudominio.com -Email admin@seudominio.com
```

## 📊 Comparação de Performance

| Aspecto | Nginx | Apache |
|---------|-------|--------|
| **Memória RAM** | ~10-20MB | ~30-50MB |
| **CPU Usage** | Baixo | Médio |
| **Arquivos Estáticos** | Excelente | Bom |
| **Proxy Reverso** | Excelente | Bom |
| **WebSocket** | Excelente | Bom |
| **Configuração** | Simples | Complexa |
| **Módulos** | Limitados | Muitos |
| **Flexibilidade** | Média | Alta |

## 🔧 Configurações Específicas

### Nginx - Características

```nginx
# Configuração otimizada para Just Dance Hub
worker_processes auto;
worker_connections 1024;

# Proxy para backend
location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
}

# WebSocket
location /ws {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Apache - Características

```apache
# Configuração otimizada para Just Dance Hub
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so

# Proxy para backend
<Location "/api/">
    ProxyPass "http://127.0.0.1:3001/api/"
    ProxyPassReverse "http://127.0.0.1:3001/api/"
EndLocation>

# WebSocket
<Location "/ws">
    ProxyPass "ws://127.0.0.1:8080/"
    ProxyPassReverse "ws://127.0.0.1:8080/"
    
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://127.0.0.1:8080/$1" [P,L]
EndLocation>
```

## 🛡️ Segurança

### Nginx - Recursos de Segurança

- Rate limiting nativo
- Headers de segurança
- Bloqueio de IPs
- SSL/TLS otimizado

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;

# Headers de segurança
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
```

### Apache - Recursos de Segurança

- ModSecurity (WAF)
- mod_evasive (DDoS protection)
- Headers de segurança
- Controle de acesso granular

```apache
# ModSecurity
LoadModule security2_module modules/mod_security2.so
SecRuleEngine On

# mod_evasive
LoadModule evasive24_module modules/mod_evasive24.so
DOSPageCount 10
DOSPageInterval 1

# Headers de segurança
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
```

## 🔍 Monitoramento

### Nginx

```powershell
# Status do processo
Get-Process nginx

# Logs
Get-Content C:\nginx\logs\access.log -Tail 50
Get-Content C:\nginx\logs\error.log -Tail 50

# Testar configuração
nginx -t

# Recarregar configuração
nginx -s reload
```

### Apache

```powershell
# Status do serviço
Get-Service Apache2.4

# Logs
Get-Content C:\logs\just-dance-hub\access.log -Tail 50
Get-Content C:\logs\just-dance-hub\error.log -Tail 50

# Testar configuração
C:\Apache24\bin\httpd.exe -t

# Reiniciar serviço
Restart-Service Apache2.4
```

## 🚨 Solução de Problemas

### Problemas Comuns - Nginx

**Erro: "nginx: [error] CreateFile() failed"**
```powershell
# Verificar se o arquivo de configuração existe
Test-Path C:\nginx\conf\nginx.conf

# Verificar sintaxe
nginx -t
```

**Erro: "bind() to 0.0.0.0:80 failed"**
```powershell
# Verificar se a porta está em uso
netstat -ano | findstr :80

# Parar processo que está usando a porta
Stop-Process -Id <PID>
```

### Problemas Comuns - Apache

**Erro: "The Apache service named reported the following error"**
```powershell
# Verificar logs de erro
Get-Content C:\logs\just-dance-hub\error.log -Tail 20

# Testar configuração
C:\Apache24\bin\httpd.exe -t
```

**Erro: "(OS 10048)Only one usage of each socket address"**
```powershell
# Verificar se a porta está em uso
netstat -ano | findstr :80

# Parar serviço conflitante
Stop-Service -Name "Serviço Conflitante"
```

## 📈 Recomendações por Cenário

### 🏢 Pequenas Empresas (< 100 usuários)
**Recomendação: Nginx**
- Menor consumo de recursos
- Configuração mais simples
- Suficiente para a maioria dos casos

### 🏭 Empresas Médias (100-1000 usuários)
**Recomendação: Nginx ou Apache**
- Nginx: Se foco em performance
- Apache: Se necessita de módulos específicos

### 🌐 Grandes Empresas (> 1000 usuários)
**Recomendação: Nginx + Load Balancer**
- Nginx para performance
- Load balancer para distribuição
- Múltiplas instâncias da aplicação

### 🔧 Desenvolvimento
**Recomendação: Qualquer um**
- Use o que a equipe conhece melhor
- Apache pode ser mais familiar
- Nginx é mais próximo da produção

## 🔄 Migração entre Servidores

### De Nginx para Apache

```powershell
# 1. Parar Nginx
nginx -s quit

# 2. Instalar e configurar Apache
.\apache-setup.ps1 -InstallApache -Domain seudominio.com

# 3. Migrar certificados SSL
copy C:\ssl\* C:\ssl\seudominio.com\

# 4. Iniciar Apache
Start-Service Apache2.4
```

### De Apache para Nginx

```powershell
# 1. Parar Apache
Stop-Service Apache2.4

# 2. Instalar Nginx
# Baixar e extrair Nginx

# 3. Configurar Nginx
copy nginx-ssl.conf C:\nginx\conf\nginx.conf

# 4. Iniciar Nginx
nginx
```

## 📚 Recursos Adicionais

### Documentação Oficial
- **Nginx**: https://nginx.org/en/docs/
- **Apache**: https://httpd.apache.org/docs/

### Ferramentas de Teste
- **Apache Bench**: `ab -n 1000 -c 10 http://localhost/`
- **wrk**: Ferramenta moderna de benchmark
- **curl**: Testes de conectividade

### Monitoramento
- **Nginx**: nginx-prometheus-exporter
- **Apache**: mod_status + Prometheus
- **Logs**: ELK Stack ou Grafana

---

## 🎯 Conclusão

**Para a maioria dos casos do Just Dance Event Hub, recomendamos o Nginx** devido à sua simplicidade, performance e menor consumo de recursos.

**Use Apache apenas se:**
- Sua equipe tem mais experiência com Apache
- Precisa de módulos específicos não disponíveis no Nginx
- Requer configurações muito customizadas
- Já tem infraestrutura Apache estabelecida

Ambas as opções são totalmente suportadas e funcionais para o Just Dance Event Hub! 🎉