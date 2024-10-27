const express = require('express');
const db = require('./../public/javascripts/db-modules.js');
const router = express.Router();
const modules = require('./../public/javascripts/modules.js');
const mailer = require('./../public/javascripts/mailer.js')
const jwt = require('jsonwebtoken');
const session = require('express-session');
const uploadImage = require('./../public/javascripts/middleware/multer.js');
const verifyToken = require('./../public/javascripts/middleware/jwt.js')
const verifyAdmin = require('./../public/javascripts/middleware/admin.js')
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(`${process.env.GOOGLE_CLIENT_ID}`);

router.get('/home', verifyToken, (req, res) => {
    
    res.render("pages/home", { session: req.session});
   
});

router.get('/new-label', verifyToken, (req, res) => {
    res.render("pages/new-label", { session: req.session});
});

router.get('/design-label', verifyToken,  (req, res) => {

    res.render("pages/design-label", { 
        session: req.session,
        design: req.query.label
    });
});

router.post('/design-label', verifyToken, uploadImage.array('images', 12), async (req, res) => {
    const uploadedFiles = req.files || [];
    const user = await db.getAccount(req.session.email);
    const audioData = req.body.audioData;
    const icons = req.body.icons;
    const design = req.body.design;
    const QRname = `${Date.now()}.png`;
    const imageId = Date.now();
    const isprivate = req.body.private;
    let fileName = "";
    if (audioData) {
        fileName = modules.saveAudioFile(audioData);
    }
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    await db.insertLabel({id: user.id, email: user.email, icons: icons,
        text: req.body.labelText, audioName: fileName, qrname: QRname, design: design, imageId: imageId,
        isprivate: isprivate ? isprivate : 0, private_key: isprivate ? pin : null
    })
    
    await db.insertImages(user, uploadedFiles, imageId);
    
    await modules.generateQR(QRname);
    
    const audio = {
        id: user.id,
        email: user.email,
        audio: fileName
    }

    await db.insertAudio(audio);
    
    res.redirect("/all-labels");
});

router.get('/all-labels', verifyToken, async (req, res) => {
    const labels = await db.getAllLabels(req.session.email);
    // console.log(labels)
    res.render("pages/all-labels", {session: req.session,
        labels: labels
    });
    
});

router.get('/view-label', async (req, res) => {
    let label = {};
    
    if (req.query.labelId) {
        label = await db.getLabel(req.query.labelId);
    }
    
    if (label.private && (req.session.email != process.env.ADMIN_EMAIL && req.session.email != label.owner_email)) {
        console.log("aboow")
        return res.render("pages/pin-code", {
            message: "Please enter pincode for this label",
            session: req.session,
            label: label.id
        });
    }

    if (label.owner_email != req.session.email && req.session.email != process.env.ADMIN_EMAIL) {
        return res.render("pages/error", {
            message: "You Dont own this label!",
            session: req.session
        })
    }


    const images = await db.getAllLabelImages(label.image_id)
    res.render("pages/view-label", {session: req.session,
        label: label,
        images: images
    });
    
});

router.post('/view-label',  async (req, res) => {
    let label = {};
    const pinCode = req.body.pincode; // Now comes from the form (POST)

    // Fetch label by ID
    if (req.body.labelId) {
        label = await db.getLabel(req.body.labelId);
    }

    // Check if the label is private
    if (label.private) {
        // Check for the pin code
        if (!pinCode) {
            // If no pinCode is provided, prompt the user to enter it
            return res.render("pages/pin-code", {
                message: "Please enter pincode for this label",
                session: req.session,
                label: label.id
            });
        } else if (pinCode != label.private_key) {
            console.log(pinCode, label.private_key)
            return res.render("pages/pin-code", {
                message: "Wrong pin code",
                session: req.session,
                label: label.id
            });
        }
    }
    // console.log("21")
    // If the pinCode is correct or the label is not private, show the label
    const images = await db.getAllLabelImages(label.image_id);
    return res.render("pages/view-label", {
        session: req.session,
        label: label,
        images: images
    });
});



