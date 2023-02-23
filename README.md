# GraphQL Example

## Requirements
- Docker
- Node.js v18+ (or use a Docker container with node inside)

## installation & start
Rename environment file
```
mv .env.example .env
```
Install dependencies, start CouchDB & node app
```
npm i
docker-compose up -d
npm run-script dev
```
You will need to create `_users` and `_replicator` for CouchDB.

### CouchDB admin UI

`http://127.0.0.1:5984/_utils`
```
User: admin
Password: secret
```

### GraphiQL UI 
`http://127.0.0.1:4242/graphql`

GraphQL development environment

## Contents 

### Queries
```graphql
{
  items(search: {pokemon: "charmander"}) {name pokemon}
}
```
```
{
  poke_list(pagination: {page:0 size: 15}) {name}
}
```

### Mutations
#### Insert
```graphql
mutation {
  createItem(name: "blue pill") {id name}
}
```

#### Update
```graphql
mutation {
  updateItem(id: 0, name: "red pill", pokemon: "charmander") {id name}
}
```

#### Delete
```graphql
mutation {
  deleteItem(id: 0) {id name}
}
```