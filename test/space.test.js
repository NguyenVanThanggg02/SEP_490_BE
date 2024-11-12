import { expect } from "chai";
import sinon from "sinon";
import spaceController from "../controllers/spaces.js";
import { spaceDao } from "../dao/index.js";
import Spaces from "../models/spaces.js";
import mongoose from "mongoose";
import cloudinary from "../cloudinary.config.js";
import {spaceRouter}  from "../routes/index.js";
import express from "express";
import supertest from "supertest";
describe("Space Controller-Tests", () => {
  let req, res, sandbox;

  beforeEach(() => {
    // Khởi tạo request, response và sandbox của sinon
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
    // Khôi phục các stub sau mỗi test case
    sandbox.restore();
  });

  describe("getAllSpacesApply", () => {
    // đối với get user list có hai đầu status là 200 và 500 sẽ tương đương 2 test case test output ra được status đó
    it("should return all users with status 200", async () => {
    // Tạo đây giả sử có một user có username là testuser
      const mockSpaces = [{
        locationPoint: {
            type: "Point",
            coordinates: [
                105.77499242871824,
                19.804795582985733
            ]
        },
        _id: "672de180a29a7d1dcce3b7a9",
        latLng: [
            19.804795582985733,
            105.77499242871824
        ],
        name: "Phòng làm việc số mới",
        description: "",
        location: "Ba Đình, Thanh Hóa, Thanh Hóa",
        area: "40",
        rulesId: "672de17fa29a7d1dcce3b7a2",
        userId: {
            _id: "6639786d743f79c9b97fc1c2",
            fullname: "Nguyen Van A",
            username: "vana",
            gmail: "nguyenducdat0610@gmail.commm",
            password: "$2b$10$7vF54QkF6KjtkuffbjpZHeNwkFjeLJD7ZtEYk7LSLBn0ZFB/7x4lu",
            gender: "Male",
            birthday: "2002-02-05",
            avatar: "https://res.cloudinary.com/dakpa1ph2/image/upload/v1730817825/spacehub/img_user/hklxhyzctefdxcfk4shc.webp",
            phone: "03682338",
            address: "Hà Nội",
            role: 2,
            isBan: false,
            createdAt: "2024-09-17T08:00:00.000Z",
            updatedAt: "2024-11-05T14:44:09.029Z",
            firstLogin: false,
            needs: "671cfa315b5c091e0b772cf0",
            bankAccounts: [],
            defaultBankAccount: null,
            isSpaceOwners: false
        },
        pricePerHour: 123,
        pricePerDay: 1234,
        pricePerWeek: 1234,
        pricePerMonth: 1234,
        images: [
            {
                public_id: "spacehub/img_space/jjbymdfwhpwxceb18l0e",
                url: "https://res.cloudinary.com/dakpa1ph2/image/upload/v1731060092/spacehub/img_space/jjbymdfwhpwxceb18l0e.webp",
                _id: "672de180a29a7d1dcce3b7aa"
            }
        ],
        censorship: "Chấp nhận",
        status: "Đang sử dụng",
        categoriesId: "66eafbb0cb37101e8e8f8946",
        appliancesId: {
            _id: "672de180a29a7d1dcce3b7a4",
            name: "",
            appliances: [
                {
                    name: "Máy chiếu",
                    iconName: "Videocam",
                    _id: "672de180a29a7d1dcce3b7a5"
                },
                {
                    name: "WiFi",
                    iconName: "Wifi",
                    _id: "672de180a29a7d1dcce3b7a6"
                },
                {
                    name: "Ghế giáo viên",
                    iconName: "EventSeat",
                    _id: "672de180a29a7d1dcce3b7a7"
                }
            ],
            categoryId: "66eafbb0cb37101e8e8f8946",
            createdAt: "2024-11-08T10:01:36.006Z",
            updatedAt: "2024-11-08T10:22:25.174Z",
            __v: 0
        },
        isGoldenHour: true,
        goldenHourDetails: [
            {
                startTime: "03:00",
                endTime: "04:00",
                priceIncrease: 222,
                _id: "672de180a29a7d1dcce3b7ac"
            },
            {
                startTime: "04:00",
                endTime: "05:00",
                priceIncrease: 222,
                _id: "672de180a29a7d1dcce3b7ad"
            }
        ],
        reviews: [],
        reportCount: 0,
        favorite: false,
        isUpdate: false
    }
    ];
      // khi gọi tới hàm fetchAllUsers của DAO sẽ trả về testuser có nghĩa khi gọi tới hàm list có giữ liệu đầu ra
      sandbox.stub(spaceDao, "fetchAllSpacesApply").resolves(mockSpaces);

      // gọi tới api get list
      await spaceController.getAllSpacesApply(req, res);

      // check status có đúng 200 không
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockSpaces)).to.be.true;
    });

    // test case tiếp theo cần test là 500
    it("should handle errors and return status 500", async () => {
    // đầu status 500 có nghĩa là đã sảy ra lỗi trong quá trình query dữ liệu
    // tương tự tới test case bên trên nhưng thai vì trả ra user thì set khi gọi tới hàm fetchAllUsers của DAo sẽ trả về một exception
      sandbox.stub(spaceDao, "fetchAllSpacesApply").rejects(new Error("Database error"));

      // gọi api
      await spaceController.getAllSpacesApply(req, res);

      // test xem api có trả về lỗi hay không
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Error: Database error" })).to.be.true;
    });
  });

  describe("getAllSpaces", () => {
    // đối với get user list có hai đầu status là 200 và 500 sẽ tương đương 2 test case test output ra được status đó
    it("should return all users with status 200", async () => {
    // Tạo đây giả sử có một user có username là testuser
      const mockSpaces = [{
        locationPoint: {
            type: "Point",
            coordinates: [
                105.77499242871824,
                19.804795582985733
            ]
        },
        _id: "672de180a29a7d1dcce3b7a9",
        latLng: [
            19.804795582985733,
            105.77499242871824
        ],
        name: "Phòng làm việc số mới",
        description: "",
        location: "Ba Đình, Thanh Hóa, Thanh Hóa",
        area: "40",
        rulesId: "672de17fa29a7d1dcce3b7a2",
        userId: {
            _id: "6639786d743f79c9b97fc1c2",
            fullname: "Nguyen Van A",
            username: "vana",
            gmail: "nguyenducdat0610@gmail.commm",
            password: "$2b$10$7vF54QkF6KjtkuffbjpZHeNwkFjeLJD7ZtEYk7LSLBn0ZFB/7x4lu",
            gender: "Male",
            birthday: "2002-02-05",
            avatar: "https://res.cloudinary.com/dakpa1ph2/image/upload/v1730817825/spacehub/img_user/hklxhyzctefdxcfk4shc.webp",
            phone: "03682338",
            address: "Hà Nội",
            role: 2,
            isBan: false,
            createdAt: "2024-09-17T08:00:00.000Z",
            updatedAt: "2024-11-05T14:44:09.029Z",
            firstLogin: false,
            needs: "671cfa315b5c091e0b772cf0",
            bankAccounts: [],
            defaultBankAccount: null,
            isSpaceOwners: false
        },
        pricePerHour: 123,
        pricePerDay: 1234,
        pricePerWeek: 1234,
        pricePerMonth: 1234,
        images: [
            {
                public_id: "spacehub/img_space/jjbymdfwhpwxceb18l0e",
                url: "https://res.cloudinary.com/dakpa1ph2/image/upload/v1731060092/spacehub/img_space/jjbymdfwhpwxceb18l0e.webp",
                _id: "672de180a29a7d1dcce3b7aa"
            }
        ],
        censorship: "Chờ duyệt",
        status: "Đang sử dụng",
        categoriesId: "66eafbb0cb37101e8e8f8946",
        appliancesId: {
            _id: "672de180a29a7d1dcce3b7a4",
            name: "",
            appliances: [
                {
                    name: "Máy chiếu",
                    iconName: "Videocam",
                    _id: "672de180a29a7d1dcce3b7a5"
                },
                {
                    name: "WiFi",
                    iconName: "Wifi",
                    _id: "672de180a29a7d1dcce3b7a6"
                },
                {
                    name: "Ghế giáo viên",
                    iconName: "EventSeat",
                    _id: "672de180a29a7d1dcce3b7a7"
                }
            ],
            categoryId: "66eafbb0cb37101e8e8f8946",
            createdAt: "2024-11-08T10:01:36.006Z",
            updatedAt: "2024-11-08T10:22:25.174Z",
            __v: 0
        },
        isGoldenHour: true,
        goldenHourDetails: [
            {
                startTime: "03:00",
                endTime: "04:00",
                priceIncrease: 222,
                _id: "672de180a29a7d1dcce3b7ac"
            },
            {
                startTime: "04:00",
                endTime: "05:00",
                priceIncrease: 222,
                _id: "672de180a29a7d1dcce3b7ad"
            }
        ],
        reviews: [],
        reportCount: 0,
        favorite: false,
        isUpdate: false
    }
    ];
      // khi gọi tới hàm fetchAllUsers của DAO sẽ trả về testuser có nghĩa khi gọi tới hàm list có giữ liệu đầu ra
      sandbox.stub(spaceDao, "fetchAllSpaces").resolves(mockSpaces);

      // gọi tới api get list
      await spaceController.getAllSpaces(req, res);

      // check status có đúng 200 không
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockSpaces)).to.be.true;
    });

    // test case tiếp theo cần test là 500
    it("should handle errors and return status 500", async () => {
    // đầu status 500 có nghĩa là đã sảy ra lỗi trong quá trình query dữ liệu
    // tương tự tới test case bên trên nhưng thai vì trả ra user thì set khi gọi tới hàm fetchAllUsers của DAo sẽ trả về một exception
      sandbox.stub(spaceDao, "fetchAllSpaces").rejects(new Error("Database error"));

      // gọi api
      await spaceController.getAllSpaces(req, res);

      // test xem api có trả về lỗi hay không
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: "Error: Database error" })).to.be.true;
    });
  });
  
  describe("changeFavoriteStatus", () => {
    let sandbox;
    let req, res;
  
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = { params: { id: "672de180a29a7d1dcce3b7a9" } };
      res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.stub(),
      };
  
      // Mock các phương thức trong spacesDAO
      sandbox.stub(spaceDao, "getSpaceById");
      sandbox.stub(spaceDao, "updateFavoriteStatus");
    });
  
    afterEach(() => {
      sandbox.restore();
    });
  
    const mockSpace = {
      _id: "672de180a29a7d1dcce3b7a9",
      favorite: false,
      save: async () => {
        return this;
      },
    };
  
    it("should change the favorite status successfully and return status 200", async () => {
      // Mock getSpaceById và updateFavoriteStatus
      spaceDao.getSpaceById.resolves(mockSpace);
      spaceDao.updateFavoriteStatus.resolves({
        ...mockSpace,
        favorite: !mockSpace.favorite,
      });
  
      await spaceController.changeFavoriteStatus(req, res);
  
      // Kiểm tra kết quả trả về
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({
        message: "Đã thay đổi trạng thái yêu thích thành công",
        favorite: true,
      })).to.be.true;
    });
  
    it("should return status 404 if the space does not exist", async () => {
      // Mock khi không tìm thấy không gian
      spaceDao.getSpaceById.resolves(null);
  
      await spaceController.changeFavoriteStatus(req, res);
  
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "Không gian không tồn tại" })).to.be.true;
    });
  
    it("should return status 500 on internal server error", async () => {
      // Mock lỗi từ getSpaceById
      spaceDao.getSpaceById.rejects(new Error("Database error"));
  
      await spaceController.changeFavoriteStatus(req, res);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({
        message: "Lỗi hệ thống",
        error: "Database error",
      })).to.be.true;
    });
  });
  
  


