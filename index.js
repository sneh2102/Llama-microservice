const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(cors());

app.use(express.json());

app.post('/', async (req, res) => {
    try {
        console.log('Received request to generate model');
        const { model, prompt, stream } = req.body;
        console.log(`Sending request to generate model with prompt: ${prompt}`);

        const response = await axios.post('http://localhost:11434/api/generate', {
            model,
            prompt,
            stream
        }, {
            responseType: 'stream'
        });

        if (response.status === 200) {
            console.log('Received response from the API');

            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Transfer-Encoding', 'chunked');

            response.data.on('data', (chunk) => {
                res.write(chunk);
            });

            response.data.on('end', () => {
                console.log('Stream ended');
                res.end();
            });

            response.data.on('error', (err) => {
                console.error('Stream error:', err);
                res.status(500).send('An error occurred while streaming');
            });
        } else {
            console.error(`Unexpected response status: ${response.status}`);
            res.status(500).send(`Unexpected response status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        res.status(500).send(`An error occurred: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});