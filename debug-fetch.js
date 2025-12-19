fetch("http://localhost:3000/api/test-validation?url=http://example.com/test.exe")
    .then(r => r.json())
    .then(d => console.log(JSON.stringify(d, null, 2)))
    .catch(e => console.error(e))
