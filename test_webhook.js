fetch("http://localhost:8000", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sender: { id: "12345" },
    message: { text: "Hi" }
  })
}).then(res => res.text()).then(console.log).catch(console.error);
