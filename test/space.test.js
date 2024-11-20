import { expect } from "chai";
import sinon from "sinon";
import spaceController from "../controllers/spaces.js";
import { spaceDao } from "../dao/index.js";
import Spaces from "../models/spaces.js";
import cloudinary from "../cloudinary.config.js";
import express from 'express';
import spaceRouter from '../routes/spaces.js'; 

describe("Space Controller-Tests", () => {
  let req, res, sandbox,app;

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

    describe("getAllSpacesApply", () => {
      it("should return all users with status 200", async () => {
        const mockSpaces = [
          { id: 1, name: 'Space 1',censorship: "Chấp nhận" },
          { id: 2, name: 'Space 2',censorship: "Chấp nhận" },
      ];
        sandbox.stub(spaceDao, "fetchAllSpacesApply").resolves(mockSpaces);

        await spaceController.getAllSpacesApply(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith(mockSpaces)).to.be.true;
      });

      it("should handle errors and return status 500", async () => {
        sandbox.stub(spaceDao, "fetchAllSpacesApply").rejects(new Error("Database error"));

        await spaceController.getAllSpacesApply(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWith({ error: "Error: Database error" })).to.be.true;
      });
    });

  describe("getAllSpaces", () => {

    it("should return all users with status 200", async () => {
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
      sandbox.stub(spaceDao, "fetchAllSpaces").resolves(mockSpaces);

      await spaceController.getAllSpaces(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockSpaces)).to.be.true;
    });

    it("should handle errors and return status 500", async () => {
      sandbox.stub(spaceDao, "fetchAllSpaces").rejects(new Error("Database error"));

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
  
});
