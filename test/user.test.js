import bcrypt from "bcrypt";
import { expect } from 'chai';
import nodemailer from "nodemailer";
import sinon from 'sinon';
import userController from "../controllers/users.js";
import { userDao } from "../dao/index.js";
import Users from "../models/users.js";


describe("User Controller Tests", () => {
/* 
req: request object
res: respone object
sandbox: công cụ của sinon.js để tạo và quản lý các spy, stub, mock trong test 
nôn na giả lậo giữ liệu đầu ra cho các service để test xem 
khi service trả về giữ liệu như vậy api chạy có đúng yêu cầu không!
*/
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
    // Quản lý các spy, stub, và mock trong từng test case. Sandbox đảm bảo rằng mọi thay đổi sẽ bị khôi phục sau mỗi test case, tránh tình trạng "rò rỉ" giữa các test.
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    // Khôi phục tất cả các phương thức gốc (original methods) mà các stub đã ghi đè.
    //Đảm bảo rằng test tiếp theo sẽ không bị ảnh hưởng bởi các thay đổi trong test trước.
    sandbox.restore();
  });

  describe("getAllUsers", () => {
    // đối với get user list có hai đầu status là 200 và 500 sẽ tương đương 2 test case test output ra được status đó
    it("should return all users with status 200", async () => {
    // Tạo đây giả sử có một user có username là testuser
      const mockUsers = [{ id: 1, username: "testuser" }];
      // khi gọi tới hàm fetchAllUsers của DAO sẽ trả về testuser có nghĩa khi gọi tới hàm list có giữ liệu đầu ra
      sandbox.stub(userDao, "fetchAllUsers").resolves(mockUsers);

      // gọi tới api get list
      await userController.getAllUsers(req, res);

      // check status có đúng 200 không
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockUsers)).to.be.true;
    });

    // test case tiếp theo cần test là 500
    it("should handle errors and return status 500", async () => {
    // đầu status 500 có nghĩa là đã sảy ra lỗi trong quá trình query dữ liệu
    // tương tự tới test case bên trên nhưng thai vì trả ra user thì set khi gọi tới hàm fetchAllUsers của DAo sẽ trả về một exception
      sandbox.stub(userDao, "fetchAllUsers").rejects(new Error("Database error"));

      // gọi api
      await userController.getAllUsers(req, res);

      // test xem api có trả về lỗi hay không
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Error: Database error" })).to.be.true;
    });
  });
  /*
  Với ví dụ trên => để test được một API thì cần thực hiện các bước sau
  - Xác định số lượng test case sẽ trả ra: Số lượng test case sẽ nằm ở các đầu if else có return hoặc trả về status
  - Khi đã xác định được api đó có bao nhiêu test case thi tiến hành code test
  - Để code unit test:
    + Định nghĩa dữ liệu đầu ra cho service là tầng xử lý logic trong project này là DAO
    + Các test case của if sau cần thỏa mãn điều kiện của if phía trước (xem tại ví dụ change password trả về 404)
    + Call tới API tại controller
    + Check dữ liệu trả về có đúng không
   */

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

  describe("changePass", () => {
    it("should update password successfully with status 200", async () => {
      req.params.username = "testuser";
      req.body = { oldPassword: "oldPass", newPassword: "newPass" };

      const mockUser = {
        username: "testuser",
        password: "hashedOldPass",
        save: sinon.stub().resolves(),
      };

      sandbox.stub(Users, "findOne").resolves(mockUser);
      sandbox.stub(bcrypt, "compare").resolves(true);
      sandbox.stub(bcrypt, "genSalt").resolves("salt");
      sandbox.stub(bcrypt, "hash").resolves("hashedNewPass");

      await userController.changePass(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({ status: true, message: "Password updated successfully" })
      ).to.be.true;
    });

    
    it("should return 400 if old password is incorrect", async () => {
      req.params.username = "testuser";
      req.body = { oldPassword: "wrongPass", newPassword: "newPass" };

      const mockUser = {
        username: "testuser",
        password: "hashedOldPass",
      };

      sandbox.stub(Users, "findOne").resolves(mockUser);
      sandbox.stub(bcrypt, "compare").resolves(false);

      await userController.changePass(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(
        res.json.calledWith({ status: false, message: "Old password is incorrect" })
      ).to.be.true;
    });
    // đây là ví dụ cho trường hợp if sau cần thoả mãn điều kiện của if trước
    // Để chạy được 404 cần phải thỏa mãn điều kiện username, oldpassword, newpass không null
    it("should return 404 if user not found", async () => {
        // truyền vào một username cần tìm kiếm không có trong danh sách khởi tạo
        req.params.username = "unknownUser";
        // truyền đủ requried
        req.body = { oldPassword: "oldPass", newPassword: "newPass" };
        // gọi tới DAO và set cho giữ liệu đầu ra null
        sandbox.stub(Users, "findOne").resolves(null);
        await userController.changePass(req, res);
        // check status có đúng hay không
        expect(res.status.calledWith(404)).to.be.true;  
        expect(res.json.calledWith({ status: false, message: "User not found" })).to.be.true;  
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
        console.log("Response sent:", res.send.args);
        expect(res.send.calledWith({ Status: "Lỗi khi gửi mail" })).to.be.true;
      });
      
    it("should return error if user not found", async () => {
      req.body.gmail = "test@example.com";
      sandbox.stub(userDao, "forgotPass").resolves(null);

      await userController.forgetPass(req, res);

      // test case này không có status mà trả về message thì check message khớp không
      expect(res.send.calledWith({ Status: "Không tìm thấy người dùng" })).to.be.true;
    });
  });
});
