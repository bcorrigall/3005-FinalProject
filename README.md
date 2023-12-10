# The Dojo

## Prerequisites

-   Node.js

## Database Setup

1. Install PostgreSQL.
2. Create a database named `dojoDB`
3. Sql files to create tables and insert values are located in `SQL` fodler
4. Create the database on your computer.

## Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Run `npm install` to install all dependencies listed in `package.json` and `package-lock.json`.
4. Configure your database connection in `server/dbConnect.js`. Change the `user` and `password` fields to your database username and password respectively.

Note: `npm install` will automatically install all the dependencies required for the project, as specified in the `package.json` and `package-lock.json` files.

## Usage

This application offers various functionalities accessible through different routes:

1. **Home Page**: Access the landing page at the root route (`/`).
2. **User Authentication**: Users can log in, register, and log out. User roles (members, trainers, admins) are managed, and access to certain routes is restricted based on these roles.
3. **Equipment Management**: View and manage gym equipment details at `/equipment` and `/equipment/:equipment_id`. Accessible to admins.
4. **Members Management**: Admins can view and manage member details at `/members` and `/members/:member_id`. Accessible to members and admins.
5. **Trainers Management**: Admins can view and manage trainer details at `/trainers` and `/trainers/:trainer_id`. Accessible to trainers and admins.
6. **Room Management**: Admins can view and manage room details at `/rooms` and `/rooms/:room_id`. Accessible to admins.
7. **Class Management**: View and manage class details at `/classes` and `/classes/:class_id`. Accessible to members and admins.
8. **Session Management**: Users can post session details, and admins can delete or update sessions. Members can view their own sessions, trainers can view their own sessions.
9. **Health and Workout Tracking**: Members can submit health data and workout details. Members can view their own health and workout data.
10. **Payments and Complaints Handling**: Members can process payments and submit complaints. Members can make payments and submit complaints.

### Starting the Server

-   Run the server using the command `node server.js`.
-   The server will start on `http://localhost:3000`.

### Accessing the Application

-   Open a web browser and navigate to `http://localhost:3000` to access the home page.
-   Navigate to the respective routes for different functionalities as listed above.
-   For easy access to the website the database has been populated with the following users:
    -   Admin:
        -   Username: admin
        -   Password: admin
    -   Member:
        -   Username: member
        -   Password: member
    -   Trainer:
        -   Username: trainer
        -   Password: trainer

Note: Some routes and functionalities are role-restricted and require appropriate user authentication.
