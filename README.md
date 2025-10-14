# FREE ZAP

Disparador de mensagens em massa para WhatsApp desenvolvido em Node.js.

---

### **Sumário**

* [Sobre o FREE ZAP](#sobre-o-free-zap)
* [Requisitos](#requisitos)
* [Instalação e Uso](#instalação-e-uso)
* [Configuração de Mensagens e Contatos](#configuração-de-mensagens-e-contatos)
* [Valores Dinâmicos](#valores-dinâmicos)
* [Estrutura de Diretórios](#estrutura-de-diretórios)
* [Autor](#autor)

---

### **Sobre o FREE ZAP**

O FREE ZAP é uma ferramenta simples e eficiente para automatizar o envio de mensagens no WhatsApp. Utiliza um sistema de **loop contínuo** para verificar e processar novas listas de contatos e mensagens, substituindo automaticamente valores dinâmicos.

### **Requisitos**

* **Node.js:** Versão `v16.16.0` ou superior.
* **Pacotes:** `fs` (nativo) e `@wppconnect-team/wppconnect`.

### **Instalação e Uso**

1.  **Clone o Repositório** (ou baixe os arquivos).
2.  **Instale as dependências** (caso não use um pacote de dependências pronto):

    ```bash
    npm install @wppconnect-team/wppconnect
    ```

3.  **Inicie o programa:**
    * Abra o terminal na pasta raiz do projeto.
    * Execute o comando para rodar o arquivo principal (`main.js`):

    ```bash
    node ./main.js
    ```

    O programa iniciará o **loop** de verificação de arquivos.

### **Configuração de Mensagens e Contatos**

Para disparar as mensagens, você precisa configurar os arquivos nas pastas `\disparar\pendente\`.

| Arquivo | Localização | Descrição |
| :--- | :--- | :--- |
| **Mensagem** | `\disparar\pendente\mensagem.txt` | O texto da mensagem a ser enviada. |
| **Contatos** | `\disparar\pendente\numeros\telefones.txt` | Lista de números de telefone e dados dinâmicos. |

### **Valores Dinâmicos**

O programa permite o uso de até **10 variáveis** que serão substituídas na mensagem, tornando-a personalizada para cada destinatário.

As variáveis são representadas por `@val1` a `@val10`.

#### **1. Criando a Mensagem (`mensagem.txt`)**

Use as variáveis dentro da sua mensagem:

```text
Olá @val1, tudo bem?
Meu nome é @val2, falo aqui da @val3.
Podemos finalizar o atendimento?