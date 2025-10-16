# FREE ZAP

Disparador de mensagens em massa para WhatsApp.

---

**Autor:** Jean C. P. Rodrigues
**Contato:** jeantng2016@gmail.com
**Tecnologias:** Node.js v16.16.0, fs, @wppconnect-team/wppconnect

---

## Como usar o programa

### Iniciando o programa

1.  Abra o terminal.
2.  Navegue até a pasta onde o arquivo `main.js` está localizado.
3.  Execute o seguinte comando:

    ```bash
    node ./main.js
    ```

### Configurando as mensagens e contatos

O programa funciona em **loop contínuo**. Para disparar as mensagens, você precisa configurar dois arquivos:

1.  **Mensagem:** Crie ou edite o arquivo `mensagem.txt` na pasta `\disparar\pendente\`. Escreva aqui o texto que será enviado.
2.  **Contatos:** Crie um arquivo de texto com o nome `telefones.txt` na pasta `\disparar\pendente\numeros\`. Neste arquivo, você listará os números de telefone e os dados para preencher a mensagem.

### Usando valores dinâmicos

Você pode usar até **10 valores dinâmicos** na sua mensagem, representados por `@val1` a `@val10`. O programa substituirá esses valores com os dados que você fornecer no arquivo de contatos.

#### Exemplo de mensagem em `mensagem.txt`:

```text
Olá @val1, tudo bem?
Meu nome é @val2, falo aqui da @val3.
Podemos finalizar o atendimento?
Exemplo de contatos em telefones.txt:
Cada linha corresponde a um contato e suas informações. Separe os valores por vírgula, seguindo a ordem da mensagem (número, @val1, @val2, @val3, etc.).

Formato: número,val1,val2,val3...

Plaintext

5531313131,NomeCliente1,MeuNome1,MinhaEmpresa1
5531313131,NomeCliente2,MeuNome2,MinhaEmpresa2
5531313131,NomeCliente3,MeuNome3,MinhaEmpresa3
Funcionamento do programa
Após enviar as mensagens, o programa move automaticamente o arquivo telefones.txt da pasta \disparar\pendente\numeros\ para a pasta \disparar\enviado\. Isso completa o ciclo de envio.