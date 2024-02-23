const mysql2 = require('mysql2');

const connection = mysql2.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

connection.connect(error => {
  if (error) {
    console.log('connection is failed!', error.message);
    return;
  }

  console.log('mysql server is ok ...');
});

// connection.end((error: any) => {
//   if (error) {
//     console.error('Error closing database connection:', error.message);
//     return;
//   }

//   console.log('Connection closed');
// });

module.exports = connection.promise();