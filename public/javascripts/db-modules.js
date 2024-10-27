const db = require('./db.js');
const jwt = require('jsonwebtoken');
// const modules = require('./modules.js');

async function getEveryLabel() {
    const connection = await db.pool.getConnection();
    const result = await connection.query('SELECT * FROM label;');
    connection.release();
    return result;
}

async function newAccount(credentials) {
    const connection = await db.pool.getConnection();

    const token = jwt.sign({email: credentials.email},
        process.env.JWT_SECRET,
        { expiresIn: '1h' });

    const result = await connection.query('CALL new_account(?, ?, ?)', 
        [credentials.email, credentials.password, token]);
    connection.release();
    return result;
}

async function getAccount(identifier) {
    const connection = await db.pool.getConnection();
    const result = await connection.query('CALL get_account(?)',
        identifier
    );
    connection.release();
    return result[0][0];
}

async function getAllAccounts() {
    const connection = await db.pool.getConnection();
    const result = await connection.query('CALL get_all_accounts()');
    connection.release();
    return result[0];
}

async function getToken(identifier) {
    const connection = await db.pool.getConnection();
    const result = await connection.query(`SELECT verification_token
        FROM account
        WHERE email = ?
        OR id = ?;`,
        [identifier, identifier]);
    connection.release();
    return result;
}

async function verifyAccount(email) {
    const connection = await db.pool.getConnection();
    await connection.query('CALL verify_account(?);',
        email);
    connection.release();
}

async function insertImages(user, uploadedFiles, imageId) {
    const imageNames = uploadedFiles.map(image => {
        return image.filename
    })
    const connection = await db.pool.getConnection();
    
    for (const name of imageNames) {
        await connection.query('CALL insert_image(?,?,?,?);',
            [user.email, user.id, name, imageId ]);
    }
    
    connection.release();
}

async function insertLabel(data) {
    const connection = await db.pool.getConnection();
    await connection.query('CALL insert_label(?,?,?,?,?,?,?,?,?,?);',
        [data.id, data.email, `${data.icons}`, data.text, data.audioName, 
            data.qrname, data.design, data.imageId, data.private, data.private_key]);
    connection.release();
}

async function insertAudio(data) {
    const connection = await db.pool.getConnection();
    await connection.query('CALL insert_audio(?,?,?);',
        [data.id, data.email, data.audio]);
    connection.release();
}

async function getAllLabels(user) {
    const connection = await db.pool.getConnection();
    const result = await connection.query('CALL get_all_labels(?);',
        user);
    connection.release();
    return result[0];
}

async function countTotalLabels() {
    const connection = await db.pool.getConnection();
    const result = await connection.query('CALL count_total_labels();');
    connection.release();
    return result;
}

async function getLabel(identifier) {
    const connection = await db.pool.getConnection();
    const result = await connection.query('CALL get_label(?);', identifier);
    connection.release();
    return result[0][0];
}

async function getAllLabelImages(imageId) {
    const connection = await db.pool.getConnection();
    const result = await connection.query('CALL get_label_images(?);', [imageId]);
    // console.log("resut: ", result)
    connection.release();
    return result[0];
}

async function deleteLabel(id, imageId, audioName) {
    const connection = await db.pool.getConnection();
    const result = await connection.query('CALL delete_label(?,?,?);', 
        [id, imageId, audioName]);
    // console.log("resut: ", result)
    connection.release();
    return result[0];
}

async function editLabel(data) {
    const connection = await db.pool.getConnection();
    const result = await connection.query('CALL edit_label(?,?,?,?,?,?,?,?);', 
        [data.id, data.owner_id, data.owner_email, `${data.icons}`, data.text, 
            data.audio_name, data.design, data.image_id]);
   
    connection.release();
}

async function insertAdmin(credentials) {
    const connection = await db.pool.getConnection();
    await connection.query('CALL insert_admin(?,?);',
        [credentials.email, credentials.password]);
    connection.release();
}

async function deactivateAccount(identifier) {
    const connection = await db.pool.getConnection();
    const user = await this.getAccount(identifier);
    if (user.deactivated == 0) {
        await connection.query('CALL deactivate_account(?);',[identifier]);
    } else {
        await connection.query('CALL activate_account(?);',[identifier]);
    }
    connection.release();
}

module.exports = {
    "deactivateAccount": deactivateAccount,
    "getEveryLabel": getEveryLabel,
    "getAllAccounts": getAllAccounts,
    "insertAdmin": insertAdmin,
    "editLabel":  editLabel,
    "deleteLabel": deleteLabel,
    "getAllLabelImages": getAllLabelImages,
    "getLabel": getLabel,
    "countTotalLabels": countTotalLabels,
    "getAllLabels": getAllLabels,
    "insertAudio": insertAudio,
    "insertLabel": insertLabel,
    "insertImages": insertImages,
    "verifyAccount": verifyAccount,
    "newAccount" : newAccount,
    "getAccount": getAccount,
    "getToken": getToken
}