import { transactionDao } from "../dao/transactionDao.js";
import {
  createTransaction,
  generateOrderId,
  verifySignature,
  isSuccess,
} from "../externals/vnpay.js";
import { TransactionsModel } from "../models/transactionsModel.js";
import Users from "../models/users.js";

export const transactionCreate = async (req, res) => {
  const { amount, userId, type, beneficiaryAccountNumber, beneficiaryBankCode } = req.body;
  try {
    if (amount <= 0) {
      res.status(400).json({ message: "Yêu cầu không hợp lệ" });
      return;
    }
    const user = await Users.findById(userId);
    if (!user) {
      res.status(400).json({ message: "Yêu cầu không hợp lệ" });
      return;
    }

    if (type === "Nạp tiền") {
      const orderId = generateOrderId();

      const data = await createTransaction(
        orderId,
        amount,
        `${user.username} nap tien vao tai khoan`
      );

      transactionDao.save({
        userId,
        amount,
        description: `${user.fullname} nạp tiền vào tài khoản`,
        orderId,
        type,
        status: "Khởi tạo",
      });
      res.status(200).json(data);
      return;
    } else if (type === "Rút tiền") {
      if (!user.balanceAmount || user.balanceAmount < Number(amount) || !beneficiaryAccountNumber || !beneficiaryBankCode) {
        res
          .status(400)
          .json({ message: "Số dư không đủ để thực hiện yêu cầu" });
        return;
      }
      await Users.updateOne(
        { _id: userId },
        { balanceAmount: user.balanceAmount - Number(amount) }
      );
      await transactionDao.save({
        userId,
        amount,
        description: `${user.fullname} rút tiền từ tài khoản`,
        orderId: "SYSTEM" + new Date().getTime(),
        type,
        status: "Khởi tạo",
        beneficiaryAccountNumber,
        beneficiaryBankCode
      });
      res.status(200).json({ message: "Khởi tạo giao dịch thành công" });
      return;
    }

    res.status(400).json({ message: "Yêu cầu không hợp lệ" });
    return;
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

export const transactionConfirmMomo = async (req, res) => {
  const {
    accessKey,
    amount,
    extraData,
    message,
    orderId,
    orderInfo,
    orderType,
    partnerCode,
    payType,
    requestId,
    responseTime,
    resultCode,
    transId,
    signature,
  } = req.body;
  try {
    if (
      !verifySignature(
        {
          accessKey,
          amount,
          extraData,
          message,
          orderId,
          orderInfo,
          orderType,
          partnerCode,
          payType,
          requestId,
          responseTime,
          resultCode,
          transId,
        },
        signature
      )
    ) {
      res.status(404).json({ message: "not found" });
      return;
    }
    const transaction = await TransactionsModel.findOne({ orderId });
    if (!transaction || transaction.status !== "Khởi tạo") {
      res.status(404).json({ message: "not found" });
      return;
    } else {
      if (transaction.type === "Nạp tiền") {
        await TransactionsModel.updateOne(
          { _id: transaction._id.toString() },
          { status: isSuccess(resultCode) ? "Thành công" : "Thất bại", amount }
        );

        if (isSuccess(resultCode)) {
          const user = await Users.findById(transaction.userId);
          await Users.updateOne(
            { _id: transaction.userId },
            { balanceAmount: user.balanceAmount + Number(amount) }
          );
        }
        res.status(200).json({ message: "success" });
        return;
      }
      res.status(404).json({ message: "not found" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "not found" });
    return;
  }
};


export const transactionConfirm = async (req, res) => {  
  const {
    vnp_Amount,
    vnp_BankCode,
    vnp_BankTranNo,
    vnp_CardType,
    vnp_OrderInfo,
    vnp_PayDate,
    vnp_ResponseCode,
    vnp_TmnCode,
    vnp_TransactionNo,
    vnp_TransactionStatus,
    vnp_TxnRef,
    vnp_SecureHash
} = req.body;
  try {
    if (
      !verifySignature(
        {
          vnp_Amount,
          vnp_BankCode,
          vnp_BankTranNo,
          vnp_CardType,
          vnp_OrderInfo: encodeURIComponent(vnp_OrderInfo).replace(/%20/g, '+'),
          vnp_PayDate,
          vnp_ResponseCode,
          vnp_TmnCode,
          vnp_TransactionNo,
          vnp_TransactionStatus,
          vnp_TxnRef
        },
        vnp_SecureHash
      )
    ) {
      res.status(404).json({ message: "not found" });
      return;
    }
    const amount = Number(vnp_Amount) /100;
    const transaction = await TransactionsModel.findOne({ orderId: vnp_TxnRef });
    if (!transaction || transaction.status !== "Khởi tạo") {
      res.status(404).json({ message: "not found" });
      return;
    } else {
      if (transaction.type === "Nạp tiền") {
        await TransactionsModel.updateOne(
          { _id: transaction._id.toString() },
          { status: isSuccess(vnp_ResponseCode) ? "Thành công" : "Thất bại", amount }
        );

        if (isSuccess(vnp_ResponseCode)) {
          const user = await Users.findById(transaction.userId);
          await Users.updateOne(
            { _id: transaction.userId },
            { balanceAmount: user.balanceAmount + Number(amount) }
          );
        }
        res.status(200).json({ message: "success" });
        return;
      }
      res.status(404).json({ message: "not found" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "not found" });
    return;
  }
};

///http://localhost:3000/addfund/result?partnerCode=MOMO&orderId=MOMO1731137931267&requestId=MOMO1731137931267&amount=1000&orderInfo=undefined+n%E1%BA%A1p+ti%E1%BB%81n+v%C3%A0o+t%C3%A0i+kho%E1%BA%A3n&orderType=momo_wallet&transId=4225107942&resultCode=0&message=Successful.&payType=qr&responseTime=1731137968770&extraData=&signature=2068ac90836a9aacdefd4995b58ed03f0b1f1d27046b7ca371b92175bb5437a6
export const getAllTransaction = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ message: "bad request" });
      return;
    }
    const user = await Users.findById(userId);
    if (!user) {
      res.status(400).json({ message: "bad request" });
      return;
    }

    const transactionList = await TransactionsModel.find({ userId }).sort({
      createdAt: -1,
    });
    const dataRes = transactionList.map((transaction) => {
      return {
        transactionId: transaction._id.toString(),
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        status: transaction.status,
        createdAt: transaction.createdAt.toLocaleString(),
      };
    });
    res
      .status(200)
      .json({ balanceAmount: user.balanceAmount, transactionList: dataRes });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "bad request" });
  }
};

