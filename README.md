# Linha de Código: Blog Pessoal Full Stack

Blog sobre programação (tutoriais, dicas e notas de estudo).

- **Front-end:** HTML, CSS e JavaScript puro (servido pelo próprio Spring Boot)
- **Back-end:** Java 17 + Spring Boot 3 (API REST, validação, tratamento de erros)
- **Banco de dados:** Supabase (PostgreSQL) via Spring Data JPA

## Funcionalidades

- Página inicial com listagem em cards, **pesquisa** (título, resumo e conteúdo), **filtro por categoria** e **paginação**
- Página do artigo completo (`post.html?id=...`)
- Área do autor (`admin.html`) com **formulário de criação**, edição e exclusão, protegida por token
- Validação no front-end e no back-end (mensagens por campo) e tratamento de erros (400, 401, 404, 503, 500)
- Layout responsivo

## API REST

| Método | Rota | Descrição | Token |
|---|---|---|---|
| GET | `/api/posts?search=&category=&page=0&size=9` | Lista paginada (mais recentes primeiro) | não |
| GET | `/api/posts/{id}` | Artigo completo | não |
| GET | `/api/categories` | Categorias existentes | não |
| POST | `/api/posts` | Cria artigo | sim |
| PUT | `/api/posts/{id}` | Atualiza artigo | sim |
| DELETE | `/api/posts/{id}` | Remove artigo | sim |

O token vai no cabeçalho `X-Admin-Token`.

## Como rodar

1. **Supabase:** crie um projeto, abra *SQL Editor* e execute `db/schema.sql` (cria a tabela `posts` e 3 artigos de exemplo).
2. Em *Project Settings > Database > Connection string*, copie os dados de conexão (use a opção **Session pooler**, porta 5432).
3. Defina as variáveis de ambiente (modelo em `.env.example`):
   - `SUPABASE_DB_URL` (formato `jdbc:postgresql://HOST:5432/postgres?sslmode=require`)
   - `SUPABASE_DB_USER` (no pooler: `postgres.SEU_PROJECT_REF`)
   - `SUPABASE_DB_PASSWORD`
   - `ADMIN_TOKEN` (senha do autor, escolha uma sua)
4. Execute:
   ```bash
   mvn spring-boot:run
   ```
5. Abra http://localhost:8080

## Estrutura

```
src/main/java/com/blogpessoal
  controller/  PostController
  service/     PostService (pesquisa, filtros, regras)
  repository/  PostRepository
  model/       Post (entidade)
  dto/         PostRequest (validação), PostResponse, PostSummaryResponse, PageResponse
  config/      AdminTokenInterceptor, WebConfig
  exception/   GlobalExceptionHandler e exceções
src/main/resources/static   index.html, post.html, admin.html, css/, js/
db/schema.sql               script do Supabase
```
