
# MutStoreAPI

A **MutStoreAPI** é a interface de programação de aplicativos (API) da loja de aplicativos MutStore, desenvolvida por um grupo de estudantes da Universidade Eduardo Mondlane, em Moçambique (UEM). Esta API tem como objetivo fornecer uma experiência acessível e prática para a interação com a plataforma, facilitando a busca, instalação e atualização de aplicativos, além de oferecer soluções digitais variadas para a comunidade universitária e o público em geral.


## Recursos da MutStoreAPI

- **Autenticação de Usuário**: A MutStoreAPI oferece um sistema de criação de conta e login seguro, utilizando **MongoDB** para o armazenamento de dados e **JWT** (JSON Web Tokens) para gerenciar a autenticação, proporcionando acesso rápido e personalizado para cada usuário.

- **Notificações em Tempo Real**: A integração com a API **Twilio** permite o envio de SMS instantâneos, garantindo que os usuários recebam notificações sobre atualizações importantes, como confirmações de compras e status de downloads.

- **Uploads de Fotos para o Google Cloud**: A API permite o upload de fotos diretamente para o **Google Cloud Storage**, facilitando o gerenciamento de imagens associadas aos aplicativos. Isso garante armazenamento seguro e escalável, com acesso rápido às imagens durante a navegação na plataforma.

- **Estrutura API RESTful**: Desenvolvida com **Node.js** e **Express**, a MutStoreAPI é uma aplicação escalável e robusta, hospedada na **Heroku**, o que garante alta disponibilidade, desempenho e segurança em operações de busca de aplicativos e gerenciamento de transações.

- **Pagamentos Eficientes via M-Pesa**: A API implementa um sistema seguro que permite aos usuários realizar transações de pagamento através do M-Pesa, proporcionando uma experiência de compra confiável e prática.

- **Gerenciamento Dinâmico de Aplicativos**: A MutStoreAPI permite que desenvolvedores integrem e gerenciem aplicativos facilmente, com funcionalidades para adicionar, editar e remover aplicativos conforme necessário, tudo hospedado na infraestrutura escalável da Google Cloud.

- **Sistema de Feedback e Avaliações**: Usuários podem enviar avaliações e comentários sobre os aplicativos, proporcionando feedback valioso que pode ser utilizado para melhorar a qualidade e a experiência do usuário.

- **Segurança Robusta**: A MutStoreAPI aplica práticas avançadas de segurança, incluindo criptografia de dados e proteções contra ataques comuns, garantindo que as informações dos usuários sejam mantidas seguras e confidenciais.

- **Análise e Monitoramento**: Integração com **Firebase Analytics** para monitorar o uso da API e coletar dados sobre o comportamento do usuário, permitindo melhorias contínuas com base em dados reais.



## Criadores

