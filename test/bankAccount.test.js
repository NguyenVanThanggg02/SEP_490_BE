import express from "express";
import sinon from "sinon";
import { expect } from "chai";
import request from "supertest";
import BankAccount from "../models/bankAccounts.js";
import bankAccountRouter from "../routes/bankAccount.js";
import Users from "../models/users.js";
const app = express();
app.use(express.json());
app.use("/bankaccount", bankAccountRouter);
describe("Bank Account  Tests", () => {
    describe("GET /bankaccount", () => {
        let findStub;
        beforeEach(() => {
            // Mock phương thức find của Mongoose
            findStub = sinon.stub(BankAccount, "find");
        });
        afterEach(() => {
            // Khôi phục lại các stub sau mỗi test case
            sinon.restore();
        });
        it("should return all bank accounts", async () => {
            const mockBanks = [
                { _id: "1", bank: { name: "Bank A" }, user: { name: "User A" } },
                { _id: "2", bank: { name: "Bank B" }, user: { name: "User B" } }
            ];
            // Mock find và populate
            findStub.returns({
                populate: sinon.stub().returnsThis(),
                exec: sinon.stub().returns(Promise.resolve(mockBanks))
            });
            const res = await request(app).get("/bankaccount");
            // Kiểm tra xem phương thức find có được gọi hay không và đối số tìm kiếm có đúng không
            expect(findStub.calledOnce).to.be.true;
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal(mockBanks);
        });
        it("should return 404 if no bank accounts are found", async () => {
            // Mock phương thức find để trả về mảng rỗng
            findStub.returns({
                populate: sinon.stub().returnsThis(),
                exec: sinon.stub().returns(Promise.resolve([]))
            });
            const res = await request(app).get("/bankaccount");
            // Kiểm tra xem response có mã lỗi 404 và thông báo chính xác không
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("message").that.equals("Bank accounts not found");
        });
        it("should return 500 if there is a server error", async () => {
            // Giả lập lỗi server khi gọi phương thức find
            findStub.throws(new Error("Server Error"));
            const res = await request(app).get("/bankaccount");
            // Kiểm tra mã lỗi 500 và thông báo lỗi
            expect(res.status).to.equal(500);
            expect(res.body).to.have.property("message").that.equals("Lỗi server");
        });
    });

    describe("GET /bankaccount/:userId", () => {
        let findStub;
        beforeEach(() => {
            // Mock phương thức find của Mongoose
            findStub = sinon.stub(BankAccount, "find");
        });
        afterEach(() => {
            // Khôi phục lại các stub sau mỗi test case
            sinon.restore();
        });
        it("should return bank accounts for the user with populated data", async () => {
            const mockUserId = "user123";
            const mockBankAccounts = [
                {
                    _id: "1",
                    bank: { name: "Bank A" },
                    user: { _id: mockUserId, name: "User A" },
                },
                {
                    _id: "2",
                    bank: { name: "Bank B" },
                    user: { _id: mockUserId, name: "User A" },
                },
            ];
            // Mock find và populate
            findStub.returns({
                populate: sinon.stub().returnsThis(), // Giả lập populate
                exec: sinon.stub().returns(Promise.resolve(mockBankAccounts)) // Giả lập exec trả về dữ liệu mock
            });
            const res = await request(app).get(`/bankaccount/${mockUserId}`);
            // Kiểm tra xem phương thức find có được gọi đúng với userId
            expect(findStub.calledOnceWith({ user: mockUserId })).to.be.true;
            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal(mockBankAccounts);
        });
        it("should return 404 if no bank accounts are found for the user", async () => {
            const mockUserId = "user123";
            // Mock find để trả về mảng rỗng
            findStub.returns({
                populate: sinon.stub().returnsThis(),
                exec: sinon.stub().returns(Promise.resolve([]))
            });
            const res = await request(app).get(`/bankaccount/${mockUserId}`);
            // Kiểm tra mã lỗi 404 và thông báo chính xác
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("message").that.equals("Không tìm thấy tài khoản ngân hàng cho người dùng này");
        });
        it("should return 500 if there is a server error", async () => {
            const mockUserId = "user123";
            // Giả lập lỗi server khi gọi phương thức find
            findStub.throws(new Error("Server Error"));
            const res = await request(app).get(`/bankaccount/${mockUserId}`);
            // Kiểm tra mã lỗi 500 và thông báo lỗi
            expect(res.status).to.equal(500);
            expect(res.body).to.have.property("message").that.equals("Lỗi server");
        });
    });
})