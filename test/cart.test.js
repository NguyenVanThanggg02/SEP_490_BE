import cartsController from "../controllers/carts.js";
import { cartDao } from "../dao/index.js";
import { expect } from 'chai';
import sinon from 'sinon';

describe("Cart Controller-Tests", () => {
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

    describe("getListSpacesOfUser", () => {
        let req, res, sandbox;
      
        beforeEach(() => {
          sandbox = sinon.createSandbox();
          req = { params: { id: "123" } };
          res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub(),
          };
        });
      
        afterEach(() => {
          sandbox.restore();
        });
      
        it("should return list of spaces with status 200", async () => {
          const mockSpaces = [
            { id: 1, name: "Space A" },
            { id: 2, name: "Space B" },
          ];
      
          sandbox.stub(cartDao, "fetchListSpaceOfUser").resolves(mockSpaces);
      
          await cartsController.getListSpacesOfUser(req, res);
      
          expect(res.status.calledWith(200)).to.be.true;
          expect(res.json.calledWith(mockSpaces)).to.be.true;
        });
      
        it("should return status 404 when spaces are not found", async () => {
          sandbox.stub(cartDao, "fetchListSpaceOfUser").resolves(null);
      
          await cartsController.getListSpacesOfUser(req, res);
      
          expect(res.status.calledWith(404)).to.be.true;
          expect(res.json.calledWith({ message: "Not found spaces" })).to.be.true;
        });
      
        it("should handle errors and return status 500", async () => {
          sandbox.stub(cartDao, "fetchListSpaceOfUser").rejects(new Error("Database error"));
      
          await cartsController.getListSpacesOfUser(req, res);
      
          expect(res.status.calledWith(500)).to.be.true;
          expect(res.json.calledWith({ message: "Error: Database error" })).to.be.true;
        });
      });
      
      describe("deleteListCartOfUser", () => {
        let req, res, sandbox;
      
        beforeEach(() => {
          sandbox = sinon.createSandbox();
          req = { params: { id: "123" } };
          res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub(),
          };
        });
      
        afterEach(() => {
          sandbox.restore();
        });
      
        it("should delete list of carts and return status 200", async () => {
          const mockResponse = { acknowledged: true, deletedCount: 3 };
          sandbox.stub(cartDao, "removeListSpaceOfUser").resolves(mockResponse);
          await cartsController.deleteListCartOfUser(req, res);
          expect(res.status.calledWith(200)).to.be.true;
          expect(res.json.calledWith(mockResponse)).to.be.true;
        });
      
        it("should return status 404 if no carts are found to delete", async () => {
          sandbox.stub(cartDao, "removeListSpaceOfUser").resolves(null);
          await cartsController.deleteListCartOfUser(req, res);
          expect(res.status.calledWith(404)).to.be.true;
          expect(res.json.calledWith("Not Found")).to.be.true;
        });
      
        it("should handle errors and return status 500", async () => {
          sandbox.stub(cartDao, "removeListSpaceOfUser").rejects(new Error("Database error"));
          await cartsController.deleteListCartOfUser(req, res);
          expect(res.status.calledWith(500)).to.be.true;
          expect(res.json.calledWith({ message: "Error: Database error" })).to.be.true;
        });
      });
      
      describe("addSpacesToCart", () => {
        let req, res, sandbox;
      
        beforeEach(() => {
          sandbox = sinon.createSandbox();
          req = {
            body: {
              userId: "123",
              spaceId: "456",
              categoriesId: "789",
              quantity: 2,
            },
          };
          res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub(),
          };
        });
      
        afterEach(() => {
          sandbox.restore();
        });
      
        it("should add a new space item to the cart and return status 200", async () => {
          const mockNewSpaceItem = {
            userId: "123",
            spaceId: "456",
            categoriesId: "789",
            quantity: 2,
            _id: "spaceItemId123",
          };
      
          sandbox.stub(cartDao, "addSpacesToCart").resolves(mockNewSpaceItem);
      
          await cartsController.addSpacesToCart(req, res);
      
          expect(res.status.calledWith(200)).to.be.true;
          expect(
            res.json.calledWith({
              message: "Space added to cart successfully",
              newSpaceItem: mockNewSpaceItem,
            })
          ).to.be.true;
        });
      
        it("should handle errors and return status 500", async () => {
          sandbox.stub(cartDao, "addSpacesToCart").rejects(new Error("Database error"));
      
          await cartsController.addSpacesToCart(req, res);
      
          expect(res.status.calledWith(500)).to.be.true;
          expect(res.json.calledWith({ message: "Error: Database error" })).to.be.true;
        });
      });
      
      describe("updateCart", () => {
        let req, res, sandbox;
      
        beforeEach(() => {
          sandbox = sinon.createSandbox();
          req = {
            params: { id: "123" },
            body: { quantity: 5 },
          };
          res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub(),
          };
        });
      
        afterEach(() => {
          sandbox.restore();
        });
      
        it("should update cart and return status 200", async () => {
          const mockUpdatedCart = {
            _id: "123",
            userId: "456",
            spaceId: "789",
            categoriesId: "012",
            quantity: 5,
          };
      
          sandbox.stub(cartDao, "updateCart").resolves(mockUpdatedCart);
      
          await cartsController.updateCart(req, res);
      
          expect(res.status.calledWith(200)).to.be.true;
          expect(
            res.json.calledWith({
              message: "success",
              updateCart: mockUpdatedCart,
            })
          ).to.be.true;
        });
      
        it("should handle errors and return status 500", async () => {
          sandbox.stub(cartDao, "updateCart").rejects(new Error("Database error"));
      
          await cartsController.updateCart(req, res);
      
          expect(res.status.calledWith(500)).to.be.true;
          expect(res.json.calledWith({ message: "Database error" })).to.be.true;
        });
      });  
});
