// Check current Vercel domain
console.log('Current domain:', window.location.origin);
console.log('Current hostname:', window.location.hostname);
console.log('Current href:', window.location.href);

// Test API call with current domain
fetch('https://recruitment-api-jrcr.onrender.com/api/jobs/', {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin
    }
})
.then(response => {
    console.log('API Response status:', response.status);
    console.log('API Response headers:', response.headers);
    return response.json();
})
.then(data => {
    console.log('API Success! Jobs count:', data.count);
})
.catch(error => {
    console.error('API Error:', error);
});