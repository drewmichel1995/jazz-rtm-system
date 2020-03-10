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
    * Syncs data from IBM Jazz Server to MongoDB for faster retrieval time
      * Some of our data sets were so large that it would take over 30 minutes to retrieve all data needed for the matrix from the Jazz Server, so I utilized a MongoDB as a cache with only relevant information to increase performace times
      * This process checks for new data every 2 minutes, and dynamically adds and removes a service account to each project on each access
    
    * Retieves data from MongoDB for front end services
      * Retrieves all relevant field information
      * Calculates and returns matrix structure so no intensive computations are required from the browser
      
    * Authenticates that users have access to the requested project
      * The server validates a secure http only cookie that is set when an authenticated user views the widget portion of the matrix on an IBM Jazz dashboard
      
      
  * **Vanilla JS Widget**
    * Lives on IBM Jazz Project dashboard
    * Retrieves project list from Jazz Server and retrieves data from the Java server for projects that the user has access to
    * Sets secure cookie for web app to authenticate with
    * Users select project filter criteria and then submits to be redirected to the full React Matrix
    * Widget is served from the Java server at https://*server-address*/server/getWidget and can be added as an OpenSocial gadget on an IBM Jazz Dashboard
    
    
  * **React Web App**
    * Retrieves project data and filter criteria based off of a Unique ID query parameter
    * Plots the matrix retrieved from the Java server
    * Validates secure cookie with Java server
    
  * **NGINX Reverse Proxy**
   * This application utilizes an NGINX reverse proxy so that the Java Server api and React app can be served over the same port with minimal network configuration.
   * The proxy utlizes SSL certificates in the /proxy/certs folder
   * The proxy utilizes nginx.conf located in /proxy/nginx.conf
   
   
To start the application, configure the .env file of the react app to use your specific parameters and run *docker-compose up -d* from the project's root directory
    
 
