# PRD — Página de Apresentação Interativa (Oculta) para Pitch

## Objetivo

Analise toda a arquitetura e o código atual do projeto antes de iniciar qualquer implementação. Quero aproveitar **100% dos componentes reais da aplicação**, evitando recriações de interface. A apresentação deve parecer que estou utilizando a plataforma ao vivo, mas conduzida automaticamente como uma apresentação de alto nível.

Crie uma nova pasta que funcione como uma página independente dentro do projeto, porém **não deve existir nenhum link, botão, rota visível, menu ou qualquer forma de acesso a essa página dentro da aplicação**. Ela servirá exclusivamente para apresentações presenciais.

---

# Conceito

Esta página será uma apresentação interativa em formato de slides.

Não quero slides tradicionais.

Quero que cada slide seja composto pelas **telas reais da aplicação renderizadas pelo próprio código existente**, preservando:

* componentes reais;
* animações existentes;
* estados;
* transições;
* estilos;
* responsividade;
* comportamento visual.

Ou seja, em vez de imagens da interface, quero a própria interface funcionando.

---

# Navegação

A apresentação deve ser extremamente simples.

Apenas estes controles devem existir:

* seta direita → próximo slide;
* seta esquerda → slide anterior;
* clique na metade direita da tela → próximo;
* clique na metade esquerda → anterior.

Não deve existir:

* menus;
* barra de navegação;
* indicadores;
* botões;
* controles extras;
* scroll manual.

Toda a navegação acontece somente pelos slides.

---

# Fundo

Todos os slides devem compartilhar exatamente o mesmo fundo.

Escolha uma cor da identidade visual do projeto que seja elegante e discreta.

O fundo deve:

* valorizar as telas;
* gerar contraste;
* nunca competir visualmente com o conteúdo.

Nada de gradientes exagerados.

Nada chamativo.

---

# Filosofia visual

Cada slide deve parecer uma keynote da Apple.

Muito espaço.

Pouco texto.

Grande impacto visual.

Os textos servem apenas para reforçar o que a interface já demonstra.

Jamais transformar a apresentação em um PowerPoint.

A interface deve ser a protagonista.

---

# Slide 1

Tela inicial.

Logo centralizada.

Sem outros elementos.

Apenas:

* logo
* nome PROVE
* slogan (se desejar)

Com uma pequena animação elegante de entrada.

---

# Slides seguintes

Analise todo o projeto e escolha a melhor sequência para apresentar em aproximadamente 3 minutos.

Baseie-se tanto no pitch quanto nas funcionalidades implementadas.

Caso existam funcionalidades interessantes que não estejam descritas no pitch, inclua-as.

Prefiro mostrar diferenciais reais do produto do que repetir exatamente o roteiro do pitch.

---

# Como apresentar cada funcionalidade

Cada funcionalidade deve utilizar sua própria tela real.

Exemplo:

Slide:

"Toda organização possui uma página pública transparente."

Ao invés de uma imagem:

Renderize a página pública real.

Faça pequenas animações mostrando naturalmente:

* informações;
* indicadores;
* timeline;
* documentos;
* métricas.

---

# Rolagem automática

Caso uma tela seja maior que a viewport:

Não corte.

Faça uma rolagem automática extremamente suave.

Velocidade baixa.

A rolagem deve parecer cinematográfica.

Nunca parecer um usuário rolando rapidamente.

---

# Zoom

Quando fizer sentido, utilize pequenas animações de câmera:

* zoom suave;
* foco em cards;
* foco em indicadores;
* foco em gráficos;
* foco em timeline.

Sempre discretas.

---

# Textos

Quero pouquíssimo texto.

Exemplos:

"Transparência em tempo real"

"Prestação de contas verificável"

"Histórico completo"

"Indicadores atualizados"

"Confiança antes da doação"

Os textos devem aparecer com animações leves e desaparecer naturalmente.

---

# Ordem sugerida

A IA pode reorganizar a sequência se encontrar uma narrativa melhor.

Sugestão:

1. Logo
2. Problema
3. Página pública do projeto
4. Timeline das atualizações
5. Evidências e documentos
6. Indicadores do projeto
7. Área administrativa
8. Resumo automático
9. Dashboard de múltiplos projetos
10. Encerramento

---

# Diferenciais (importante)

Além do MVP, quero que a apresentação destaque os diferenciais do produto.

Caso essas funcionalidades ainda não estejam implementadas, crie slides conceituais utilizando elementos reais da interface.

Principalmente:

* confiança;
* transparência;
* rastreabilidade;
* histórico público;
* comprovação das entregas;
* evolução contínua do projeto.

A apresentação deve vender a visão do produto, não apenas listar funcionalidades.

---

# Qualidade das animações

As transições devem ser suaves.

Evite animações chamativas.

Prefira:

* fade;
* scale leve;
* slide muito sutil;
* blur discreto;
* zoom cinematográfico.

Toda a apresentação deve transmitir sofisticação.

---

# Performance

A página deve permanecer extremamente leve.

Reutilize componentes existentes.

Não duplique lógica.

Não copie telas.

Monte a apresentação utilizando o próprio código da aplicação.

---

# Arquitetura

Crie essa funcionalidade de forma isolada.

Toda a lógica da apresentação deve ficar concentrada em sua própria estrutura.

Não alterar comportamentos do restante do sistema.

Não introduzir dependências desnecessárias.

Código limpo, modular, reutilizável e de fácil manutenção.

---

# Resultado esperado

Ao abrir essa rota oculta, a sensação deve ser de assistir a uma keynote profissional.

As telas reais da plataforma contam a história do produto praticamente sozinhas.

As animações conduzem o olhar naturalmente.

Os textos apenas reforçam a mensagem.

A apresentação inteira deve convencer visualmente em aproximadamente 3 minutos, mantendo aparência premium, moderna e extremamente profissional.

Moldura das telas

As telas renderizadas não devem ocupar 100% da largura da apresentação, mas também não devem ficar pequenas.

Quero um equilíbrio semelhante ao de apresentações da Apple, Stripe ou Linear.

Cada tela deve ficar centralizada, ocupando aproximadamente 75% a 90% da área útil, dependendo do conteúdo.

Todas as telas devem possuir uma moldura elegante para destacá-las do fundo, contendo:

bordas com raio suave (16–24px);
borda muito sutil (1px) utilizando uma cor da identidade visual ou branco com baixa opacidade;
leve sombra (shadow) para criar profundidade;
espaçamento confortável entre a tela e as bordas da apresentação.

A moldura deve transmitir a sensação de um painel premium flutuando sobre o fundo.

Caso exista uma barra superior (browser frame) ou outro elemento que deixe a interface ainda mais elegante durante a apresentação, utilize-o de forma discreta e consistente em todos os slides.

Essa moldura deve ser padronizada durante toda a apresentação para criar unidade visual.

As animações (zoom, rolagem automática e transições) devem acontecer dentro dessa moldura, mantendo sempre as bordas visíveis e preservando a sensação de estar explorando uma aplicação real em um ambiente premium. Nunca permita que a interface encoste nas extremidades da tela da apresentação.