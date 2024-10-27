DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS image;
DROP TABLE IF EXISTS lable;
DROP TABLE IF EXISTS audio;
DROP TABLE IF EXISTS lable2image;
CREATE TABLE account (
    id INT AUTO_INCREMENT NOT NULL,
    email VARCHAR(100),
    password VARCHAR(100),
    verification_token VARCHAR(200),
    verified BOOLEAN DEFAULT 0,  
    role VARCHAR(20) DEFAULT "user",
    deactivated BOOLEAN DEFAULT 0,
    PRIMARY KEY(id)
);

CREATE TABLE label (
    id INT AUTO_INCREMENT NOT NULL,
    owner_id INT,
    owner_email VARCHAR(100),
    icons VARCHAR(400),
    text VARCHAR(400), 
    PRIMARY KEY(id),
    audio_name VARCHAR(100),
    design INT,
    qrname VARCHAR(100),
    image_id VARCHAR(100),
    private BOOLEAN default 0,
    private_key INT,
    FOREIGN KEY (owner_id) REFERENCES account(id) ON DELETE CASCADE 
);

CREATE TABLE image (
    id INT AUTO_INCREMENT NOT NULL,
    email VARCHAR(100),
    owner_id INT,
    image_name VARCHAR(100),
    label_id VARCHAR(100),
    PRIMARY KEY(id),
    FOREIGN KEY (owner_id) REFERENCES account(id) ON DELETE CASCADE

);


CREATE TABLE audio (
    id INT AUTO_INCREMENT NOT NULL,
    owner_id INT,
    owner_email VARCHAR(100),
    audio_name VARCHAR(100),
    PRIMARY KEY(id),
    FOREIGN KEY (owner_id) REFERENCES account(id) ON DELETE CASCADE
);

CREATE TABLE label2image (
    label_id INT,
    image_id INT,
    FOREIGN KEY (label_id) REFERENCES label(id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES image(id) ON DELETE CASCADE
);