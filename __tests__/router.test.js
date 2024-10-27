require('dotenv').config();
const express = require('express');
const router = require('./../routes/routes.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(router);

describe('Router Tests', () => {
    it('should render the home page', async () => {
        const req = {
            session: { user: { email: 'user@example.com' } },
        };
        const res = {
            render: jest.fn(),
        };

        await router.handle(req, res);

        expect(res.render).toHaveBeenCalledWith("pages/home", { session: req.session });
    });

    it('should render the new-label page', async () => {
        const req = {
            session: { user: { email: 'user@example.com' } },
        };
        const res = {
            render: jest.fn(),
        };

        await router.handle(req, res);

        expect(res.render).toHaveBeenCalledWith("pages/new-label", { session: req.session });
    });
});
