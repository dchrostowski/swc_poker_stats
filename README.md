# Overview
This is a containerized mongodb, web scraper, and react app bundled together

# How to run
1. `docker-compose up`
2. go to http://localhost to see the react app

`docker exec -it nodejs /bin/sh`: react app container

`docker exec -it db mongodb`: get into the database

`docket exec -it nodejs2 /bin/bash`: check out the scraper

Still a work in progress.


