const graphql = require('graphql');
const tlc = require('graphql-tlc');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const app = express();

const databaseConnections = [
  { id: 0, host: 'localhost', port: 5432, database: 'todos', username: 'postgres', password: '' },
  { id: 1, host: 'xxxxx.us-east-1.rds.amazonaws.com', port: 5432, database: 'xxxx', username: 'xxxx', password: 'xxxx' }
];


/* BEGIN TLC */
/**
type DatabaseConnection { id: ID! connectionString : String }
**/
const resolver = {
  query: (typename, predicate) => {
    return (
      predicate === 'all()'
        ? databaseConnections
        : databaseConnections[predicate.split('=')[1]]
    )
  },
  /**
  mutation m {
    createDatabaseConnection (connectionString: "my new connection string")
    { id connectionString }
  }
  **/
  create: (typename, inputs) => {
    inputs.id = databaseConnections.length;
    inputs.connectionString += " " + inputs.id
    databaseConnections.push(inputs)
    return inputs
  }
}

const schema = tlc.getSchema(resolver, './schema.gql');
/* END TLC */



/* BEGIN HAND-ROLLED */
// /**
//   Representation of a database connection
// **/
// const DatabaseConnectionType = new graphql.GraphQLObjectType({
//   name: 'DatabaseConnection',
//   description: '...',
//   fields: () => ({
//     id: {
//       type: graphql.GraphQLString,
//       resolve: (dbConnection) => dbConnection.id
//     },
//     host: {
//       type: graphql.GraphQLString,
//       resolve: (dbConnection) => dbConnection.host
//     },
//     port: {
//       type: graphql.GraphQLInt,
//       resolve: (dbConnection) => dbConnection.port
//     },
//     database: {
//       type: graphql.GraphQLString,
//       resolve: (dbConnection) => dbConnection.database
//     },
//     username: {
//       type: graphql.GraphQLString,
//       resolve: (dbConnection) => dbConnection.username
//     },
//     password: {
//       type: graphql.GraphQLString,
//       resolve: (dbConnection) => dbConnection.password
//     },
//     table: {
//       type: TableType,
//       resolve: (table) => {
//         return {
//           id: "fake table",
//           columns: [{ name: "fake column 1", type: "int" }, { name: "fake column 2", type: "string" }]
//         }
//       }
//     }
//   })
// })
//
// /**
// Representation of a database table
// **/
// const TableType = new graphql.GraphQLObjectType({
//   name: 'Table',
//   description: '...',
//   fields: () => ({
//     id: {
//       type: graphql.GraphQLString,
//       resolve: (dbConnection) => dbConnection.id
//     },
//     columns: {
//       type: graphql.GraphQLString,
//       resolve: (dbConnection) => dbConnection.host
//     }/*,
//     keys: {
//       type: ForeignKeyType, // maybe
//     }
//     */
//   })
// })
//
//
// const QueryType = new graphql.GraphQLObjectType({
//   name: 'Query',
//   description: '...',
//   fields: () => ({
//     /**
//     {
//       DatabaseConnection(id: "1") { id }
//     }
//     **/
//     DatabaseConnection: {
//       type: DatabaseConnectionType,
//       args: {
//         id: {
//           type: graphql.GraphQLString
//         }
//       },
//       resolve: (root, args) => {
//         console.log(args);
//         return new Promise((resolve, reject) => resolve(databaseConnections[args.id]))
//       }
//     },
//     /**
//     {
//       databaseConnections {
//         id
//         connectionString
//       }
//     }
//     **/
//     DatabaseConnections: {
//       type: new graphql.GraphQLList(DatabaseConnectionType),
//       args: {
//         host: {
//           type: graphql.GraphQLString
//         },
//         port: {
//           type: graphql.GraphQLInt
//         },
//         database: {
//           type: graphql.GraphQLString
//         },
//         username: {
//           type: graphql.GraphQLString
//         },
//         password: {
//           type: graphql.GraphQLString
//         }
//       },
//       resolve: (root, args) => {
//         console.log(args)
//         return new Promise((resolve, reject) => resolve(databaseConnections.filter(dbc => {
//           return Object.keys(args).every(k => dbc[k] === args[k])
//         })))
//       }
//     }
//   })
// });
//
// const schema = new graphql.GraphQLSchema({
//   query: QueryType
// });
/* END HAND-ROLLED */

console.log(JSON.stringify(schema._queryType._fields.DatabaseConnections.args, null, " "))

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true
}));

app.listen(4000);
console.log("http://localhost:4000/graphql");
