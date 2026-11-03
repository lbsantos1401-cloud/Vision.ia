LOCALIZADOR GPS — PROTÓTIPO V1

COMO TESTAR
1. Extraia o ZIP.
2. Publique os arquivos em um serviço HTTPS, como GitHub Pages, ou use um servidor local.
3. Abra index.html pelo endereço publicado.
4. Crie uma conta demonstrativa e entre no painel.
5. Gere um link de convite e teste a tela do transmissor abrindo o link.

IMPORTANTE — LIMITAÇÕES DESTA V1
- A conta e os dispositivos são apenas demonstrações locais no navegador.
- A senha é comparada por hash local, mas isso NÃO é autenticação segura: use somente credenciais fictícias.
- Os convites não são compartilhados com outro aparelho porque ainda não existe servidor/banco de dados.
- A tela do transmissor pode solicitar permissão e verificar a localização, mas não envia nem armazena coordenadas.
- O mapa, a autenticação real, o vínculo entre aparelhos e a atualização em tempo real serão implementados nas próximas versões.
- A localização só deve ser compartilhada com conhecimento e autorização da pessoa que utiliza o aparelho.

ARQUIVOS
index.html          Estrutura das telas
style.css           Visual responsivo
app.js              Interações do protótipo
manifest.webmanifest Configuração PWA
sw.js               Cache básico offline
icon.svg            Ícone do aplicativo
