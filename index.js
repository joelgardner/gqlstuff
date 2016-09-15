const tlc = require('graphql-tlc');
const graphql = require('graphql'),
      GraphQLSchema = graphql.GraphQLSchema,
      GraphQLObjectType = graphql.GraphQLObjectType,
      GraphQLString = graphql.GraphQLString,
      GraphQLInt = graphql.GraphQLInt,
      GraphQLList = graphql.GraphQLList,
      GraphQLID = graphql.GraphQLID,
      GraphQLNonNull = graphql.GraphQLNonNull;
const express = require('express');
const graphqlHTTP = require('express-graphql');
const app = express();

const databaseConnections = [
  { id: 0, host: 'localhost', port: 5432, database: 'todos', username: 'postgres', password: '', table: 'derp1' },
  { id: 1, host: 'xxxxx.us-east-1.rds.amazonaws.com', port: 5432, database: 'xxxx', username: 'xxxx', password: 'xxxx', table: 'derp2' }
];

const databaseTables = [
  { id: 0, name: 'table 0', databaseConnectionId: 0 },
  { id: 1, name: 'table 1', databaseConnectionId: 1 }
];

const databaseTableColumns = [
  { databaseTableId: 0, name: 'column 0', type: 'type 0' },
  { databaseTableId: 1, name: 'column 1', type: 'type 1' }
]

/* BEGIN TLC */
/**
type DatabaseConnection { id: ID! connectionString : String }
**/
// const resolver = {
//   query: (typename, predicate) => {
//     return (
//       predicate === 'all()'
//         ? databaseConnections
//         : databaseConnections[predicate.split('=')[1]]
//     )
//   },
//   /**
//   mutation m {
//     createDatabaseConnection (connectionString: "my new connection string")
//     { id connectionString }
//   }
//   **/
//   create: (typename, inputs) => {
//     inputs.id = databaseConnections.length;
//     inputs.connectionString += " " + inputs.id
//     databaseConnections.push(inputs)
//     return inputs
//   }
// }
//
// const schema = tlc.getSchema(resolver, './schema.gql');
/* END TLC */



/* BEGIN HAND-ROLLED */
/**
  Representation of a database connection
**/
const DatabaseConnectionType = new graphql.GraphQLObjectType({
  name: 'DatabaseConnection',
  description: '...',
  fields: () => ({
    id: {
      type: graphql.GraphQLString,
      resolve: (dbConnection) => dbConnection.id
    },
    host: {
      type: graphql.GraphQLString,
      resolve: (dbConnection) => dbConnection.host
    },
    port: {
      type: graphql.GraphQLInt,
      resolve: (dbConnection) => dbConnection.port
    },
    database: {
      type: graphql.GraphQLString,
      resolve: (dbConnection) => dbConnection.database
    },
    username: {
      type: graphql.GraphQLString,
      resolve: (dbConnection) => dbConnection.username
    },
    password: {
      type: graphql.GraphQLString,
      resolve: (dbConnection) => dbConnection.password
    },
    table: {
      type: DatabaseTableType,
      resolve: (table) => {
        return {
          id: "fake table",
          columns: [{ name: "fake column 1", type: "int" }, { name: "fake column 2", type: "string" }]
        }
      }
    }
  })
})

/**
Representation of a database table
**/
const DatabaseTableType = new graphql.GraphQLObjectType({
  name: 'DatabaseTable',
  description: '...',
  fields: () => ({
    id: {
      type: graphql.GraphQLString,
      resolve: (dbConnection) => dbConnection.id
    },
    name: {
      type: graphql.GraphQLString,
      resolve: (table) => table.name
    },
    columns: {
      type: graphql.GraphQLString,
      resolve: (dbConnection) => databaseTables[dbConnection.id]
    }
  })
})

/**
Representation of a column
**/
// const DatabaseTableColumnType = new graphql.GraphQLObjectType({
//   name: 'DatabaseTableColumn',
//   description: '...',
//   fields: () => ({
//     id: {
//       type: graphql.GraphQLString,
//       resolve: (dbConnection) => dbConnection.id
//     },
//     type: {
//       type: graphql.GraphQLString,
//       resolve: (table) => databaseTables[dbConnection.id]
//     }
//   })
// })


const RootType = new graphql.GraphQLObjectType({
  name: 'Query',
  description: '...',
  fields: {
    /**
    {
      DatabaseConnection(id: "1") { id }
    }
    **/
    DatabaseConnection: {
      type: DatabaseConnectionType,
      args: {
        id: {
          type: graphql.GraphQLString
        }
      },
      resolve: (root, args) => {
        console.log("in resolve for DatabaseConnection: ", args);
        return new Promise((resolve, reject) => resolve(databaseConnections[args.id]))
      }
    },
    /**
    {
      databaseConnections {
        id
        connectionString
      }
    }
    **/
    DatabaseConnections: {
      type: new graphql.GraphQLList(DatabaseConnectionType),
      args: {
        host: {
          type: graphql.GraphQLString
        }/*,
        userId: {
          type: graphql.GraphQLString
        }
        */
      },
      resolve: (root, args) => {
        console.log(args)
        return new Promise((resolve, reject) => resolve(databaseConnections.filter(dbc => {
          return Object.keys(args).every(k => dbc[k] === args[k])
        })))
      }
    }
  }
});

const schema = new graphql.GraphQLSchema({
  query: RootType
});
/* END HAND-ROLLED */

console.log(JSON.stringify(schema._queryType._fields.DatabaseConnection.args, null, " "))

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true
}));

app.listen(4000);
console.log("http://localhost:4000/graphql");
