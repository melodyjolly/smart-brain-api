const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'Brandonamius1',
      database : 'smartbrain'
    }
  });


const app = express();


app.use(bodyParser.json());
app.use(cors())
const database = {
    users: [
        {
            id: '123',
            name: 'John',
            password: 'cookies',
            email: 'john@gmail.com',
            entries: 0,
            joined: new Date()
    
        },
        {
            id: '124',
           name: 'Sally',
           password: 'bananas',
           email: 'sally@gmail.com',
           entries: 0,
           joined: new Date()
   
       }
    ],
    login: [
        {
            id: '987',
            has: '',
            email: 'john@gmail.com'
        }
    ]
}

app.get('/', (req, res) => {
    res.send(database.users);
})

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
          const isValid = bcrypt.compareSync(req.body.password,data[0].hash);
          if(isValid) {
             return db.select('*').from('users')
              .where('email', '=', req.body.email)
              .then(user => {
                  res.json(user[0])
              })
              .catch(err => res.status(400).json('unable to get user'))
          } else {
          res.status(400).json('wrong credentials')
          }
        })
        .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req,res) => {
    const { email, name, password } = req.body;
    const hash = bcrypt.hashSync(password);
   db.transaction(trx =>{
       trx.insert({
           hash: hash,
           email: email,
       })
       .into('login')
       .returning('email')
       .then(loginEmail  => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0],
                name: name,
                joined: new Date()
            })
            .then(user => {
                res.json(user[0]);
            })
       })
       .then(trx.commit)
       .catch(trx.rollback)
   })
   
    .catch(err => res.status(400).json(err))
})

app.get('/profile/:id', (req, res) => {
    const{ id } = req.params;
    let found = false;
    db.select('*').from('users').where({id})
        .then(user => {
            if(user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('Not found')
           }
    })
    .catch(err => res.status(400).json('error getting user'))
})

app.put('/image', (req, res) => {  
    const{ id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
        .catch(err => res.status(400).json('unable to get entries')) 
})


/*const DATABASE_URL = process.env.DATABASE_URL
app.listen(3001, () => {
    console.log(`Server is listening on port ${DATABASE_URL}`)
});
console.log(3001) */

app.listen(3001,()=> {
console.log('app is running on port 3001');
})