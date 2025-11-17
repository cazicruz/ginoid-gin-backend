const axios = require('axios');

const pingServer = async () => {
    try {
        const response = await axios.get(process.env.SERVER_ROUTE); // Replace with your server's URL
        if (response.status === 200) {
            console.log(`Server is reachable ${new Date().toISOString()}`);
        } else {
            console.log(`Server is unreachable ${new Date().toISOString()}`);
        }
    } catch (error) {
        console.error('Error pinging server:', error.message);
    }
};

// Call the function to ping the server

module.exports=pingServer;