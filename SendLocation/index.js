const express = require('express');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.set('view engine', "ejs");

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers
    return distance;
}

function findNearestLocation(myLat, myLon, locations) {
    let nearestLocation = null;
    let minDistance = Infinity;

    for (const location of locations) {
        const distance = haversineDistance(myLat, myLon, location.lat, location.lon);

        if (distance < minDistance) {
            minDistance = distance;
            nearestLocation = location;
        }
    }

    return nearestLocation;
}

app.get('/', (req, res) => {
    res.render('home');
})
app.post('/mess', (req, res) => {
    const { myLat, myLon, user1Lat, user1Lon, user2Lat, user2Lon, user3Lat, user3Lon } = req.body;

    const locations = [
        { name: "Ramesh", lat: user1Lat, lon: user1Lon },
        { name: "Bhupesh", lat: user2Lat, lon: user2Lon },
        { name: "Ramani", lat: user3Lat, lon: user3Lon }
    ];

    const nearest = findNearestLocation(myLat, myLon, locations);

    if (nearest) {
        const distance = haversineDistance(myLat, myLon, nearest.lat, nearest.lon);
        
        // Redirect to GET /mess with query parameters
        res.redirect(`/mess?name=${nearest.name}&distance=${distance.toFixed(2)}`);
    } else {
        res.redirect(`/mess?name=No+nearest+location+found&distance=N%2FA`);
    }
});

// GET route to render mess.ejs
app.get('/mess', (req, res) => {
    const { name, distance } = req.query;
    res.render('mess', { name, distance });
});



app.listen(3000);