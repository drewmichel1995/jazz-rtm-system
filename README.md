# Jazz Requirements Traceability Matrix
### Full Stack application to display links between requirements from an IBM Jazz server on a matrix

### Prerequisites:
  * Docker
  * Docker Compose
  * IBM Jazz Requirements Management Server
  * IBM Jazz Service Account

### Stack:
  * Java
  * React
  * Vanilla JS
  * MongoDB
  * NGINX
  * Docker, Docker Compose
  
This application is intended to be ran in an environment that has an IBM Jazz Requirements Server.

### Project Overview:
  * **Java Server**
    * *Syncs data from IBM Jazz Server to MongoDB for faster retrieval time*
      * Some of our data sets were so large that it would take over 30 minutes to retrieve all data needed for the matrix from the Jazz Server, so I utilized a MongoDB as a cache with only relevant information to increase performace times
      * This process checks for new data every 2 minutes, and dynamically adds and removes a service account to each project on each access
    
    * *Retieves data from MongoDB for front end services*
      * Retrieves all relevant field information
      * Calculates and returns matrix structure so no intensive computations are required from the browser
      
    * *Authenticates that users have access to the requested project*
      * The server validates a secure http only cookie that is set when an authenticated user views the widget portion of the matrix on an IBM Jazz dashboard
