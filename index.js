const express = require('express')
const express_graphql = require('express-graphql')
const { buildSchema } = require('graphql')
const { MongoClient } = require('mongodb')

// https://www.digitalocean.com/community/tutorials/how-to-build-and-deploy-a-graphql-server-with-node-js-and-mongodb-on-ubuntu-18-04#step-3-%E2%80%94-connecting-to-the-mongodb-database

const context = () => MongoClient.connect('mongodb://mongo:27017/', { useNewUrlParser: true })
  .then(client => client.db('database'));

// GraphQL schema
const schema = buildSchema(`
  type Query {
    bios: [Bio]
    bio(id: Int): Bio
  }
  type Mutation {
    addBio(input: BioInput) : Bio
  }
  input BioInput {
    name: NameInput
    title: String
    birth: String
    death: String
  }
  input NameInput {
    first: String
    last: String
  }
  type Bio {
    name: Name,
    title: String,
    birth: String,
    death: String,
    awards: [Award]
  }
  type Name {
    first: String,
    last: String
  },
  type Award {
    award: String,
    year: Float,
    by: String
  }
`)

const getBio = (args, context) => context().then(db => db.collection('bios').findOne({ _id: args.id }).toArray())

const getBios = (args, context) => context().then(db => db.collection('bios').find().toArray())

const addBio = (args, context) => context()
  .then(db => db.collection('bios').insertOne({ name: args.input.name, title: args.input.title, death: args.input.death, birth: args.input.birth}))
  .then(response => response.ops[0])

// Root resolver
const root = {
  bio: getBio,
  bios: getBios,
  addBio: addBio
}

const app = express()

app.use('/graphql', express_graphql({
  schema: schema,
  rootValue: root,
  context,
  graphiql: true // ui-client
}))

app.listen(3000, () => console.log('Express GraphQL Server Now Running On localhost:3000/graphql'))
