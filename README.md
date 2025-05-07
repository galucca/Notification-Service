# 📦 Serviço de Notificações Assíncronas

Este projeto implementa um sistema de notificações assíncronas usando Node.js com TypeScript, MongoDB, RabbitMQ e Docker. Ele foi desenvolvido para gerenciar tasks de notificação (como mensagens de WhatsApp, email, SMS) que são processadas por workers atuando de forma paralela, garantindo alta performance e escalabilidade.

## 💡 O Que o Projeto Faz

- API REST para criar, listar, atualizar e deletar notificações (tasks).

- Armazena as tasks no MongoDB, com status inicial pending.

- Publica cada nova task na fila RabbitMQ.

- Workers (mínimo 3) consomem as tasks da fila de forma assíncrona, imprimindo o conteúdo no console e marcando o status como completed.

Isso simula um pipeline completo de mensageria assíncrona, pronto para integrar com serviços reais como Twilio (SMS), WhatsApp API, SendGrid (email) etc.

## 🏗️ Como Foi Criado
O projeto foi cuidadosamente estruturado em TypeScript para garantir:

✅ Tipagem forte e clara.

✅ Modularização de código, separando rotas, modelos, filas e workers.

✅ Boas práticas de código assíncrono com async/await.

✅ Integração limpa com MongoDB usando Mongoose.

✅ Gerenciamento robusto de filas com RabbitMQ.

Também foi preparado para ser facilmente containerizado com Docker, permitindo subir o ambiente completo (banco + fila) com apenas um comando.

## 🚀 Como Rodar o Projeto
Pré-requisitos
Node.js e npm instalados.

Docker e Docker Compose instalados.


### 1️⃣ Clone o repositório:

```
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo
```

### 2️⃣ Instale as dependências:
```
npm install
```

### 3️⃣ Configure as variáveis de ambiente:

Crie um arquivo .env com base no .env.example.

### 🐳 Como Levantar o Docker

Na raiz do projeto, rode:
```
docker compose up -d
```
#### ✅ Isso irá subir:
```
MongoDB na porta 27017.

RabbitMQ na porta 5672 (e painel web em 15672).
```
### ⚙️ Como Rodar o Servidor

No terminal, execute:
```
npx ts-node src/index.ts
```
#### ✅ O servidor Express estará disponível em:
```
http://localhost:3000
```
#### 👷 Como Rodar os Workers

Em três terminais separados, rode:
```
npx ts-node src/workers/worker1.ts
npx ts-node src/workers/worker2.ts
npx ts-node src/workers/worker3.ts
```
#### ✅ Eles ficarão escutando a fila notifications e processando tasks simultaneamente.

### 🔗 Como Usar os Endpoints

Você pode usar o Postman para testar os endpoints:

### Principais Rotas:

| Método | Rota            | Descrição                             |
| ------ | --------------- | ------------------------------------- |
| POST   | /api/tasks      | Cria uma nova task                    |
| GET    | /api/tasks      | Lista todas as tasks                  |
| GET    | /api/tasks/\:id | Busca task pelo ID                    |
| PATCH  | /api/tasks/\:id | Atualiza o status (pending/completed) |
| DELETE | /api/tasks/\:id | Deleta uma task                       |

## 📥 Collection Postman
Na pasta /postman/ (ou anexo no repositório), você encontrará um arquivo .json pronto para importar no Postman, contendo:

✅ Requisições já configuradas.

✅ Variáveis para capturar automaticamente o taskId.

✅ Sequências de teste prontas para usar no Runner.

## 💬 Sobre o Código
O código foi escrito com foco em clareza, modularidade e escalabilidade.

Models bem definidos com Mongoose.

Rotas organizadas separadamente.

Integração RabbitMQ encapsulada no módulo de fila.

Workers independentes que podem escalar horizontalmente.

Pronto para expandir, adicionar autenticação, permissões, envio real de mensagens, logs e monitoramento.

