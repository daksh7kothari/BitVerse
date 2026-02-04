import fetch from 'node-fetch'

async function testFetch() {
    const role = 'craftsman'
    const url = 'http://localhost:3000/api/products/my'

    console.log(`Fetching ${url} as role: ${role}...`)

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer mock-${role}`
            }
        })

        console.log('Status Code:', response.status)
        const data = await response.json()
        console.log('Response Body:', JSON.stringify(data, null, 2))
    } catch (err) {
        console.error('Fetch error:', err.message)
    }
}

testFetch()