- [@Aderito Mufume](https://github.com/Aderito-Muffins)
- [@Uwami Tembe](https://github.com/Uwami-Tembe)
- [@Tarcilio Hele](https://github.com/Tarcilio120)
## Instalação

1. **Clone este repositório**:
   ```bash
   git clone <URL-do-repositorio>
   cd <nome-do-repositorio>
   ```

2. **Instale as Dependências**:
   Certifique-se de ter o [Node.js](https://nodejs.org/) instalado. Depois, execute o seguinte comando para instalar as dependências do projeto:
   ```bash
   npm install
   ```

3. **Configuração do Ambiente**:
   - Crie um arquivo `.env` na raiz do projeto e configure as variáveis de ambiente necessárias, como credenciais de banco de dados e chaves de API.

4. **Execute o Projeto**:
   Após instalar as dependências e configurar o ambiente, inicie o servidor com o seguinte comando:
   ```bash
   npm start
   ```

5. **Acesse a API**:
   Abra seu navegador ou um cliente de API (como Postman) e acesse a API no seguinte endpoint:
   ```
   http://localhost:3000/mutStore/v1/
   ```

## Variáveis de Ambiente

Para executar este projeto, você precisará adicionar as seguintes variáveis de ambiente ao seu arquivo `.env`. Aqui está como obter cada uma delas:

```plaintext
API_URL=mutStore/v1
DATABASE=<sua_string_de_conexão>
API_NAME=MutStoreApi
PORT=3000
TWILIO_SID=<seu_Twilio_SID>
TWILIO_AUTH_TOKEN=<seu_Twilio_Auth_Token>
TWILIO_PHONE_NUMBER=<seu_número_Twilio>
JWT_SECRET=<sua_senha_secreta>
FIREBASE_CREDENTIALS='{
  "type": "service_account",
  "project_id": "<seu_project_id>",
  "private_key_id": "<seu_private_key_id>",
  "private_key": "<sua_private_key>",
  "client_email": "<seu_email_cliente>",
  "client_id": "<seu_client_id>",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ryi3y%40mutstoremz.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}'
```

### Instruções para Obtenção

1. **String de Conexão do MongoDB**:
   - Crie uma conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Crie um novo cluster e obtenha a string de conexão fornecida na seção "Connect" do seu cluster.
   - Substitua as credenciais na string conforme necessário.

2. **Twilio**:
   - Crie uma conta no [Twilio](https://www.twilio.com/).
   - Após a criação da conta, você encontrará seu **Account SID** e **Auth Token** no painel.
   - Adicione um número de telefone em sua conta Twilio e utilize-o na variável `TWILIO_PHONE_NUMBER`.

3. **JWT Secret**:
   - O `JWT_SECRET` pode ser qualquer string que você escolher para assinar seus tokens JWT. Certifique-se de que seja uma string longa e complexa.

4. **Credenciais do Firebase**:
   - Acesse o [Firebase Console](https://console.firebase.google.com/).
   - Crie um novo projeto ou selecione um existente.
   - Vá para "Configurações do Projeto" > "Contas de Serviço" e clique em "Gerar Nova Chave Privada". Isso baixará um arquivo JSON com suas credenciais.
   - Abra o arquivo JSON e copie o conteúdo entre as chaves `{}` e coloque na variável `FIREBASE_CREDENTIALS`.

### Exemplo de `.env`

```plaintext
API_URL=mutStore/v1
DATABASE=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
API_NAME=MutStoreApi
PORT=3000
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
JWT_SECRET=your_secret_key
FIREBASE_CREDENTIALS='{
  "type": "service_account",
  ...
}'
```

**Nota**: Nunca compartilhe suas credenciais ou as coloque em repositórios públicos.


### Base URL
```
http://<seu_dominio>/mutStore/v1
```

### Autenticação
A API utiliza autenticação baseada em **JWT** (JSON Web Tokens). Para acessar endpoints protegidos, inclua um token de autenticação no cabeçalho `Authorization` como `Bearer <seu_token>`.

### Endpoints Principais

#### 1. **Criação de Conta**
- **URL**: `/users/register`
- **Método**: `POST`
- **Descrição**: Registra um novo usuário na plataforma.
- **Corpo da Requisição**:
    ```json
    {
      "name": "string",
      "username": "string",
      "email": "string",
      "password": "string"
      "mobileNumber": "string"
    }
    ```
- **Resposta**:
    - **201 OK ou error_code = 0**: Usuário registrado com sucesso.
    - **400 Bad Request ou error_code = 1**: Erro de validação.

#### 2. **Login de Usuário**
- **URL**: `/users/login`
- **Método**: `POST`
- **Descrição**: Faz login de um usuário existente.
- **Corpo da Requisição**:
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
- **Resposta**:
    - **200 OK ou error_code = 0**: Login bem-sucedido com o token JWT.
    - **401 Unauthorized ou error_code = 1**: Credenciais inválidas.

#### 3. **Buscar Aplicativos**
- **URL**: `/apps/summary`
- **Método**: `GET`
- **Descrição**: Retorna uma lista de aplicativos disponíveis.
- **Parâmetros**:
    - `category` (opcional): Filtra aplicativos por categoria.
    - `limit` (opcional): Limita o número de resultados retornados.
    - `page` (opcional): Número da página para paginar resultados.
- **Resposta**:
    - **200 OK**: Lista de aplicativos.
    - **404 Not Found**: Nenhum aplicativo encontrado.

#### 4. **Detalhes do Aplicativo**
- **URL**: `/apps/moreInfo/{appId}'`
- **Método**: `GET`
- **Descrição**: Retorna detalhes de um aplicativo específico.
- **Parâmetros**:
    - `appId`: ID do aplicativo.
- **Resposta**:
    - **200 OK**: Detalhes do aplicativo.
    - **404 Not Found**: Aplicativo não encontrado.

#### 6. **Realizar Pagamento**
- **URL**: `/apps/purchase/app`
- **Método**: `POST`
- **Descrição**: Realiza um pagamento para a compra de um aplicativo.
- **Corpo da Requisição**:
    ```json
    {
      "appId": "Number",
      "paymentOption": "M-Pesa",
      "msisdn": 86123456
    }
    ```
- **Resposta**:
    - **201 Created**: Pagamento realizado com sucesso.
    - **400 Bad Request**: Erro no pagamento.


**e mais...**


### Conclusão
A MutStore API oferece uma ampla gama de funcionalidades para gerenciar aplicativos e interações de usuários. Utilize os endpoints acima para integrar sua aplicação com a plataforma.

--- 

Sinta-se à vontade para personalizar e adicionar mais detalhes conforme necessário!
## Links Relacionados

Confira o projeto MutStore no repositório abaixo:

- [MutStore- GitHub](https://github.com/Uwami-Tembe/Trabalho-Semestral-MUT-Store)

