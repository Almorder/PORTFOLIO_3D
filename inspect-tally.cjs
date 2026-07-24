const https = require('https');

https.get('https://tally.so/r/7R5DOa', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log("HTML length:", data.length);
    // Look for any API endpoints in the HTML
    const endpoints = data.match(/https:\/\/tally\.so\/api\/[^"'\s]+/g);
    console.log("Endpoints found:", endpoints);
    // Look for form state
    const stateMatch = data.match(/window\.__TALLY_FORM_CONFIG__\s*=\s*(\{.*?\});/);
    if(stateMatch) {
      console.log("Found Form Config!");
    } else {
      console.log("No Form Config found");
    }
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
