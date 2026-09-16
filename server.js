const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.static("public"));

const apiKey = process.env.OPENWEATHER_API_KEY;
console.log(apiKey);

app.get("/weather", async(req,res)=>{
    const city = req.query.city;
    const units = req.query.units || "metric";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
});

app.get("/weather/location", async(req, res) => {
    const {lat, lon} = req.query;
    const units = req.query.units || "metric";

    const url =
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;

    const response = await fetch(url);

    const data = await response.json();

    res.json(data);
})

app.get("/test", (req,res)=>{
    res.send("Backend is working!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});