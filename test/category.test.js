import categoryController from "../controllers/categories.js";
import { categoriesDao } from "../dao/index.js";
import { expect } from 'chai';
import sinon from 'sinon';

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

});
