import categoryController from "../controllers/categories.js";
import { categoriesDao } from "../dao/index.js";
import { expect } from 'chai';
import sinon from 'sinon';
import express from "express";
import request from "supertest";
import categoriesRouter from "../routes/categories.js";
import Categories from "../models/categories.js";
describe("Category Controller-Tests", () => {
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

  describe("getAllCategories", () => {
    let req, res, sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = {};
      res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.stub(),
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("should return all categories and status 200", async () => {
      const mockCategories = [
        { _id: "1", name: "Category 1" },
        { _id: "2", name: "Category 2" },
      ];

      sandbox.stub(categoriesDao, "fetchAllCategories").resolves(mockCategories);

      await categoryController.getAllCategories(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockCategories)).to.be.true;
    });

    it("should handle errors and return status 500", async () => {
      sandbox.stub(categoriesDao, "fetchAllCategories").rejects(new Error("Database error"));

      await categoryController.getAllCategories(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: "Error: Database error" })).to.be.true;
    });
  });
  const app = express();
  app.use(express.json());
  app.use("/categories", categoriesRouter);
  describe("GET /categories", () => {
    let findStub;
    beforeEach(() => {
      // Stub phương thức find của Mongoose
      findStub = sinon.stub(Categories, "find");
    });
    afterEach(() => {
      // Khôi phục phương thức gốc sau mỗi test
      sinon.restore();
    });
    it("Trả về danh sách categories nếu tìm thấy", async () => {
      // Dữ liệu giả
      const mockCategories = [
        { _id: "1", name: "Category 1" },
        { _id: "2", name: "Category 2" },
      ];
      findStub.returns({
        exec: sinon.stub().resolves(mockCategories),
      });
      const res = await request(app).get("/categories");
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.length(2);
      expect(res.body[0]).to.have.property("name", "Category 1");
      expect(res.body[1]).to.have.property("name", "Category 2");
    });
    it("Trả về 404 nếu không tìm thấy categories", async () => {
      findStub.returns({
        exec: sinon.stub().resolves([]),
      });
      const res = await request(app).get("/categories");
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("message", "Not Found");
    });
    it("Trả về 500 nếu xảy ra lỗi server", async () => {
      findStub.returns({
        exec: sinon.stub().rejects(new Error("Database Error")),
      });
      const res = await request(app).get("/categories");
      expect(res.status).to.equal(500);
      expect(res.body).to.have.property("message", "Internal Server Error");
    });
  });
});
