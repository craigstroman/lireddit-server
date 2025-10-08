# LI Reddit - A Reddit clone using GraphQL and React

Based on https://www.youtube.com/watch?v=I6ypD7qv3Z8&t=13455s, but using React and Bootstrap for the front end.

## Live Demo

https://lireddit.craigstroman.com/

## Steps to run repo:

- git clone https://github.com/craigstroman/lireddit-server.git
- cd lireddit-server
- Run `npm install`
- Create database in PostgreSQL and set database password, add database user, set password in .env file
- Run the following `brew install redis` and then run `brew services start redis`
  - If you are on Ubuntu run `sudo apt update` then `sudo apt install redis-server` and then `sudo systemctl start redis-server` and `sudo systemctl enable redis-server`
- Run `npm run live:server` to start development environment
- Then go to http://localhost:9000/graphql
