// Use native fetch

async function testApi() {
    try {
        const response = await fetch('http://localhost:3000/api/products', {
            headers: { 'Authorization': 'Bearer mock-jeweller' }
        })
        console.log('Status:', response.status)
        const data = await response.json()
        console.log('Data count:', data.length)
        console.log(JSON.stringify(data, null, 2))
    } catch (err) {
        console.error('Fetch error:', err.message)
    }
}

testApi()