describe("getAllSpaceFavorites", () => {
  let sandbox, req, res;

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

  const mockSpaces = [
    {
      locationPoint: {
        type: "Point",
        coordinates: [105.77499242871824, 19.804795582985733],
      },
      _id: "672de180a29a7d1dcce3b7a9",
      name: "Phòng làm việc số mới",
      favorite: true,
    },
  ];

  it("should return all spaces with status 200", async () => {
    // Stub DAO
    sandbox.stub(spaceDao, "fetchAllSpaceFavorite").resolves(mockSpaces);

    // Gọi API
    await spaceController.getAllSpaceFavorites(req, res);

    // Kiểm tra status và kết quả trả về
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(mockSpaces)).to.be.true;
  });

  it("should handle errors and return status 500", async () => {
    // Stub DAO để throw lỗi
    sandbox.stub(spaceDao, "fetchAllSpaceFavorite").rejects(new Error("Database error"));

    // Gọi API
    await spaceController.getAllSpaceFavorites(req, res);

    // Kiểm tra status và lỗi trả về
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ error: "Error: Database error" })).to.be.true;
  });
});

  
describe('createNewSpace', () => {
  let req, res, createSpaceStub;

  beforeEach(() => {
    req = {
      body: {
        name: 'Test Space',
        description: 'Test description',
        location: 'Test location',
        area: 100,
        rulesId: 1,
        userId: 'user123',
        pricePerHour: 50,
        pricePerDay: 400,
        pricePerWeek: 2000,
        pricePerMonth: 8000,
        images: [
          { public_id: 'image1', url: 'http://image1.jpg' },
          { public_id: 'image2', url: 'http://image2.jpg' },
        ],
        censorship: true,
        status: 'available',
        categoriesId: [1, 2],
        appliancesId: [3, 4],
        reportCount: 0,
        isGoldenHour: true,
        goldenHourDetails: { start: '6:00', end: '9:00' },
        favorite: true,
        latLng: { lat: 10.12345, lng: 106.54321 },
      },
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };


    createSpaceStub = sinon.stub(spaceDao, 'createSpace');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should create a new space and return 201 status', async () => {
    const mockNewSpace = { id: 'space123', ...req.body };
    createSpaceStub.resolves(mockNewSpace);

    await spaceController.createNewSpace(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith({ success: true, space: mockNewSpace })).to.be.true;
  });

  it('should return 500 status when an error occurs', async () => {
    const mockError = new Error('Database error');
    createSpaceStub.rejects(mockError);

    await spaceController.createNewSpace(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({
      success: false,
      message: `Error creating space: ${mockError.message}`,
    })).to.be.true;
  });
});
  

