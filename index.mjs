import * as dotenv from 'dotenv';
import * as couchdb from './couchdb.mjs';
import axios from 'axios';
import express from 'express';
import cors from 'cors';
import {graphqlHTTP} from 'express-graphql';
import {makeExecutableSchema} from '@graphql-tools/schema';

dotenv.config();

const app = express();

const apiUrl = 'https://pokeapi.co/api/v2/pokemon';

const typeDefs = `
input pagination_input {
  page: Int
  size: Int
}

input item_search {
  pokemon: String
}

type poke_list {
  name: String!
}

type pokemon_type {
  name: String!
  priority: Int!
}

type pokemon {
  id: ID!
  name: String!
  types: [pokemon_type]
  height: Int!
  weight: Int!
  images: [String]
}

type item {
  id: ID!
  name: String!
  pokemon: String
  categories: [String!]
}

type Query {
  poke_list(pagination: pagination_input): [poke_list]
  pokemon(name: String!): pokemon
  items(search: item_search, pagination: pagination_input): [item]
}

type Mutation {
  createItem(name: String!, pokemon: String, categories: [String]): item
  updateItem(id: ID, name: String!, pokemon: String, categories: [String]): item
  deleteItem(id: ID): item
}
`

const pagination = (args) => {
    const pagination = args.pagination ?? {};

    return {
        page: pagination.page ?? 0,
        size: pagination.size ?? 25
    };
};

const resolvers = {
    Query: {
        poke_list: async (obj, args, context) => {
            const pag = pagination(args);
            const pokemon = await axios.get(apiUrl, {params: {offset: pag.page, limit: pag.size}});

            return pokemon.data.results;
        },
        pokemon: async (obj, args, context) => {
            const pokemon = await axios.get(`${apiUrl}/${args.name}`);

            return {
                id: pokemon.data.id,
                name: pokemon.data.name,
                types: pokemon.data.types.map((type) => {return {name: type.type.name, priority: type.slot}}),
                height: pokemon.data.height,
                weight: pokemon.data.weight,
                images: [pokemon.data.sprites.back_default, pokemon.data.sprites.front_default, pokemon.data.sprites.other.dream_world.front_default]
            };
        },

        items: async (obj, args, context) => {
            const pokemon = args.search?.pokemon ?? null;
            const pagination = args.pagination || couchdb.pagination();

            return await couchdb.find('items', {selector: {pokemon: {'$eq': pokemon}}}, pagination);
        },
    },
    Mutation: {
        createItem: async(obj, args, context) => {
            const item = await couchdb.create('items', args);

            return item;
        },
        updateItem: async(obj, args, context) => {
            const item = await couchdb.update('items', args.id, args);

            return item;
        },
        deleteItem: async(obj, args, context) => {
            const item = await couchdb.remove('items', args.id);

            return item;
        }
    }
};

const executableSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Entrypoint
app.use(
    '/graphql',
    graphqlHTTP({
        schema: executableSchema,
        context: null,
        graphiql: true,
    })
);

app.listen(process.env.PORT, () => {
    console.log(`Running at http://127.0.0.1:${process.env.PORT}`)
});