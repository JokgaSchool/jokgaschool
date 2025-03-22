const express = require("express");
const router = express.Router();

router.get("/ping", (req, res) => {
    const startTime = Date.now();

    res.status(200).json({ 
        message: "Server is alive!", 
        responseTime: `${Date.now() - startTime}ms`,
        code: res.statusCode
    });
});

module.exports = router;
