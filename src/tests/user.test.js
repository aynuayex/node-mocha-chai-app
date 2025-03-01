require("dotenv").config({ path: ".env.test" });
const chai = require("chai");
const chaiHttp = require("chai-http");
const bcrypt = require("bcryptjs")

const { expect } = chai;
const app = require("../app");
const connectDB = require("../config/dbConnect");
const User = require("../resources/users/model");
const mongoose = require("mongoose");

chai.use(chaiHttp);

describe("User API", () => {
  before(async () => {
    process.env.NODE_ENV = "test";
    await connectDB();
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    // Create a test user
    const hashedPassword = await bcrypt.hash("SecurePass10!", 10);
    await User.create({
      fullName: "Test User",
      email: "testuser@gmail.com",
      password: hashedPassword,
      refreshToken: [],
    });
  });

  describe("User Registration API", () => {
    it("should register a user with valid data", async () => {
      const res = await chai.request(app).post("/api/users/register").send({
        fullName: "Ayne Abreham",
        email: "aynuman19@gmail.com",
        password: "Hahaha10#",
        confirmPassword: "Hahaha10#",
      });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property(
        "message",
        "User registered successfully"
      );
      expect(res.body).to.have.property("id");
      expect(res.body).to.have.property("fullName", "Ayne Abreham");
      expect(res.body).to.have.property("email", "aynuman19@gmail.com");
      expect(res.body).to.have.property("accessToken");
    });

    it("should fail registration with invalid email", (done) => {
      chai
        .request(app)
        .post("/api/users/register")
        .send({
          fullName: "John Doe",
          email: "not-an-email",
          password: "Hahaha10#",
          confirmPassword: "Hahaha10#",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message").that.includes("email");
          done();
        });
    });

    it("should fail registration with a short password", (done) => {
      chai
        .request(app)
        .post("/api/users/register")
        .send({
          fullName: "John Doe",
          email: "john@gmail.com",
          password: "abc",
          confirmPassword: "abc",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it("should fail registration if passwords do not match", (done) => {
      chai
        .request(app)
        .post("/api/users/register")
        .send({
          fullName: "John Doe",
          email: "john@gmail.com",
          password: "Hahaha10#",
          confirmPassword: "WrongPass10#",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it("should fail registration if email already exists", async () => {
      await User.create({
        fullName: "John Doe",
        email: "john@gmail.com",
        password: "Hahaha10#",
      });

      const res = await chai.request(app).post("/api/users/register").send({
        fullName: "John Doe",
        email: "john@gmail.com",
        password: "Hahaha10#",
        confirmPassword: "Hahaha10#",
      });

      expect(res).to.have.status(409);
    });

    it("should fail registration with missing fields", (done) => {
      chai
        .request(app)
        .post("/api/users/register")
        .send({
          email: "john@gmail.com",
          password: "Hahaha10#",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body)
            .to.have.property("message")
            .that.includes("fullName");
          done();
        });
    });
  });

  describe("User Login API", () => {
    it("should log in a user with correct credentials", async () => {
      const res = await chai.request(app).post("/api/users/login").send({
        email: "testuser@gmail.com",
        password: "SecurePass10!",
      });

      expect(res).to.have.status(200);
      expect(res.body)
        .to.have.property("success")
        .that.includes("Logged in as Test User");
      expect(res.body).to.have.property("id");
      expect(res.body).to.have.property("fullName", "Test User");
      expect(res.body).to.have.property("email", "testuser@gmail.com");
      expect(res.body).to.have.property("accessToken");
    });

    it("should fail login with incorrect password", async () => {
      const res = await chai.request(app).post("/api/users/login").send({
        email: "testuser@gmail.com",
        password: "WrongPassword!",
      });

      expect(res).to.have.status(401);
    });

    it("should fail login with non-existent email", async () => {
      const res = await chai.request(app).post("/api/users/login").send({
        email: "nonexistent@gmail.com",
        password: "SecurePass10!",
      });

      expect(res).to.have.status(401);
    });

    it("should fail login with missing email field", async () => {
      const res = await chai.request(app).post("/api/users/login").send({
        password: "SecurePass10!",
      });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message").that.includes("email");
    });

    it("should fail login with missing password field", async () => {
      const res = await chai.request(app).post("/api/users/login").send({
        email: "testuser@gmail.com",
      });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message").that.includes("password");
    });
  });
});