export const adminGetAllTransaction = async (req, res) => {
  try {
    const { searchParams } = req.query;
    const searchQuery = {};
    if (searchParams) {
      searchQuery['$or'] = [
        { orderId: new RegExp(searchParams, 'i') }, 
        { description: new RegExp(searchParams, 'i') }, 
        { 'userId.fullname': new RegExp(searchParams, 'i') },
        { 'userId.gmail': new RegExp(searchParams, 'i') },
        { 'user.phone': new RegExp(searchParams, 'i') }
      ];
    }
    const transactionList = await TransactionsModel.find(searchQuery)
    .populate({
      path: 'userId',
      select: 'fullname gmail phone'  // Only select these fields from the User model
    }).sort({
      createdAt: -1,
    })
    .exec();
    const dataRes = transactionList.map((transaction) => {
      return {
        transactionId: transaction._id.toString(),
        userInfo: [transaction.userId.fullname, transaction.userId.gmail, transaction.userId.phone].join("\n"),
        orderId: transaction.orderId,
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        status: transaction.status,
        createdAt: transaction.createdAt.toLocaleString(),
      };
    });
    res
      .status(200)
      .json({ transactionList: dataRes });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "bad request" });
  }
};

export const adminConfirmTransaction = async (req, res) => {
  try {
    const { transactionId, result } = req.body;
    console.log(transactionId)
    const transaction = await TransactionsModel.findById({ _id: transactionId }).populate({path: "userId", select: "fullname"});

    if (!transaction) {
      res.status(400).json({ message: "Yêu cầu không hợp lệ" });
      return;
    }
    
    if (result === "Đồng ý - Khởi tạo") {
      if (transaction.beneficiaryBankCode === "MOMO") {
        res.status(200).json({ 
          transactionId,
          beneficiaryBankCode: transaction.beneficiaryBankCode, 
          beneficiaryAccountNumber: transaction.beneficiaryAccountNumber,
          amount: transaction.amount,
          qrUrl: "https://test-payment.momo.vn/payment-platform/images/qr-code-download-app.png"
        });
        return;
      } else {
        res.status(200).json({ 
          transactionId,
          beneficiaryBankCode: transaction.beneficiaryBankCode, 
          beneficiaryAccountNumber: transaction.beneficiaryAccountNumber,
          amount: transaction.amount,
          qrUrl: `https://img.vietqr.io/image/${transaction.beneficiaryBankCode}-${transaction.beneficiaryAccountNumber}-compact2.jpg?amount=${transaction.amount}&addInfo=${transaction.description}&accountName=${transaction.userId.fullname}`});
        return;
      }
    }

    if (result === "Đồng ý - Xác nhận") {
      await TransactionsModel.updateOne({_id: transactionId}, {status: "Thành công"})
      res.status(200).json({ message: "Xác nhận thanh toán giao dịch rút tiền thành công" });
      return
    }

    if (result === "Từ chối - Xác nhận") {
      await TransactionsModel.updateOne({_id: transactionId}, {status: "Thất bại"})   
      
      const user = await Users.findById(transaction.userId)
      await Users.updateOne(
        { _id: transaction.userId },
        { balanceAmount: user.balanceAmount + Number(transaction.amount) }
      );
      res.status(200).json({ message: "Đã từ chối giao dịch rút tiền" });
      return
    }

  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "bad request" });
  }
};
