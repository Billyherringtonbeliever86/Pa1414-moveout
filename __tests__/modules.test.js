require('dotenv').config();
const path = require('path');
const QRCode = require('qrcode');
const db = require('./../public/javascripts/db-modules.js');
const modules = require('./../public/javascripts/modules.js');

jest.mock('qrcode');
jest.mock('./../public/javascripts/db-modules.js');

describe('checkLogin', () => {
    it('should return user not found message if user is undefined', async () => {
        const result = await modules.checkLogin('password', undefined);
        expect(result).toEqual({ flashMessage: 'User not found!', success: false });
    });

    it('should return wrong password message if password is incorrect', async () => {
        const user = { email: 'user@example.com', verified: 1, deactivated: false };
        jest.spyOn(modules, 'unhashPassword').mockResolvedValue(false);
        const result = await modules.checkLogin('wrong_password', user);
        expect(result).toEqual({ flashMessage: 'Wrong password', success: false });
    });

    it('should return account not verified message if user is not verified', async () => {
        const user = { email: 'user@example.com', verified: 0, deactivated: false };
        jest.spyOn(modules, 'unhashPassword').mockResolvedValue(true);
        const result = await modules.checkLogin('password', user);
        expect(result).toEqual({ flashMessage: 'Account not verified', success: false });
    });

    it('should return account deactivated message if user is deactivated', async () => {
        const user = { email: 'user@example.com', verified: 1, deactivated: true };
        jest.spyOn(modules, 'unhashPassword').mockResolvedValue(true);
        const result = await modules.checkLogin('password', user);
        expect(result).toEqual({ flashMessage: 'Account is deactivated', success: false });
    });

    it('should return welcome message if login is successful', async () => {
        const user = { email: 'user@example.com', verified: 1, deactivated: false };
        jest.spyOn(modules, 'unhashPassword').mockResolvedValue(true);
        const result = await modules.checkLogin('password', user);
        expect(result).toEqual({ flashMessage: 'Welcome user@example.com', success: true });
    });
});

describe('generateQR', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should generate QR code and save it to the specified path', async () => {
        QRCode.toFile.mockResolvedValue(undefined);
        const labelId = '12345';
        const expectedPath = path.join(process.env.PROJECT_DIR, '/public/qrcodes', labelId);
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        await modules.generateQR(labelId);
        expect(QRCode.toFile).toHaveBeenCalledWith(expectedPath, `http://localhost:3000/view-label?labelId=${labelId}`);
        expect(consoleLogSpy).toHaveBeenCalledWith(`QR Code generated at ${expectedPath}`);
        consoleLogSpy.mockRestore();
    });

    it('should log an error if QR code generation fails', async () => {
        QRCode.toFile.mockRejectedValue(new Error('QR Code generation failed'));
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        await modules.generateQR('12345', res);
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
});

describe('checkAdmin', () => {
    it('should do nothing if admin account exists', async () => {
        db.getAccount.mockResolvedValue(true);
        await modules.checkAdmin();
        expect(db.getAccount).toHaveBeenCalledWith(process.env.ADMIN_EMAIL);
        expect(db.insertAdmin).not.toHaveBeenCalled();
    });

    it('should create admin account if it does not exist', async () => {
        db.getAccount.mockResolvedValue(false);
        jest.spyOn(modules, 'hashedPassword').mockResolvedValue('hashed_password');
        await modules.checkAdmin();
        expect(db.getAccount).toHaveBeenCalledWith(process.env.ADMIN_EMAIL);
        expect(modules.hashedPassword).toHaveBeenCalledWith(process.env.ADMIN_PASSWORD);
        expect(db.insertAdmin).toHaveBeenCalledWith({
            email: process.env.ADMIN_EMAIL,
            password: 'hashed_password',
        });
    });
});