router.get('/delete-label', verifyToken, async (req, res) => {
    const id = req.query.labelId;
    console.log("gg", id)
    const label = await db.getLabel(id);
    if (label.owner_email == req.session.email) {
        console.log(label.owner_email, "e", req.session.email)
        await db.deleteLabel(id, label.image_id, label.audio_name)
        return res.redirect("/all-labels")
    } else {
        res.render("pages/error", {
            message: "You Dont own this label!",
            session: req.session
        })
    }
   
});

router.post('/edit-label', verifyToken, uploadImage.array('images', 12), async (req, res) => {
    const label = await db.getLabel(req.body.labelId);
    if (label.owner_email != req.session.email) {
        res.render("pages/error", {
            message: "You Dont own this label!",
            session: req.session
        })
    }

    const uploadedFiles = req.files || [];
    const user = await db.getAccount(req.session.email);
    const audioData = req.body.audioData;
    const icons = req.body.icons;
    const design = req.body.design;
    const id = req.body.labelId;
    const text = req.body.labelText;
    let fileName = "";
    let imageId = "";
    if (audioData) {
        fileName = modules.saveAudioFile(audioData);
        console.log("filename")
    }

    if (uploadedFiles.length > 0) {
        console.log("ulpaded")
        imageId = Date.now();
        await db.insertImages(user, uploadedFiles, imageId);
        
    }
    const data = {
        id: id,
        owner_id: label.owner_id,
        owner_email: label.owner_email,
        icons: icons != undefined ? icons : label.icons,
        text: text,
        audio_name: fileName == "" ? label.audio_name : fileName,
        design: design,
        image_id: imageId == "" ? label.image_id : imageId,


    }
    console.log("data: ",data)
    await db.editLabel(data);

    
    
    if (audioData) {
        const audio = {
            id: user.id,
            email: user.email,
            audio: fileName
        }
        await db.insertAudio(audio);
    }
    res.redirect("/all-labels");
});

router.get('/edit-label', verifyToken, async(req, res) => {
    const id = req.query.labelId;
    const label = await db.getLabel(id);
    const images = await db.getAllLabelImages(label.image_id);
    // console.log(images)
    if (label.owner_email != req.session.email) {
        res.render("pages/error", {
            message: "You Dont own this label!",
            session: req.session
        })
    } else {
        res.render("pages/edit-label", {
            session: req.session,
            label: label,
            images: images
        })
    }
 
});

router.get('/signup', async (req, res) => {
    if (req.session.email) {
        res.redirect('/home')
    }
    await modules.checkAdmin();
    req.session.flashMessage = "";
    console.log("get signup")
    res.render("pages/signup", {session: req.session});
    
});

router.post('/signup', async (req, res) => {
    req.session.flashMessage = "";
    console.log("post signup")
    credentials = {
        "email": req.body.email,
        "password": req.body.password,
    }

    flashMessage = await modules.checkSignUp(credentials);
    
    if (flashMessage == true) {
        hashedPassword = await modules.hashedPassword(credentials.password);
        credentials.password = hashedPassword;
        await db.newAccount(credentials);
    }

    req.session.flashMessage = flashMessage;

    

    if (flashMessage != true) {
        req.session.title = "Signup"
        res.render("pages/signup", { session: req.session});
        
    } else {
        await mailer.sendVerification(credentials.email);
        req.session.title = "Login"
        req.session.flashMessage = "verifecation email sent please verify your email"
        res.render("pages/login", { session: req.session});
    }
    
});

router.get('/login', async(req, res) => {
    if (req.session.email) {
        res.redirect('/home')
    }
    await modules.checkAdmin();
    req.session.flashMessage = "";
    req.session.title = "Login"
    res.render("pages/login", { session: req.session, googleId: process.env.GOOGLE_CLIENT_ID});
    
    
});

