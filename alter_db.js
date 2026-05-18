const { sequelize } = require('./config/database');

async function run() {
    try {
        await sequelize.authenticate();
        
        const queries = [
            "ALTER TABLE Complaints ADD COLUMN userId INT DEFAULT NULL;",
            "ALTER TABLE Complaints ADD COLUMN assignedStaffId INT DEFAULT NULL;",
            "ALTER TABLE Complaints ADD COLUMN title VARCHAR(255);",
            "ALTER TABLE Complaints ADD COLUMN description TEXT;",
            "ALTER TABLE Complaints ADD COLUMN category VARCHAR(255);",
            "ALTER TABLE Complaints ADD COLUMN priority VARCHAR(255) DEFAULT 'Medium';",
            "ALTER TABLE Complaints ADD COLUMN apartmentNumber VARCHAR(255) DEFAULT 'N/A';",
            "ALTER TABLE Complaints ADD COLUMN status VARCHAR(255) DEFAULT 'Pending';",
            "ALTER TABLE Complaints ADD COLUMN adminComment TEXT;",
            "ALTER TABLE Complaints ADD COLUMN staffProgressNote TEXT;",
            "ALTER TABLE Users ADD COLUMN department VARCHAR(255) DEFAULT 'General';"
        ];

        for (const query of queries) {
            try {
                await sequelize.query(query);
                console.log("Success:", query);
            } catch (e) {
                console.log("Skipped (probably exists):", query.split(' ADD COLUMN ')[1].split(' ')[0]);
            }
        }

        console.log("Done adding missing columns.");
    } catch (err) {
        console.log("Connection error:", err.message);
    } finally {
        process.exit();
    }
}
run();
