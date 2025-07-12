const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", function (req, res) {
  const query = req.body.cityName;
  const unit = req.body.metricUnit;
  const apiKey = "b1896347519fec3dba527b997fc6ac7c";

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=${unit}&appid=${apiKey}`;

  https.get(url, function (response) {
    let rawData = "";
    response.on("data", function (chunk) {
      rawData += chunk;
    });

    response.on("end", function () {
      try {
        const weatherData = JSON.parse(rawData);

        if (weatherData.cod != 200) {
          return res.send(`
            <h1>City not found!</h1>
            <a href="/">Try Again</a>
          `);
        }

        const temp = weatherData.main.temp;
        const description = weatherData.weather[0].description;
        const icon = weatherData.weather[0].icon;
        const imageURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;

        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Weather Result</title>
            <style>
              body {
                background: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80') no-repeat center center fixed;
                background-size: cover;
                font-family: 'Poppins', sans-serif;
                color: white;
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
              }

              .weather-box {
                background: rgba(0, 0, 0, 0.5);
                border-radius: 15px;
                padding: 30px;
                text-align: center;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
              }

              .weather-box h1 {
                font-size: 28px;
                margin-bottom: 15px;
              }

              .weather-box p {
                font-size: 18px;
                margin: 10px 0;
              }

              .weather-box img {
                width: 100px;
              }

              .back-link {
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                background: #00aaff;
                color: white;
                text-decoration: none;
                border-radius: 8px;
              }

              .back-link:hover {
                background: #0088cc;
              }
            </style>
          </head>
          <body>
            <div class="weather-box">
              <h1>The temperature in ${query} is ${temp}° (${unit})</h1>
              <p>Weather is currently: ${description}</p>
              <img src="${imageURL}" alt="weather icon" />
              <br>
              <a class="back-link" href="/">Check Another City</a>
            </div>
          </body>
          </html>
        `;

        res.send(html);
      } catch (err) {
        res.send("<h1>Error fetching weather data. Try again.</h1><a href='/'>Back</a>");
      }
    });
  });
});

app.listen(3000, function () {
  console.log("✅ Server is running on http://localhost:3000");
});