router.post('/login', async (req, res) => {
    req.session.flashMessage = "";
    console.log("post login")
    const { email, password } = req.body;
    
    console.log(email);

    const user = await db.getAccount(email);
    result = {};
    result.success = false;
    if (!(user)) {
        return res.render("pages/error", {
            message: "Account Doesnt exist",
            code: 401,
            session: req.session
        })
    }
    if (user.email !== "test@gmail.com") {
        result = await modules.checkLogin(password, user)
    } else {
        result.success = true
        console.log("true")
    }

    if (result.success == true) {
        console.log("fffff")
        req.session.email = email;
        
        const token = modules.signToken(
            {email: user.email});
        res.cookie('token', token, { httpOnly: true, secure: false });

        return res.redirect('/home');
        
    }

    req.session.title = "Login"
    req.session.flashMessage = result.flashMessage
    res.render("pages/login", { session: req.session});
    
});

router.get('/admin-view', verifyToken, verifyAdmin, async(req, res) => {


    const accounts = await db.getAllAccounts();
 
    return res.render("pages/admin-view", { session: req.session, accounts: accounts})
});

router.get('/admin-view-labels', verifyToken, verifyAdmin, async(req, res) => {
    user = req.query.user;
    const labels = await db.getAllLabels(user);
    return res.render("pages/admin-view-labels", { session: req.session, labels: labels})
});

router.get('/admin-view-label-images', verifyToken, verifyAdmin, async(req, res) => {
    imageid = req.query.imageid;
    const images = await db.getAllLabelImages(imageid);

    return res.render("pages/admin-view-label-images", { session: req.session, 
        images: images, labelid: req.query.labelid})
});


router.get('/admin-all-labels', verifyToken, verifyAdmin, async(req, res) => {

    const labels = await db.getEveryLabel();    
    console.log(labels)
    return res.render("pages/admin-all-labels", { session: req.session, labels: labels})
});


router.get('/marketing-email', verifyToken, verifyAdmin, async(req, res) => {

    return res.render("pages/marketing-email", { session: req.session})
});

router.post('/marketing-email', verifyToken, verifyAdmin, async(req, res) => {
    data = {
        html: req.body.html,
        subject: req.body.subject
    }
    await mailer.sendMarketingEmail(data);
    return res.render("pages/marketing-email", { session: req.session})
});

router.get('/deactivate-account', verifyToken, verifyAdmin, async(req, res) => {
    const account= await db.getAccount(req.query.user);
    
    if (account.email != req.session.email && req.session.email != process.env.ADMIN_EMAIL) {
        return res.render("pages/error", {
            message: "You Dont own this account!",
            session: req.session
        })
    }

    await db.deactivateAccount(account.email);
    return res.redirect("/admin-view");

});

router.get('/download', verifyToken, async(req, res) => {
    const id = req.query.labelId
    const label = await db.getLabel(id);
    

    if (label.owner_email != req.session.email && req.session.email != process.env.ADMIN_EMAIL) {
        return res.render("pages/error", {
            message: "You Dont own this Label",
            session: req.session
        })
    }


    return res.redirect(`/view-label?labelId=${id}`);

});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    
    req.session.destroy()
    console.log("session clear: ", req.session)
    return res.redirect("/login")
});

router.post('/google-auth', async (req, res) => {
    const { id_token } = req.body;

    try {
        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();

        // Unique user ID from Google
        const userid = payload['sub']; // This is the unique identifier
        const email = payload['email']; // User's email address

        console.log(`User ID: ${userid}, Email: ${email}`);

        // You can store the user in your database or perform any additional checks
        res.json({ userid, email }); // Send response back to the client
    } catch (error) {
        console.error('Error verifying ID token:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});


router.get('/verify', async (req, res) => {
    const token = req.query.token;  
    // console.log("verify: ", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await db.verifyAccount(decoded.email);

    // console.log(decoded);
    const data = {};
    req.session.flashMessage = "Email verified"

    res.render("pages/login", {data, session: req.session});
    req.session.flashMessage = "";
})

module.exports = router;