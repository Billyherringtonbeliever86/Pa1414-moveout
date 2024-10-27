const jwt = require('jsonwebtoken');
const db = require('./db-modules.js');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');


async function checkLogin(password, user) {
    let success = false;
    if (!user) {
        flashMessage = "User not found!";
        return {flashMessage, success};
    } else if (user) {
        let test = await this.unhashPassword(password, user.email)
        console.log("test: ",test)
        if (test != true) {
            flashMessage = "Wrong password";
            return {flashMessage, success};
        } else if (user.verified != 1){
            flashMessage = "Account not verified"
            return {flashMessage, success};
        } else if (user.deactivated == true) {
            flashMessage = "Account is deactivated"
            return {flashMessage, success};
        } else {
            flashMessage = `Welcome ${user.email}`;
            success = true;
            return {flashMessage, success};
        }
    }
    return {flashMessage, success};
}

async function checkSignUp(credentials) {
    const user = await db.getAccount(credentials.email);
    // console.log(user)
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])[A-Za-z\d]{6,20}$/;

    if (user) {
        flashMessage = "Account already exists";
    } else if (!regex.test(credentials.password)) {
        flashMessage = "Password format incorrect";
    } else {
        flashMessage = true;
    }
    
    return flashMessage;
}

async function unhashPassword(password, identifier) {
    const user = await db.getAccount(identifier);
    const result = await bcrypt.compare(password, user.password);
    // console.log(result, user)
    return result;
}

async function hashedPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    
    const hashedPassword = await bcrypt.hash(password, salt);
    
    return hashedPassword;
}

function signToken(data) {
    const token = jwt.sign(data,
        process.env.JWT_SECRET,
        { expiresIn: '1h' });

    return token;
}

function saveAudioFile(audioData) {
    const base64Data = audioData.split(',')[1]; 
    const buffer = Buffer.from(base64Data, 'base64')
    const name = `${Date.now()}.wav`;
    const filePath = path.join(process.env.PROJECT_DIR, '/public/audio', name);

    fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            console.error('Error saving the audio file:', err);
        } else {
            console.log('Audio file saved successfully:', filePath);
        }
    });

    return name;
}

async function generateQR (labelId) {
    const labelUrl = `http://localhost:3000/view-label?labelId=${labelId}`;
    const qrCodePath = path.join(process.env.PROJECT_DIR, '/public/qrcodes',  `${labelId}`);
    try {
        await QRCode.toFile(qrCodePath, labelUrl);
        console.log(`QR Code generated at ${qrCodePath}`);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Error generating QR Code.');
    }
}


async function checkAdmin() {
    if (await db.getAccount("admin@admin")) {
       
        return
        
    } else {
        password = await this.hashedPassword(process.env.ADMIN_PASSWORD)
        credentials = {
            "email": process.env.ADMIN_EMAIL,
            "password": password,
        }
        await db.insertAdmin(credentials);
        return
    }
}

// Never got used:
// async function getUserDataTotal(user) {
//     const labels = await db.getAllLabels(user)
//     let data = 0;
//     let images = await Promise.all(
//         labels.map(async (label) => {
//             if (label.image_id) {
//                let imageObjects = await db.getAllLabelImages(label.image_id);
//                let imageNames = imageObjects.map(image => {
//                 return image.image_name;
//                })
//                return imageNames;
//             } else {
//                 return null; 
//             }
//         })
//     );

//     images = images.filter(iamge => iamge != null);
//     images = images.flat();
    
//     let audios = await Promise.all(labels.map(async (label) => {
//         if (label.audio_name) {
//             return label.audio_name;
//         }
//         return null;
//     }))
//     audios = audios.filter(audio => audio != null);

//     const qrImages = await Promise.all(labels.map(async (label) => {
//         if (label.qrname) {
//             return label.qrname;
//         }
//         return null;
//     }));
    
//     let dataChunk = 0;
//     for (const image of images) {
//         const path = process.env.PROJECT_DIR + "/public/images/uploads/" + ""
//         dataChunk = fs.stat(path, (err, stats) => {
//             if (err) {
//                 console.error('Error reading the file:', err);
//                 return;
//             }
//             return stats.size
//         });
//         data += dataChunk;
//     }
//     console.log("images: ", images,"Audios: ", audios, "qrs: ", qrImages, "data: ", data )
// }


module.exports = {
    "checkAdmin":  checkAdmin,
    "generateQR": generateQR,
    "saveAudioFile": saveAudioFile,
    "signToken": signToken,
    "checkLogin":  checkLogin,
    "checkSignUp": checkSignUp,
    "hashedPassword": hashedPassword,
    "unhashPassword": unhashPassword
}