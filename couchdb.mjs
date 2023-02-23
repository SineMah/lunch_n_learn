`use strict`;

import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const dbUrl = `http://${process.env.COUCHDB_URL}:${process.env.COUCHDB_PORT}`;

export const count = async (db) => {
    const response = await axios.get(`${dbUrl}/${db}`, auth());

    return response.data.doc_count;
};

export const create = async (db, item) => {
    const id = await count(db);

    item.id = id;

    await axios.put(`${dbUrl}/${db}/${id}`, item, auth());

    return findByID(db, id);
};

export const update = async (db, id, item) => {
    const doc = await findByID(db, id);

    item.id = id;
    item._rev = doc._rev;

    await axios.put(`${dbUrl}/${db}/${id}`, item, auth());

    return findByID(db, id);
};

export const remove = async (db, id) => {
    const doc = await findByID(db, id);
    await axios.delete(`${dbUrl}/${db}/${id}?rev=${doc._rev}`, auth());

    return doc;
};

export const find = async (db, query, page=pagination()) => {
    const options = {
        ...page,
        ...query
    };
    const response = await axios.post(`${dbUrl}/${db}/_find`, options, auth());

    return response?.data?.docs ?? [];
};

export const findByID = async (db, id) => {
    const response = await axios.get(`${dbUrl}/${db}/${id}`, auth());

    return response.data;
};

export const pagination = (page=0, size=25) => {
    return {skip: page*size, limit: size};
};

const auth = () => {
    return {
        auth: {
            username: process.env.COUCHDB_USER,
            password: process.env.COUCHDB_PASSWORD
        }
    };
}