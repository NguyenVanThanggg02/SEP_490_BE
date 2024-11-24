import appliancesController from "../controllers/appliances.js";
import { appliancesDao } from "../dao/index.js";
import bcrypt from "bcrypt";
import { expect } from 'chai';
import sinon from 'sinon';

describe("Appliance Controller Tests", () => {
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

  describe("getAllAppliances", () => {
    // đối với get user list có hai đầu status là 200 và 500 sẽ tương đương 2 test case test output ra được status đó
    it("should return all appliances with status 200", async () => {
      // Tạo đây giả sử có một user có username là testuser
      const mockAppliances = [
        { id: 1, name: "Fridge" },
        { id: 2, name: "Washing Machine" },
      ];

      // khi gọi tới hàm fetchAllUsers của DAO sẽ trả về testuser có nghĩa khi gọi tới hàm list có giữ liệu đầu ra
      sandbox.stub(appliancesDao, "fetchAllAppliances").resolves(mockAppliances);

      // gọi tới api get list
      await appliancesController.getAllAppliances(req, res);

      // check status có đúng 200 không
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockAppliances)).to.be.true;
    });

    // test case tiếp theo cần test là 500
    it("should handle errors and return status 500", async () => {
      // đầu status 500 có nghĩa là đã sảy ra lỗi trong quá trình query dữ liệu
      // tương tự tới test case bên trên nhưng thai vì trả ra user thì set khi gọi tới hàm fetchAllUsers của DAo sẽ trả về một exception
      sandbox.stub(appliancesDao, "fetchAllAppliances").rejects(new Error("Database error"));

      // gọi api
      await appliancesController.getAllAppliances(req, res);

      // test xem api có trả về lỗi hay không
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Error: Database error" })).to.be.true;
    });

    it("should return an empty array if no appliances are found", async () => {
      const mockAppliances = [];
  
      sandbox.stub(appliancesDao, "fetchAllAppliances").resolves(mockAppliances);
  
      await appliancesController.getAllAppliances(req, res);
  
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockAppliances)).to.be.true;
    });
  
    it("should return status 500 if fetchAllAppliances returns null", async () => {
      sandbox.stub(appliancesDao, "fetchAllAppliances").resolves(null);
  
      await appliancesController.getAllAppliances(req, res);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Error: Cannot retrieve appliances" })).to.be.true;
    });
  
    it("should return status 500 if fetchAllAppliances returns undefined", async () => {
      sandbox.stub(appliancesDao, "fetchAllAppliances").resolves(undefined);
  
      await appliancesController.getAllAppliances(req, res);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Error: Cannot retrieve appliances" })).to.be.true;
    });
  
  });

  describe("getAllAppliancesByCategories", () => {
    // Đầu tiên là trường hợp trả về danh sách appliances với status 200
    it("should return all appliances with status 200", async () => {
      // Mock data trả về khi gọi DAO
      const mockAppliances = { id: 1, name: "Fridge", categoryId: "123" };
  
      // Stub phương thức fetchAllAppliancesCategories để trả về mockAppliances
      sandbox.stub(appliancesDao, "fetchAllAppliancesCategories").resolves(mockAppliances);
  
      // Giả lập req với param là categoryId
      req.params = { cateid: "123" };
  
      // Gọi API
      await appliancesController.getAllAppliancesByCategories(req, res);
  
      // Kiểm tra kết quả trả về
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockAppliances)).to.be.true;
    });
  
    // Test case tiếp theo là trường hợp xảy ra lỗi
    it("should handle errors and return status 500", async () => {
      // Giả lập DAO throw lỗi khi được gọi
      sandbox.stub(appliancesDao, "fetchAllAppliancesCategories").rejects(new Error("Database error"));
  
      // Giả lập req với param là categoryId
      req.params = { cateid: "123" };
  
      // Gọi API
      await appliancesController.getAllAppliancesByCategories(req, res);
  
      // Kiểm tra kết quả trả về
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ success: false, message: "Internal server error" })).to.be.true;
    });
  });
  
  describe("createAppliance", () => {
    // Test case: Tạo appliance thành công
    it("should create a new appliance and return status 201", async () => {
      // Mock dữ liệu appliance đầu vào
      const mockApplianceData = {
        name: "Fridge",
        appliances: ["Cooling", "Freezer"],
        categoryId: "123",
      };
  
      // Mock appliance trả về khi lưu thành công
      const mockSavedAppliance = {
        id: "1",
        name: "Fridge",
        appliances: ["Cooling", "Freezer"],
        categoryId: "123",
      };
  
      // Giả lập request và response
      req.body = mockApplianceData;
  
      // Stub phương thức addAppliance của DAO để trả về mockSavedAppliance
      sandbox.stub(appliancesDao, "addAppliance").resolves(mockSavedAppliance);
  
      // Gọi controller
      await appliancesController.createAppliance(req, res);
  
      // Kiểm tra phản hồi trả về
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({ success: true, appliance: mockSavedAppliance })).to.be.true;
    });
  
    // Test case: Xử lý lỗi và trả về status 500
    it("should handle errors and return status 500", async () => {
      // Mock dữ liệu appliance đầu vào
      const mockApplianceData = {
        name: "Fridge",
        appliances: ["Cooling", "Freezer"],
        categoryId: "123",
      };
  
      // Giả lập request
      req.body = mockApplianceData;
  
      // Stub phương thức addAppliance để throw lỗi
      sandbox.stub(appliancesDao, "addAppliance").rejects(new Error("Error creating new appliance in DAO"));
  
      // Gọi controller
      await appliancesController.createAppliance(req, res);
  
      // Kiểm tra phản hồi trả về
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ success: false, message: "Error creating appliance" })).to.be.true;
    });
  });
  

});
