import { categoriesDao } from "../dao/index.js";
import { expect } from 'chai';
import sinon from 'sinon';
import express from "express";
import request from "supertest";
import rulesRouter from "../routes/rules.js";
import Rules from "../models/rules.js";
import mongoose from "mongoose";
describe("Rule Controller-Tests", () => {
    const app = express();
    app.use(express.json());
    app.use("/rules", rulesRouter);

    describe("GET /rules", () => {
        let findStub;

        beforeEach(() => {
            // Stub phương thức find của Rules
            findStub = sinon.stub(Rules, "find");
        });

        afterEach(() => {
            // Khôi phục phương thức gốc sau mỗi test
            sinon.restore();
        });

        it("Trả về danh sách rules thành công", async () => {
            const mockRules = [
                { _id: "rule1", name: "Rule 1", description: "Description 1" },
                { _id: "rule2", name: "Rule 2", description: "Description 2" },
            ];

            // Giả lập find trả về danh sách rules
            findStub.returns({
                exec: sinon.stub().resolves(mockRules),
            });

            const res = await request(app).get("/rules");

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("array").that.has.length(2);
            expect(res.body[0]).to.have.property("name", "Rule 1");
            expect(res.body[1]).to.have.property("name", "Rule 2");
        });

        it("Trả về 404 nếu không có rule nào", async () => {
            // Giả lập find trả về mảng rỗng
            findStub.returns({
                exec: sinon.stub().resolves([]),
            });

            const res = await request(app).get("/rules");

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("message", "Not Found");
        });

        it("Trả về 500 nếu có lỗi server", async () => {
            // Giả lập find ném lỗi
            findStub.returns({
                exec: sinon.stub().rejects(new Error("Database error")),
            });

            const res = await request(app).get("/rules");

            expect(res.status).to.equal(500);
            expect(res.body).to.have.property("message", "Internal Server Error");
        });
    });

    describe("POST /rules", () => {
        let findOneStub, saveStub;

        beforeEach(() => {
            // Stub các phương thức cần thiết
            findOneStub = sinon.stub(Rules, "findOne");
            saveStub = sinon.stub(Rules.prototype, "save");
        });

        afterEach(() => {
            // Khôi phục lại các phương thức gốc sau mỗi test
            sinon.restore();
        });

        it("Tạo rule mới thành công", async () => {
            const mockRuleData = { text: "New Rule", description: "Description of the rule" };
          
            // Giả lập findOne trả về null (không có rule nào trùng)
            findOneStub.returns({
              exec: sinon.stub().resolves(null),
            });
          
            // Giả lập save trả về rule mới tạo
            const mockId = new mongoose.Types.ObjectId();
            saveStub.resolves({
              _id: mockId,
            });
          
            const res = await request(app).post("/rules").send(mockRuleData);
          
            // Kiểm tra phản hồi
            expect(res.status).to.equal(201);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.property("_id");
            expect(mongoose.Types.ObjectId.isValid(res.body._id)).to.be.true;
          });
          

        it("Trả về 400 nếu rule đã tồn tại", async () => {
            const mockRuleData = { text: "Existing Rule", description: "Description of the rule" };

            // Giả lập findOne trả về rule đã tồn tại
            findOneStub.returns({
                exec: sinon.stub().resolves({ _id: "existingRuleId", ...mockRuleData }),
              });
          

            const res = await request(app).post("/rules").send(mockRuleData);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("message", "Rule with this text already exists.");
        });

        it("Trả về 500 nếu có lỗi server", async () => {
            const mockRuleData = { text: "New Rule", description: "Description of the rule" };

            // Giả lập findOne ném lỗi
            findOneStub.throws(new Error("Database error"));

            const res = await request(app).post("/rules").send(mockRuleData);

            expect(res.status).to.equal(500);
            expect(res.body).to.have.property("message", "Internal Server Error");
        });
    });


})