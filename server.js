const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());

app.use(bodyParser.json({ limit: '50mb' }));

const PORT = process.env.PORT || 5000;
const OPENAI_API_URL = 'https://models.inference.ai.azure.com/chat/completions';
let reqCount = 0;
app.post('/v1/chat/completions', async (req, res) => {
    console.log(`req ${reqCount++} ${req.body.model}`);
    try {
        const github = axios.create({ 
            baseURL: OPENAI_API_URL,
            headers: {
                'Authorization': `${req.headers.authorization}`,
                'Content-Type': 'application/json'
            },
            responseType: req.body.stream ? 'stream' : 'json',
        });

        const response = await github.post('', req.body);

        if (req.body.stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            response.data.pipe(res);
            console.log(`res ${reqCount} ${req.body.model} done`);
        }
        else {
            res.json(response.data);
            res.end();
            console.log(`res ${reqCount} ${req.body.model} done`);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Failed to get response from OpenAI'
        });
    }
});

app.get('/v1/models', async (_, res) => {
    res.json({
        "object": "list",
        "data": [
          {
            "id": "gpt-4o",
            "object": "model",
            "created": 1677610602,
            "owned_by": "openai"
          },
          {
            "id": "gpt-4o-mini",
            "object": "model",
            "created": 1677610602,
            "owned_by": "openai"
          },
          {
            "id": "o1-preview",
            "object": "model",
            "created": 1677610602,
            "owned_by": "openai"
          },
        ]
    }
        );
});
                

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
