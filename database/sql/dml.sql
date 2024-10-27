
DELIMITER ;  

DROP PROCEDURE IF EXISTS new_account; 

DELIMITER ;; 
CREATE PROCEDURE new_account(
    IN in_email VARCHAR(100),  
    IN in_password VARCHAR(100),
    IN in_verification_token VARCHAR(200)
)
BEGIN
    INSERT INTO account
        (email, password, verification_token)
    VALUES 
        (in_email, in_password, in_verification_token);  
END;;

DELIMITER ;  

DROP PROCEDURE IF EXISTS get_account; 

DELIMITER ;; 
CREATE PROCEDURE get_account(
    IN in_identifier VARCHAR(100)
)
BEGIN
    SELECT 
        *
    FROM account
    WHERE email = in_identifier
    OR id = in_identifier;
END;;

DELIMITER ;  

DROP PROCEDURE IF EXISTS verify_account; 

DELIMITER ;; 
CREATE PROCEDURE verify_account(
    IN in_identifier VARCHAR(100)
)
BEGIN
    UPDATE account
    SET verified = 1
    WHERE email = in_identifier;
END;;

DELIMITER ;  

DROP PROCEDURE IF EXISTS insert_image; 

DELIMITER ;; 
CREATE PROCEDURE insert_image(
    IN in_email VARCHAR(100),
    IN in_user_id INT,
    IN in_image_name VARCHAR(100),
    IN in_image_id VARCHAR(100)
)
BEGIN
    INSERT INTO image
        (email, owner_id, image_name, label_id)
    VALUES 
        (in_email, in_user_id, in_image_name, in_image_id);  
END;;

DELIMITER ;  

DROP PROCEDURE IF EXISTS insert_label; 

DELIMITER ;; 
CREATE PROCEDURE insert_label(
    IN in_id INT,
    IN in_email VARCHAR(100),
    IN in_icons VARCHAR(400),
    IN in_text VARCHAR(400),
    IN in_audio_name VARCHAR(100),
    IN in_qrname VARCHAR(100),
    IN in_design INT,
    IN in_imageid VARCHAR(100),
    IN in_private BOOLEAN,
    IN in_private_key INT
)
BEGIN
    INSERT INTO label
        (owner_id, owner_email, icons, text, audio_name, qrname, design, image_id, private, private_key)
    VALUES 
        (in_id, in_email, in_icons, in_text, in_audio_name, in_qrname, in_design, in_imageid, in_private, in_private_key);  
END;;

DELIMITER ;  

DROP PROCEDURE IF EXISTS insert_audio; 

DELIMITER ;; 
CREATE PROCEDURE insert_audio(
    IN in_id INT,
    IN in_email VARCHAR(100),
    IN in_audio_name VARCHAR(100)
)
BEGIN
    INSERT INTO audio
        (owner_id, owner_email, audio_name)
    VALUES 
        (in_id, in_email, in_audio_name);  
END;;

DELIMITER ;  

DROP PROCEDURE IF EXISTS get_all_labels; 

DELIMITER ;; 
CREATE PROCEDURE get_all_labels(
    IN in_identifier VARCHAR(100)
)
BEGIN
    SELECT * FROM label 
    WHERE in_identifier = owner_email
    OR in_identifier = owner_id
    ;
END;;

DELIMITER ;  

DROP PROCEDURE IF EXISTS get_label; 

DELIMITER ;; 
CREATE PROCEDURE get_label(
    IN in_identifier VARCHAR(100)
)
BEGIN
    SELECT * FROM label 
    WHERE in_identifier = qrname
    OR in_identifier = id
    OR in_identifier = audio_name
    ;
END;;

DELIMITER ;  

DROP PROCEDURE IF EXISTS get_label_images; 

DELIMITER ;; 
CREATE PROCEDURE get_label_images(
    IN in_image_id VARCHAR(100)
)
BEGIN
    SELECT * FROM image
    WHERE in_image_id = label_id
    ;
END;;

DELIMITER ;  

DROP PROCEDURE IF EXISTS delete_label; 

DELIMITER ;; 
CREATE PROCEDURE delete_label(
    IN in_id INT,
    IN image_id VARCHAR(100),
    IN in_audio_name VARCHAR(100)
)
BEGIN
     DELETE FROM image
    WHERE label_id = image_id;
    
    DELETE FROM audio
    WHERE in_audio_name = audio_name;

    DELETE FROM label
    WHERE id = in_id;
END;;

DELIMITER ;  

DROP PROCEDURE IF EXISTS edit_label; 

DELIMITER ;; 
CREATE PROCEDURE edit_label(
    IN in_id INT,
    IN in_owner_id VARCHAR(100),
    IN in_owner_email VARCHAR(100),
    IN in_icons VARCHAR(200),
    IN in_text VARCHAR(200),
    IN in_audio_name VARCHAR(100),
    IN in_design INT,
    IN in_image_id VARCHAR(100)
)
BEGIN
    UPDATE label
     SET 
        owner_id = in_owner_id,
        owner_email = in_owner_email,
        icons = in_icons,
        text = in_text,
        audio_name = in_audio_name,
        design = in_design,
        image_id = in_image_id
    WHERE id = in_id
    ;
END;;

DELIMITER ;  


DROP PROCEDURE IF EXISTS insert_admin; 

DELIMITER ;; 
CREATE PROCEDURE insert_admin(
    IN in_email VARCHAR(200),
    IN in_password VARCHAR(200)
)
BEGIN
    INSERT INTO account
    (email, password, verified, role)
    VALUES
    (in_email, in_password, 1, "admin")
    ;
END;;

DELIMITER ;  


DROP PROCEDURE IF EXISTS get_all_accounts; 

DELIMITER ;; 
CREATE PROCEDURE get_all_accounts()
BEGIN
    SELECT 
    id,
    email,
    verification_token,
    role,
    verified,
    deactivated
    FROM account
    ;
END;;

DELIMITER ;  


DROP PROCEDURE IF EXISTS deactivate_account; 

DELIMITER ;; 
CREATE PROCEDURE deactivate_account(
    IN identifier VARCHAR(200)
)
BEGIN
    UPDATE account
    SET deactivated = 1
    WHERE identifier = CAST(id AS CHAR) 
    OR identifier = email
    ;
END;;

DELIMITER ;  

DROP PROCEDURE IF EXISTS activate_account; 

DELIMITER ;; 
CREATE PROCEDURE activate_account(
    IN identifier VARCHAR(200)
)
BEGIN
    UPDATE account
    SET deactivated = 0
    WHERE identifier = CAST(id AS CHAR) 
    OR identifier = email
    ;
END;;

DELIMITER ;  