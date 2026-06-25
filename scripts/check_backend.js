const http = require('http');

function checkPort(port) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/api',
            method: 'GET',
            timeout: 2000
        };
        const req = http.request(options, (res) => {
            console.log(`Port ${port} STATUS: ${res.statusCode}`);
            resolve(true);
        });
        req.on('error', (e) => {
            console.log(`Port ${port} Error: ${e.message}`);
            resolve(false);
        });
        req.end();
    });
}

async function run() {
    console.log('Checking ports 5000 and 5001...');
    const p5000 = await checkPort(5000);
    const p5001 = await checkPort(5001);

    if (p5000 || p5001) {
        console.log('Backend appears to be running!');
        process.exit(0);
    } else {
        console.log('Backend not reachable.');
        process.exit(1);
    }
}

run();
