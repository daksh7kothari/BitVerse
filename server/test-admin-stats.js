const test = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/admin/stats', {
            headers: {
                'Authorization': 'Bearer mock-admin'
            }
        });
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
};

test();
