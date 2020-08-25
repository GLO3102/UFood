const request = require('request')
const fs = require('fs')
const uuidv4 = require('uuid').v4
const { Client } = require('@googlemaps/google-maps-services-js')
const mongoose = require('mongoose')
const Restaurant = require('../repositories/restaurant').model

const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost/ufood'
const googleApiKey = process.env.GOOGLE_API_KEY || 'YOUR_API_KEY'

const googleClient = new Client()

const MAX_REQUESTS_PER_LOCATION = 15

const IMAGES_DIR = './images'

const LOCATIONS = [
  // QUEBEC
  {
    latitude: 46.81783,
    longitude: -71.23343
  },
  // MONTREAL
  {
    latitude: 45.50533,
    longitude: -73.55249
  },
  // SHERBROOKE
  {
    latitude: 45.404476,
    longitude: -71.888351
  }
]

const downloadImg = (photoReference, filename) => {
  return new Promise((resolve, reject) => {
    const url = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoReference}&sensor=false&key=${googleApiKey}&maxwidth=1600&maxheight=1600`
    request(url)
      .pipe(fs.createWriteStream(`${IMAGES_DIR}/${filename}.jpg`))
      .on('close', resolve)
  })
}

const formatOpeningHourPeriod = period => {
  if (!period) {
    return null
  }

  const start = `${period.open.time.substring(0, 2)}:${period.open.time.substring(2)}`
  const end = `${period.close.time.substring(0, 2)}:${period.close.time.substring(2)}`

  return `${start}-${end}`
}

const loadRestaurants = async () => {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR)
  }

  for (const location of LOCATIONS) {
    console.log(`Searching nearby location ${location.latitude}, ${location.longitude}`)

    let pageToken
    let requestCount = 0

    do {
      const {
        data: { results, next_page_token }
      } = await googleClient.placesNearby({
        params: {
          location,
          radius: 500000,
          key: googleApiKey,
          keyword: 'food',
          pagetoken: pageToken
        },
        timeout: 10000
      })

      pageToken = next_page_token
      requestCount++

      for (const result of results) {
        if (await Restaurant.exists({ place_id: result.place_id })) {
          continue
        }

        const {
          data: { result: detailsResult }
        } = await googleClient.placeDetails({
          params: {
            key: googleApiKey,
            place_id: result.place_id
          },
          timeout: 10000
        })

        if (detailsResult.photos) {
          for (const photo of detailsResult.photos.slice(0, 10)) {
            const id = uuidv4()
            await downloadImg(photo.photo_reference, id)
          }
        }

        await Restaurant.create({
          name: detailsResult.name,
          location: {
            type: 'Point',
            coordinates: [detailsResult.geometry.location.lng, detailsResult.geometry.location.lat]
          },
          place_id: detailsResult.place_id,
          tel: detailsResult.formatted_phone_number,
          address: detailsResult.formatted_address,
          price_range: detailsResult.price_level,
          rating: detailsResult.rating,
          pictures: (detailsResult.photos || []).map(p => `/${p.filename}.jpg`),
          opening_hours: !detailsResult.opening_hours
            ? {}
            : {
                sunday: formatOpeningHourPeriod(
                  detailsResult.opening_hours.periods.find(o => o.close && o.close.day === 0)
                ),
                monday: formatOpeningHourPeriod(
                  detailsResult.opening_hours.periods.find(o => o.close && o.close.day === 1)
                ),
                tuesday: formatOpeningHourPeriod(
                  detailsResult.opening_hours.periods.find(o => o.close && o.close.day === 2)
                ),
                wednesday: formatOpeningHourPeriod(
                  detailsResult.opening_hours.periods.find(o => o.close && o.close.day === 3)
                ),
                thursday: formatOpeningHourPeriod(
                  detailsResult.opening_hours.periods.find(o => o.close && o.close.day === 4)
                ),
                friday: formatOpeningHourPeriod(
                  detailsResult.opening_hours.periods.find(o => o.close && o.close.day === 5)
                ),
                saturday: formatOpeningHourPeriod(
                  detailsResult.opening_hours.periods.find(o => o.close && o.close.day === 6)
                )
              }
        })
      }
    } while (pageToken && requestCount < MAX_REQUESTS_PER_LOCATION)
  }
}

try {
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  loadRestaurants().then(() => {
    mongoose.disconnect()
  })
} catch (err) {
  console.log(err)
  mongoose.disconnect()
}
