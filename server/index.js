const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/sessions', (req, res) => {
    res.json([])
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});