# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Operadores: alunos do SENAI Naviraí, no próprio celular, durante o evento Mundo SENAI. Atendem um visitante por vez.
- Visitantes: empresários e pessoas com perfil comercial no Instagram (comércio e indústria). Assistem ao lado do aluno e veem o resultado na tela dele.

## Product Purpose

Gerar, em cerca de um minuto, um diagnóstico comercial do perfil do Instagram de uma empresa: o que está bom, o que está travando e o que fazer primeiro. Sucesso = o empresário entende na hora 2 ou 3 mudanças concretas para o perfil dele.

## Positioning

Não é uma ferramenta de métricas de seguidores. É um diagnóstico comercial (12 pilares, gargalos, plano 7/30/90 dias) feito por IA a partir de uma foto da tela inicial do perfil, conduzido ao vivo por alunos.

## Operating Context

- Estande de evento, barulho, pouco tempo por visitante, alunos com celulares variados.
- Entrada principal: fotografar a tela inicial do perfil do visitante (câmera) ou enviar prints. Digitar o @ é secundário: a consulta automática costuma ser bloqueada pelo Instagram.
- O resultado é mostrado na tela do celular do aluno; o visitante não leva arquivo nem link.
- Rede do local pode ser instável; plano B é hotspot do celular.

## Capabilities and Constraints

- Site estático (public/index.html, HTML/CSS/JS sem framework) + funções serverless no Vercel (api/analyze.js, api/instagram-lookup.js).
- IA: OpenAI (gpt-4o com imagens, gpt-4o-mini só texto). Análise com foto leva ~10–40 s.
- Relatório segue o prompt mestre do cliente: resumo executivo, 12 pilares (status bom / oportunidade / investigar + nota), gargalos, plano de ação imediato/curto/médio, indicadores, informações necessárias, conclusão. Esse conteúdo não muda.
- Contexto do negócio (empresa, segmento, região, público, objetivo, ticket, canal, dificuldade) é opcional.
- Preenchimento manual existe como último recurso.

## Brand Commitments

- Marca própria: "InstaScan", projeto dos alunos do SENAI Naviraí. Cita o SENAI, mas não usa a identidade visual do SENAI.
- Idioma: português do Brasil.

## Evidence on Hand

- Perfil real usado em testes: @senainaviraims (171 posts, 1.695 seguidores, 331 seguindo).
- Não há depoimentos, clientes, números de uso ou notas reais de diagnóstico: não inventar.

## Product Principles

1. A câmera é o caminho principal; tudo o que atrasa a foto sai do caminho.
2. O resultado precisa ser entendido em segundos por quem está olhando de lado a tela do aluno.
3. Falha vira instrução: quando algo não funciona, a tela diz o que fazer em seguida.
4. Nada de números ou elogios inventados; o relatório só mostra o que a IA leu e concluiu.

## Accessibility & Inclusion

Uso em celular com uma mão, em ambiente claro e barulhento: alvos de toque grandes, alto contraste, texto legível a meio braço de distância.
