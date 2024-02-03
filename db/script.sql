CREATE or REPLACE TABLE token_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    decimals INT NULL,
    logoURI VARCHAR(511),
    symbol VARCHAR(50) NULL,
    name VARCHAR(255) NULL,
    liquidity DECIMAL(40, 20),
    last_update DECIMAL(13,0),
    mc DECIMAL(40, 20),
    UNIQUE KEY unique_address (address)
);

CREATE or REPLACE TABLE token_historical_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_id INT,
    close DECIMAL(20, 10) NOT NULL,
    high DECIMAL(25, 13) NOT NULL,
    low DECIMAL(20, 10) NOT NULL,
    open DECIMAL(20, 10) NOT NULL,
    type VARCHAR(10) NOT NULL,
    unixTime DECIMAL(13,0) NOT NULL,
    volume DECIMAL(40, 20) NOT NULL,
    FOREIGN KEY (token_id) REFERENCES token_details(id),
    UNIQUE KEY unique_token_unixTime (token_id, unixTime)
);
