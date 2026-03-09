async function buy(productId) {
    const res = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            items: [{ productId, quantity: 1 }]
        })
    });

    const data = await res.json();
    alert("Order placed!");
}

async function loadMyOrders() {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/orders/my", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const orders = await res.json();

    const container = document.getElementById("myOrders");

    orders.forEach(order => {
        container.innerHTML += `
            <div class="p-4 bg-gray-50 border mb-3 rounded">
                <h2 class="font-bold">Order #${order.id}</h2>
                <p>Total: Rs. ${order.total}</p>
                <ul>
                    ${order.items.map(i => `
                        <li>${i.product.title} — Qty: ${i.quantity}</li>
                    `).join("")}
                </ul>
            </div>
        `;
    });
}

async function loadSellerOrders() {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/orders/seller", {
        headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();

    // show in HTML...
}

