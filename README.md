# Node-Mocha-Chai App

This is a simple Node.js application using Mocha and Chai for testing. The app demonstrates user registration and login functionalities, and includes automated tests for these features.

## Setup and Configuration

### Step 1: Clone the Repository

To get started, clone this repository to your local machine.

```bash
git clone https://github.com/aynuayex/node-mocha-chai-app
cd node-mocha-chai-app
```
### Step 2: Environment Variables

Before running the application, you need to set up the necessary environment variables. There are two environment files you need to configure:

- `.env` – for your local development environment.
- `.env.test` – for your test environment.

You will find `.env.example` and `.env.test.example` files in the root directory. Copy these files and rename them to `.env` and `.env.test`, respectively:

```bash
cp .env.example .env
cp .env.test.example .env.test
```
Next, update the `.env` and `.env.test` files with the appropriate values:

- **PORT**: The port on which your server will run.
- **MONGO_URI**: Replace `insert_your_mongodb_connection_string_here` with your actual MongoDB connection string:

```
PORT=5000
MONGO_URI=insert_your_mongodb_connection_string_here
MONGO_TEST_URI=insert_your_mongodb_connection_string_here
```


**ACCESS_TOKEN_SECRET** and **REFRESH_TOKEN_SECRET**: These are encryption keys used to sign the JWT tokens. You should generate these keys using the following command in Node.js:

```
require('crypto').randomBytes(64).toString('hex');
```
After running the above command in the Node CLI, copy the generated secret and add it to the .env and .env.test files:

```
ACCESS_TOKEN_SECRET=secret_key
REFRESH_TOKEN_SECRET=secret_key
```
### Step 3: Install Dependencies
After configuring your environment files, you need to install the required packages. Run the following command:

```
npm install
```
### Step 4: Running the Application
Now that you've installed the dependencies, you can run the development server. Use the following command to start the server:

```
npm run dev
```
The server should now be running on http://localhost:5000.

### Step 5: Running Tests
To run the automated tests for your application, use the following command:

```
npm test
```
This will execute the tests in the src/tests/**/*.test.js file, and you will be able to see the results in the terminal.

**Conclusion**

You've now set up the application with the necessary environment variables and installed the required packages. You can run the development server, or execute the tests to check your API functionality. If you need to make any changes, simply modify the application or the test files and re-run the commands to verify everything works correctly.