describe('uploadImages', () => {
  let req, res;

  beforeEach(() => {
    req = {
      files: [
        { path: '/uploads/test1.jpg', filename: 'test1.jpg' },
        { path: '/uploads/test2.jpg', filename: 'test2.jpg' }
      ]
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
  });

  it('should return 200 and image details if images are uploaded successfully', async () => {
    await spaceController.uploadImages(req, res);
    expect(res.status.calledOnceWith(200)).to.be.true;
    expect(res.json.calledOnceWith({
      message: 'Images uploaded successfully',
      images: [
        { url: '/uploads/test1.jpg', public_id: 'test1.jpg' },
        { url: '/uploads/test2.jpg', public_id: 'test2.jpg' }
      ]
    })).to.be.true;
  });
  
});

describe('removeImages', () => {
  let destroyStub;

  beforeEach(() => {
    destroyStub = sinon.stub(cloudinary.uploader, 'destroy');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 200 if image is deleted successfully', async () => {
    destroyStub.resolves({ result: 'ok' });

    const req = { body: { public_id: 'samplePublicId' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    await spaceController.removeImages(req, res);

    expect(destroyStub.calledOnceWith('samplePublicId')).to.be.true; 
    expect(res.status.calledOnceWith(200)).to.be.true;
    expect(res.json.calledOnceWith({ message: 'Image deleted successfully' })).to.be.true;
  });

  it('should return 400 if image deletion fails', async () => {
    destroyStub.resolves({ result: 'not found' });

    const req = { body: { public_id: 'samplePublicId' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    await spaceController.removeImages(req, res);

    expect(destroyStub.calledOnceWith('samplePublicId')).to.be.true; 
    expect(res.status.calledOnceWith(400)).to.be.true;
    expect(res.json.calledOnceWith({
      message: 'Failed to delete image',
      result: { result: 'not found' },
    })).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    destroyStub.rejects(new Error('Cloudinary error'));

    const req = { body: { public_id: 'samplePublicId' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    await spaceController.removeImages(req, res);

    expect(destroyStub.calledOnceWith('samplePublicId')).to.be.true;
    expect(res.status.calledOnceWith(500)).to.be.true;
    expect(res.json.calledOnceWith({
      message: 'Server error',
      error: 'Cloudinary error',
    })).to.be.true;
  });
});

  describe('deleteSpace', () => {

    beforeEach(() => {
      req = {
        params: {
          id: '672de180a29a7d1dcce3b7a9', // ID của không gian cần xóa
        },
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should successfully delete space', async () => {
      // Mock phương thức deleteSpace trả về một không gian đã xóa
      sandbox.stub(spaceDao, 'deleteSpace').resolves({
        _id: '672de180a29a7d1dcce3b7a9',
        name: 'Phòng làm việc số mới',
      });

      // Gọi controller function
      await spaceController.deleteSpace(req, res);

      // Kiểm tra phản hồi trả về khi xóa thành công
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({
        _id: '672de180a29a7d1dcce3b7a9',
        name: 'Phòng làm việc số mới',
      })).to.be.true;
    });

    it('should return error if space does not exist', async () => {
      // Mock phương thức deleteSpace khi không tìm thấy không gian
      sandbox.stub(spaceDao, 'deleteSpace').resolves(null);
    
      // Gọi controller function
      await spaceController.deleteSpace(req, res);
    
      // Kiểm tra phản hồi khi không tìm thấy không gian để xóa
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({
        message: 'Space not found',
      })).to.be.true;
    });
    

    it('should return error if there is a server issue', async () => {
      // Giả sử có lỗi khi gọi deleteSpace
      sandbox.stub(spaceDao, 'deleteSpace').rejects(new Error('Server error'));
    
      // Gọi controller function
      await spaceController.deleteSpace(req, res);
    
      // Kiểm tra phản hồi khi có lỗi server
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({
        error: 'Server error',
      })).to.be.true;
    });
    
  });

  describe("Update Space Censorship and Community Standards", () => {
  
    beforeEach(() => {
      req = {
        params: { id: "672de180a29a7d1dcce3b7a9" },
        body: {
          censorship: "Chấp nhận",
          reasons: ["Reason 1", "Reason 2"],
          customReason: "Custom reason example",
        },
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      sandbox = sinon.createSandbox();
  
      // Mock các model không gọi thật vào cơ sở dữ liệu
      sandbox.stub(spaceController, 'getSpaceById').returns({
        _id: "672de180a29a7d1dcce3b7a9",
        censorship: "Chấp nhận",
        reasons: ["Reason 1", "Reason 2"],
        customReason: "Custom reason example",
        communityStandardsId: "12345"
      });
  
      sandbox.stub(spaceController, 'getCommunityStandards').returns({
        _id: "12345",
        reasons: [],
        customReason: "",
        save: sinon.stub().resolves(),
      });
    });
  
    afterEach(() => {
      sandbox.restore();
    });
  
    it("should update space censorship and community standards successfully", async () => {
      const mockSpace = {
        _id: "672de180a29a7d1dcce3b7a9",
        censorship: "Chấp nhận",
        reasons: ["Reason 1", "Reason 2"],
        customReason: "Custom reason example",
        communityStandardsId: "12345",
        save: sinon.stub().resolves(),
      };
  
      const mockCommunityStandards = {
        _id: "12345",
        reasons: [],
        customReason: "",
        save: sinon.stub().resolves(),
      };
  
      // Mock controller method thay vì model
      sandbox.stub(spaceController, 'updateSpace').resolves(mockSpace);
      sandbox.stub(spaceController, 'updateCommunityStandards').resolves(mockCommunityStandards);
  
      await spaceController.updateSpaceCensorshipAndCommunityStandards(req, res);
  
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ success: true, space: mockSpace })).to.be.true;
      expect(mockCommunityStandards.reasons).to.deep.equal(["Reason 1", "Reason 2"]);
      expect(mockCommunityStandards.customReason).to.equal("Custom reason example");
    });
  
    it("should return status 500 if there is an error updating space censorship or community standards", async () => {
      const error = new Error("Database error");
  
      // Mock lỗi khi gọi phương thức updateSpace
      sandbox.stub(spaceController, 'updateSpace').rejects(error);
  
      await spaceController.updateSpaceCensorshipAndCommunityStandards(req, res);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ success: false, message: 'Error updating space and community standards' })).to.be.true;
    });
  
    it("should return status 500 if community standards not found", async () => {
      const mockSpace = {
        _id: "672de180a29a7d1dcce3b7a9",
        censorship: "Chấp nhận",
        reasons: ["Reason 1", "Reason 2"],
        customReason: "Custom reason example",
        communityStandardsId: "non-existing-id",
        save: sinon.stub().resolves(),
      };
  
      // Mock việc không tìm thấy community standards
      sandbox.stub(spaceController, 'getCommunityStandards').resolves(null);
  
      await spaceController.updateSpaceCensorshipAndCommunityStandards(req, res);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ success: false, message: 'Error updating space and community standards' })).to.be.true;
    });
  });
  
  
  describe('searchSpaceName', () => {
    let sandbox, req, res;
  
    beforeEach(() => {
      // Khởi tạo sandbox và các đối tượng cần thiết
      sandbox = sinon.createSandbox();
      req = {
        params: { name: 'test' },  // Tên dùng để tìm kiếm
      };
      res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };
    });
  
    afterEach(() => {
      sandbox.restore();
    });
  
    it('should return search results with status 200', async () => {
      // Giả lập dữ liệu trả về từ model Spaces
      const mockSpaces = [{ id: 1, name: 'Test Space' }];
      sandbox.stub(Spaces, 'find').resolves(mockSpaces);  // Giả lập việc tìm kiếm không có lỗi
  
      await app.handle(req, res);
  
      // Kiểm tra kết quả trả về
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.send.calledWith(mockSpaces)).to.be.true;
    });
  
    it('should return 500 if an error occurs', async () => {
      // Giả lập lỗi khi truy vấn dữ liệu từ model Spaces
      sandbox.stub(Spaces, 'find').rejects(new Error('Database error'));
  
      await app.handle(req, res);
  
      // Kiểm tra lỗi trả về với status 500
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.send.calledWith({ error: 'Error: Database error' })).to.be.true;
    });
  });
  
  describe('filterSpace', () => {
    let sandbox, req, res;
  
    beforeEach(() => {
      // Khởi tạo sandbox và các đối tượng cần thiết
      sandbox = sinon.createSandbox();
      req = {
        query: {
          location: 'Hanoi',
          minPrice: 100,
          maxPrice: 500,
          category: 'office',
          areaMin: 20,
          areaMax: 50,
          applianceNames: ['air conditioner'],
        },
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
    });
  
    afterEach(() => {
      sandbox.restore();
    });
  
    it('should return filtered spaces with status 200', async () => {
      // Giả lập dữ liệu trả về từ model Spaces
      const mockSpaces = [{ id: 1, name: 'Test Space', location: 'Hanoi' }];
      sandbox.stub(Spaces, 'find').resolves(mockSpaces);  // Giả lập việc tìm kiếm không có lỗi
  
      await app.handle(req, res);
  
      // Kiểm tra kết quả trả về
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockSpaces)).to.be.true;
    });
  
    it('should return filtered spaces when applianceNames is not provided', async () => {
      // Cập nhật query không có applianceNames
      req.query.applianceNames = undefined;
  
      const mockSpaces = [{ id: 1, name: 'Test Space', location: 'Hanoi' }];
      sandbox.stub(Spaces, 'find').resolves(mockSpaces);  // Giả lập tìm kiếm không có applianceNames
  
      await app.handle(req, res);
  
      // Kiểm tra kết quả trả về
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockSpaces)).to.be.true;
    });
  
    it('should return 500 if an error occurs', async () => {
      // Giả lập lỗi khi truy vấn dữ liệu từ model Spaces
      sandbox.stub(Spaces, 'find').rejects(new Error('Database error'));
  
      await app.handle(req, res);
  
      // Kiểm tra lỗi trả về với status 500
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ error: 'Error: Database error' })).to.be.true;
    });
  });

  
  describe('similarSpace', () => {
    let sandbox, req, res;
  
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = {
        params: { id: '12345' },  // Giả lập tham số id
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
    });
  
    afterEach(() => {
      sandbox.restore();
    });
  
    it('should return similar spaces when found', async () => {
      // Giả lập dữ liệu trả về từ fetchSimilarSpaces
      const mockSpaces = [{ id: 1, name: 'Test Space', categoriesId: '12345' }];
      
      // Stub phương thức fetchSimilarSpaces từ DAO
      sandbox.stub(spaceDao, 'fetchSimilarSpaces').resolves(mockSpaces);
  
      // Gọi controller
      await spaceController.getSimilarSpaces(req, res);
  
      // Kiểm tra status và dữ liệu trả về
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockSpaces)).to.be.true;
    });
  
    it('should return 400 if no similar spaces are found', async () => {
      // Giả lập trường hợp không tìm thấy không gian tương tự
      sandbox.stub(spaceDao, 'fetchSimilarSpaces').resolves([]);
  
      // Gọi controller
      await spaceController.getSimilarSpaces(req, res);
  
      // Kiểm tra status và thông báo lỗi
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ message: 'not found' })).to.be.true;
    });
  
    it('should return 500 if there is a server error', async () => {
      // Giả lập lỗi trong quá trình gọi fetchSimilarSpaces
      sandbox.stub(spaceDao, 'fetchSimilarSpaces').rejects(new Error('Database error'));
  
      // Gọi controller
      await spaceController.getSimilarSpaces(req, res);
  
      // Kiểm tra lỗi trả về
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: 'Error: Database error' })).to.be.true;
    });
  });
  
  
  describe('updateSpace', () => {
    let sandbox, req, res;
  
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = {
        params: { id: '12345' },  // Giả lập tham số id
        body: {  // Giả lập dữ liệu cập nhật
          name: 'Updated Space',
          pricePerHour: 100,
          pricePerDay: 200,
          pricePerWeek: 600,
          pricePerMonth: 2400,
          images: [{ public_id: 'img1', url: 'img1url' }],
          location: 'New Location',
          latLng: [10.123, 20.456],
          categoriesId: 'abc123',
          appliancesId: { _id: 'appliance1' },
          rulesId: { _id: 'rule1' },
          isGoldenHour: true,
          goldenHourDetails: 'Golden hour details',
        },
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
    });
  
    afterEach(() => {
      sandbox.restore();
    });
  
    it('should update space successfully', async () => {
      // Giả lập dữ liệu trả về từ các phương thức
      sandbox.stub(spaceDao, 'updateSpace').resolves({ id: '12345', ...req.body });
      sandbox.stub(Rules, 'findByIdAndUpdate').resolves({ id: 'rule1' });
      sandbox.stub(Appliances, 'findByIdAndUpdate').resolves({ id: 'appliance1' });
  
      await app.handle(req, res);
  
      // Kiểm tra status và dữ liệu trả về
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({ success: true, space: { id: '12345', ...req.body } })).to.be.true;
    });
  
    it('should return 404 if rulesId is not found', async () => {
      // Giả lập không tìm thấy rulesId
      sandbox.stub(Rules, 'findByIdAndUpdate').resolves(null);
  
      await app.handle(req, res);
  
      // Kiểm tra status và thông báo lỗi
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ success: false, message: 'Error updating space: rule not found' })).to.be.true;
    });
  
    it('should return 404 if appliancesId is not found', async () => {
      // Giả lập không tìm thấy appliancesId
      sandbox.stub(Appliances, 'findByIdAndUpdate').resolves(null);
  
      await app.handle(req, res);
  
      // Kiểm tra status và thông báo lỗi
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ success: false, message: 'Error updating space: appliances not found' })).to.be.true;
    });
  
    it('should return 500 if an error occurs during the update process', async () => {
      // Giả lập lỗi trong quá trình cập nhật không gian
      sandbox.stub(spaceDao, 'updateSpace').rejects(new Error('Database error'));
  
      await app.handle(req, res);
  
      // Kiểm tra status và thông báo lỗi
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ success: false, message: 'Error updating space: Database error' })).to.be.true;
    });
  });
  
  describe("compareSpaces", () => {
    it("should return comparison result with status 200", async () => {
      const space1 = {
        images: ["image1.jpg"],
        name: "Space 1",
        location: "Location 1",
        area: 100,
        pricePerHour: 50,
        pricePerDay: 300,
        pricePerWeek: 2000,
        pricePerMonth: 8000,
        status: "available",
        latLng: { lat: 10, lng: 20 },
      };

      const space2 = {
        images: ["image2.jpg"],
        name: "Space 2",
        location: "Location 2",
        area: 120,
        pricePerHour: 60,
        pricePerDay: 360,
        pricePerWeek: 2400,
        pricePerMonth: 9600,
        status: "unavailable",
        latLng: { lat: 15, lng: 25 },
      };

      req.query = { id1: "1", id2: "2" };

      // Mock data return by the model
      sandbox.stub(Spaces, "findById").onFirstCall().resolves(space1).onSecondCall().resolves(space2);

      // Call the controller method
      await spaceController.compareSpaces(req, res);

      // Check the status and the response JSON
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({
        space1: {
          images: "image1.jpg",
          name: "Space 1",
          location: "Location 1",
          area: 100,
          pricePerHour: 50,
          pricePerDay: 300,
          pricePerWeek: 2000,
          pricePerMonth: 8000,
          status: "available",
          latLng: { lat: 10, lng: 20 }
        },
        space2: {
          images: "image2.jpg",
          name: "Space 2",
          location: "Location 2",
          area: 120,
          pricePerHour: 60,
          pricePerDay: 360,
          pricePerWeek: 2400,
          pricePerMonth: 9600,
          status: "unavailable",
          latLng: { lat: 15, lng: 25 }
        }
      })).to.be.true;
    });

    it("should return 404 if one or both spaces are not found", async () => {
      req.query = { id1: "1", id2: "2" };

      // Mock Spaces.findById to return null for the second space
      sandbox.stub(Spaces, "findById").onFirstCall().resolves(null).onSecondCall().resolves(null);

      await spaceController.compareSpaces(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "Không tìm thấy một hoặc cả hai sản phẩm" })).to.be.true;
    });

    it("should handle errors and return status 500", async () => {
      req.query = { id1: "1", id2: "2" };

      // Mock Spaces.findById to throw an error
      sandbox.stub(Spaces, "findById").rejects(new Error("Database error"));

      await spaceController.compareSpaces(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: "Đã xảy ra lỗi khi so sánh sản phẩm" })).to.be.true;
    });
  });

  describe('GET /spaces/:id', () => {
    let app;
    let sandbox;
    let mockSpace;
  
    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use("/spaces", spaceRouter);
  
      sandbox = sinon.createSandbox();
  
      // Mock dữ liệu của không gian
      mockSpace = {
        _id: "12345",
        name: "Test Space",
        userId: "67890",
        rulesId: ["rule1", "rule2"],
        appliancesId: ["appliance1"],
        categoriesId: "category1",
        communityStandardsId: "standard1",
      };
    });
  
    afterEach(() => {
      sandbox.restore();  // Đảm bảo sandbox được restore sau mỗi test
    });
  
    it('should return 200 and space details when space is found', async () => {
      const findByIdStub = sandbox.stub(Spaces, "findById").resolves(mockSpace);
      const populateStub = sandbox.stub().returnsThis();
      const execStub = sandbox.stub().resolves(mockSpace);
  
      findByIdStub.returns({ populate: populateStub });
      populateStub.returns({ exec: execStub });
  
      const response = await supertest(app)
        .get('/spaces/12345')  // Đường dẫn của API
        .expect(200);
  
      expect(response.body).to.deep.equal(mockSpace);
    });
  
    it('should return 400 if space is not found', async () => {
      const findByIdStub = sandbox.stub(Spaces, "findById").resolves(null);
      const populateStub = sandbox.stub().returnsThis();
      const execStub = sandbox.stub().resolves(null);
  
      findByIdStub.returns({ populate: populateStub });
      populateStub.returns({ exec: execStub });
  
      const response = await supertest(app)
        .get('/spaces/12345')
        .expect(400);
  
      expect(response.body).to.deep.equal({ message: "Space not found" });
    });
  
    it('should return 500 if there is a server error', async () => {
      const findByIdStub = sandbox.stub(Spaces, "findById").rejects(new Error("Database error"));
  
      const response = await supertest(app)
        .get('/spaces/12345')
        .expect(500);
  
      expect(response.body).to.deep.equal({ message: "Error: Database error" });
    });
  });
  

  describe("spaceByUserId", () => {
    it("should return a list of spaces with status 200", async () => {
      const spaces = [
        {
          _id: "1",
          name: "Space 1",
          location: "Location 1",
          userId: "user1",
          area: 100,
          pricePerHour: 50,
        },
        {
          _id: "2",
          name: "Space 2",
          location: "Location 2",
          userId: "user1",
          area: 150,
          pricePerHour: 70,
        }
      ];

      req.params.id = "user1";

      // Mock data return by the model
      sandbox.stub(Spaces, "find").resolves(spaces);

      // Call the controller method
      await spaceController.getSpacesByUserId(req, res, next);

      // Check the status and the response JSON
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(spaces)).to.be.true;
    });

    it("should return 404 if no spaces found for the user", async () => {
      req.params.id = "user2";

      // Mock Spaces.find to return an empty array
      sandbox.stub(Spaces, "find").resolves([]);

      await spaceController.getSpacesByUserId(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "Space not found" })).to.be.true;
    });

    it("should call next with an error if there is a system error", async () => {
      req.params.id = "user1";

      // Mock Spaces.find to throw an error
      sandbox.stub(Spaces, "find").rejects(new Error("Database error"));

      await spaceController.getSpacesByUserId(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal("Database error");
    });
  });

  describe("acceptPost", () => {
    it("should successfully update censorship field and return the updated space", async () => {
      const postId = "12345";
      const censorship = "approved";
      const updatedSpace = {
        _id: postId,
        censorship: censorship,
        name: "Test Space",
        location: "Test Location",
        area: 100,
      };

      req.params.postId = postId;
      req.body.censorship = censorship;

      // Mock Spaces.findOneAndUpdate to return the updated space
      sandbox.stub(Spaces, "findOneAndUpdate").resolves(updatedSpace);

      // Call the controller method
      await spaceController.updateSpaceCensorship(req, res, next);

      // Check that status 200 is called and the updated space is returned
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(updatedSpace)).to.be.true;
    });

    it("should return 404 if postSpace is not found", async () => {
      const postId = "12345";
      const censorship = "approved";

      req.params.postId = postId;
      req.body.censorship = censorship;

      // Mock Spaces.findOneAndUpdate to return null (not found)
      sandbox.stub(Spaces, "findOneAndUpdate").resolves(null);

      await spaceController.updateSpaceCensorship(req, res, next);

      // Check that status 404 is returned
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "PostSpace not found" })).to.be.true;
    });

    it("should call next with an error if there is a system error", async () => {
      const postId = "12345";
      const censorship = "approved";

      req.params.postId = postId;
      req.body.censorship = censorship;

      // Mock Spaces.findOneAndUpdate to throw an error
      sandbox.stub(Spaces, "findOneAndUpdate").rejects(new Error("Database error"));

      await spaceController.updateSpaceCensorship(req, res, next);

      // Check that next() is called with the error
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal("Database error");
    });
  });


});
