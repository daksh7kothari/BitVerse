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
        const text = await response.text()
        console.log('Response Body:', text)
    } catch (err) {
        console.error('Fetch error:', err.message)
    }
}

testFetch()
