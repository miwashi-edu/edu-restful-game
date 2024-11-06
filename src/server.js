const app = require('./app');
const {initNPC} = require('./npc');

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`Server started on port ${PORT}`);
    initNPC();
});