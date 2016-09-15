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
  { id: 0, host: 'localhost', port: 5432, database: 'todos', username: 'postgres', password: '', table: 'derp0' },
  { id: 1, host: 'xxxxx.us-east-1.rds.amazonaws.com', port: 5432, database: 'xxxx', username: 'xxxx', password: 'xxxx', table: 'derp1' },
  { id: 2, host: 'xxxxx.us-east-1.rds.amazonaws.com 2', port: 5432, database: 'xxxx2', username: 'xxxx2', password: 'xxxx2', table: 'derp2' }
];

const databaseTables = [
  [{ id: 0, name: 'table 0', databaseConnectionId: 0 }, { id: 3, name: 'table 0-3', databaseConnectionId: 0 }],
  [{ id: 1, name: 'table 1', databaseConnectionId: 1 }, { id: 4, name: 'table 0-4', databaseConnectionId: 1 }],
  [{ id: 2, name: 'table 2', databaseConnectionId: 2 }, { id: 5, name: 'table 0-5', databaseConnectionId: 2 }]
];

const databaseTableColumns = [
  [{ databaseTableId: 0, name: 'column 0', type: 'type 0' }, { databaseTableId: 0, name: 'column 1', type: 'type 3' }],
  [{ databaseTableId: 1, name: 'column 1', type: 'type 1' }, { databaseTableId: 1, name: 'column 1', type: 'type 4' }],
  [{ databaseTableId: 2, name: 'column 1', type: 'type 2' }, { databaseTableId: 2, name: 'column 1', type: 'type 5' }],
  [{ databaseTableId: 0, name: 'column 0', type: 'type 0' }, { databaseTableId: 0, name: 'column 1', type: 'type 3' }],
  [{ databaseTableId: 1, name: 'column 1', type: 'type 1' }, { databaseTableId: 1, name: 'column 1', type: 'type 4' }],
  [{ databaseTableId: 2, name: 'column 1', type: 'type 2' }, { databaseTableId: 2, name: 'column 1', type: 'type 5' }]
]

const ColumnType = new GraphQLObjectType({
  name: 'ColumnType',
  fields: {
    id: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    },
    type: {
      type: GraphQLString
    }
  }
});

const TableType = new GraphQLObjectType({
  name: 'TableType',
  fields: {
    id: {
      type: GraphQLInt
    },
    name: {
      type: GraphQLString
    },
    columns: {
      type: new GraphQLList(ColumnType),
      resolve: (table) => new Promise(resolve => resolve(databaseTableColumns[table.id]))
    }
  }
});

const DatabaseConnectionType = new GraphQLObjectType({
  name: 'DatabaseConnectionType',
  fields: {
    id: {
      type: GraphQLInt
    },
    host: {
      type: GraphQLString
    },
    port: {
      type: GraphQLInt
    },
    database: {
      type: GraphQLString
    },
    username: {
      type: GraphQLString
    },
    password: {
      type: GraphQLString
    },
    tables: {
      type: new GraphQLList(TableType),
      resolve: (databaseConnection) => new Promise(resolve => resolve(databaseTables[databaseConnection.id]))
    }
  }
});

const RootType = new GraphQLObjectType({
  name: 'RootType',
  fields: {
    DatabaseConnections: {
      type: new GraphQLList(DatabaseConnectionType),
      resolve() {
        return [
          {id: 1, name: `Project 1`},
          {id: 2, name: `Project 2`}
        ];
      }
    },
    DatabaseConnection: {
      type: DatabaseConnectionType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: (parent, {id}) => new Promise(resolve => resolve(databaseConnections[id]))
    }
  }
});

const schema = new GraphQLSchema({
  query: RootType
});

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true
}));

app.listen(4000);
console.log("http://localhost:4000/graphql");
