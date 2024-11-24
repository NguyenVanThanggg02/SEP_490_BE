import bcrypt from "bcrypt";
import { expect } from 'chai';
import nodemailer from "nodemailer";
import sinon from 'sinon';
import userController from "../controllers/users.js";
import { userDao } from "../dao/index.js";
import Users from "../models/users.js";


describe("User Controller Tests", () => {

  let req, res, sandbox;

  beforeEach(() => {

    req = {
      params: {},
      body: {},
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      send: sinon.stub(),
    };
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("getAllUsers", () => {
    it("should return all users with status 200", async () => {
      const mockUsers = [{ id: 1, username: "testuser" }];
      sandbox.stub(userDao, "fetchAllUsers").resolves(mockUsers);

      await userController.getAllUsers(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockUsers)).to.be.true;
    });

    it("should handle errors and return status 500", async () => {
      sandbox.stub(userDao, "fetchAllUsers").rejects(new Error("Database error"));

      await userController.getAllUsers(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Error: Database error" })).to.be.true;
    });
  });

  describe("getUserByUserName", () => {
    it("should return user by username with status 200", async () => {
      const mockUser = { id: 1, username: "testuser" };
      req.params.username = "testuser";
      sandbox.stub(userDao, "fetchUserByUsername").resolves(mockUser);

      await userController.getUserByUserName(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockUser)).to.be.true;
    });

    it("should handle errors and return status 500", async () => {
      req.params.username = "testuser";
      sandbox.stub(userDao, "fetchUserByUsername").rejects(new Error("Database error"));

      await userController.getUserByUserName(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Error: Database error" })).to.be.true;
    });
  });

  describe("updateUser", () => {
    it("should update user and return status 200", async () => {
      const mockUpdatedUser = { id: "123", name: "Updated User" };
      req.params.id = "123";
      req.body = { name: "Updated User" };
  
      sandbox.stub(userDao, "updateUser").resolves(mockUpdatedUser);
  
      await userController.updateUser(req, res);
  
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockUpdatedUser)).to.be.true;
    });
  
    it("should handle errors and return status 500", async () => {
      req.params.id = "123";
      req.body = { name: "Updated User" };
  
      sandbox.stub(userDao, "updateUser").rejects(new Error("Database error"));
  
      await userController.updateUser(req, res);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Error: Database error" })).to.be.true;
    });
  });
  

  describe("forgetPass", () => {
    it("should send reset email successfully", async () => {
      req.body.gmail = "test@example.com";
      const mockUser = { _id: "123", fullname: "Test User" };

      sandbox.stub(userDao, "forgotPass").resolves(mockUser);
      const sendMailStub = sinon.stub().yields(null, "Email sent");
      sandbox.stub(nodemailer, "createTransport").returns({ sendMail: sendMailStub });

      await userController.forgetPass(req, res);

      expect(res.send.calledWith({ Status: "Thành công" })).to.be.true;
    });
    it("should handle error during sending email", async () => {
        req.body.gmail = "test@example.com";
        const mockUser = { _id: "123", fullname: "Test User" };
      
        sandbox.stub(userDao, "forgotPass").resolves(mockUser);
        
        const sendMailStub = sinon.stub().yields(new Error("Lỗi khi gửi mail"));
        sandbox.stub(nodemailer, "createTransport").returns({ sendMail: sendMailStub });
      
        await userController.forgetPass(req, res);
        expect(res.send.calledWith({ Status: "Lỗi khi gửi mail" })).to.be.true;
      });
      
    it("should return error if user not found", async () => {
      req.body.gmail = "test@example.com";
      sandbox.stub(userDao, "forgotPass").resolves(null);

      await userController.forgetPass(req, res);

      expect(res.send.calledWith({ Status: "Không tìm thấy người dùng" })).to.be.true;
    });
  });



  
  
});
