const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usersAlreadyExists = users.some(
    (users) => users.username === username
  );

  if (usersAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const task = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(task)

  return response.status(201).json(task); 

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body

  const foundTodo = user.todos.find((user) => {
    if (id === user.id) {
      return true;
    }
  })

  if (!foundTodo) {
    return response.status(404).json({ error: "Todo not exists!" })
  }

  foundTodo.title = title;
  foundTodo.deadline = new Date(deadline);
  

  return response.status(201).json(foundTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const foundTodo = user.todos.find((user) => {
    if (id === user.id) {
      return true;
    }
  });


  if (!foundTodo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  foundTodo.done = true

  return response.status(201).json(foundTodo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const foundTodo = user.todos.find((user) => {
    if (id === user.id) {
      return true;
    }
  }) 

  if (!foundTodo) {
    return response.status(404).json({ error: "Todo not found!" })
  }

  user.todos.splice(foundTodo, 1);

  return response.status(204).send();

});

module.exports = app;