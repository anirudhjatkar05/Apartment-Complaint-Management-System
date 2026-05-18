const { sequelize } = require('./config/database');

async function run() {
    try {
        const [results] = await sequelize.query("DESCRIBE Complaints;");
        console.log("Complaints table schema:");
        console.table(results);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
