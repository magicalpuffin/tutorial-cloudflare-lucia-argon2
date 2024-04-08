# Tutorial Cloudflare Lucia Argon2

Example of using Lucia Auth in Cloudflare with an Argon2 Rust Worker.

The Argon2 worker is from:
- https://github.com/glotlabs/argon2-cloudflare


## How to run

Before running, make sure you have Rust and Cloudflare setup.

### Running the argon2 worker

```
cd tutorial-sveltekit/
npm i
```

In local dev

```
npm run dev
```

Test the worker locally
```
curl -X POST http://127.0.0.1:8787/hash -H "Content-Type: application/json" -d '{"password": "helloworld"}'
```

Deploy the worker

```
npm run deploy
```


### Running the svelte site

```
cd tutorial-sveltekit/
npm i
```

Create the database. Update `wrangler.toml` with `database_id`

```
npx wrangler d1 create tutorial-d1-argon2
```

Apply migrations to local and production

```
npx wrangler d1 migrations apply tutorial-d1-argon2
npx wrangler d1 migrations apply tutorial-d1-argon2 --remote
```

In local dev. Ensure the worker dev server is already running for service bindings to work.

```
npm run dev
```


Deploy the page. Ensure the worker is already deployed

```
npm run deploy
```