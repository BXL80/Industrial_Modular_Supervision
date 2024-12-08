# Industrial_Modular_Supervision

We are two students of UniLaSalle Amiens, a French engineering school.

This project arises from our 29-hour project about website deployment.

Our goal is to provide an open-source, modular, portable, and parametric supervision system for PLC variables.

What are we using?
  - Bootstrap (easy, good-looking front-end)
  - NodeJS (JS on server)
  - ExpressJS (framework based on NodeJS)
  - ChartJS (use charts with JS)
  - MariaDB (database management)
  - Nodemon (automatic restart of the node when modifying the project)
  - Module-Serial (to communicate with Schneider PLC)
  - Node7 (to communicate with Siemens PLC)
  - Export-to-CSV (to export and use data in other software)
  - Node-cron (to execute tasks at periodic times)
  - Dotenv (password gestion)

To launch the project, you'll need Docker.

Clone the project in your choosen directory with :
git clone https://github.com/BXL80/Industrial_Modular_Supervision

Then launch the containers with :
docker-compose up --build

And finaly conect to the frontend at this URL :
localhost:8080

You'll be on the login page.
