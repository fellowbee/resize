const sharp = require('sharp');
const axios = require('axios');
const express = require('express');

// Initialize Express app
const app = express();

// Function to download image from URL
async function downloadImage(url) {
  const response = await axios({ url, responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

// Function to resize the image with different options
async function resizeImage(imageBuffer, option, outputWidth = 1920) {
  const aspectRatio = 16 / 9;
  const outputHeight = Math.round(outputWidth / aspectRatio);

  let image = sharp(imageBuffer);

  switch (option) {
    case 'fill':
      // Stretch/compress the image to fill the 16:9 container without maintaining aspect ratio
      return image
        .resize(outputWidth, outputHeight, {
            withoutEnlargement:true,
            fit: "cover",
            tint: "({ r: 220, g: 250, b: 50 })",
           
        })
        .modulate({
            saturation: 1.5, // Increase saturation by 50%
            brightness: 1.1, // Increase brightness slightly
            hue: 10 // Slight hue shift (optional for more color effect)
        })
        .normalize() // Normalize the image to boost the vibrancy
        .toBuffer();

    case 'top':
      // Crop the image with the top aligned (focus on top part of the image)
      return image
        .resize(outputWidth, outputHeight, {
          fit: sharp.fit.cover,
          tint: "({ r: 220, g: 250, b: 50 })",
          position: "top", // Object-position: top
        })
        .modulate({
            saturation: 1.5, // Increase saturation by 50%
            brightness: 1.1, // Increase brightness slightly
            hue: 10 // Slight hue shift (optional for more color effect)
        })
        .normalize() // Normalize the image to boost the vibrancy
        .toBuffer();

    case 'bottom':
      // Crop the image with the bottom aligned (focus on bottom part of the image)
      return image
        .resize(outputWidth, outputHeight, {
          fit: sharp.fit.cover,
          position: "bottom", // Object-position: bottom
          tint: "({ r: 220, g: 250, b: 50 })",
        })
        .modulate({
            saturation: 1.5, // Increase saturation by 50%
            brightness: 1.1, // Increase brightness slightly
            hue: 10 // Slight hue shift (optional for more color effect)
        })
        .normalize() // Normalize the image to boost the vibrancy
        .toBuffer();

    case 'fit':
    default:
      // Maintain aspect ratio, resize to fit inside the 16:9 container, letterboxing applied if necessary
      return image
        .resize(outputWidth, outputHeight, {
          fit: sharp.fit.inside,
          position: sharp.strategy.entropy, // Maintain content within bounds
          tint: "({ r: 220, g: 250, b: 50 })",
        })
        .modulate({
            saturation: 1.5, // Increase saturation by 50%
            brightness: 1.1, // Increase brightness slightly
            hue: 10 // Slight hue shift (optional for more color effect)
        })
        .normalize() // Normalize the image to boost the vibrancy
        .toBuffer();
  }
}

// Route to serve the resized image
app.get('/resize', async (req, res) => {
  const { imageUrl, option } = req.query; // Get image URL and option from query params

  if (!imageUrl || !option) {
    return res.status(400).send('Image URL and option are required');
  }

  try {
    const imageBuffer = await downloadImage(imageUrl); // Download the image
    const resizedBuffer = await resizeImage(imageBuffer, option); // Resize the image based on the option

    // Set the content type to match the image format (in this case, we assume it's JPEG)
    res.set('Content-Type', 'image/jpeg');

    // Send the resized image as a response
    res.send(resizedBuffer);
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('An error occurred while processing the image.');
  }
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
