const mysql = require('mysql2/promise');
require('dotenv').config();

const migrationSQL = `
CREATE TABLE IF NOT EXISTS unit_conversions (
  id INT NOT NULL AUTO_INCREMENT,
  parent_unit_id INT NOT NULL,
  child_unit_id INT NOT NULL,
  conversion_factor FLOAT NOT NULL COMMENT 'How many child units make 1 parent unit',
  created_at DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  updated_at DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (id),
  INDEX fk_unit_conversions_parent_idx (parent_unit_id ASC),
  INDEX fk_unit_conversions_child_idx (child_unit_id ASC),
  UNIQUE KEY unique_parent_child (parent_unit_id, child_unit_id),
  CONSTRAINT fk_unit_conversions_parent
    FOREIGN KEY (parent_unit_id)
    REFERENCES unit_id (idunit_id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_unit_conversions_child
    FOREIGN KEY (child_unit_id)
    REFERENCES unit_id (idunit_id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci
COMMENT = 'Stores unit conversion relationships and factors';
`;

async function runMigration() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '123',
            database: process.env.DB_NAME || 'reoxpos'
        });

        console.log('Connected to database successfully');
        
        await connection.execute(migrationSQL);
        
        console.log('✅ Migration completed successfully!');
        console.log('✅ Table "unit_conversions" created');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runMigration();
