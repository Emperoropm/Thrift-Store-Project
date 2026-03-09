async function loadSellerOrders() {
    const res = await fetch("http://localhost:3000/api/orders/seller", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    const orders = await res.json();

    const box = document.getElementById("seller-orders");
    box.innerHTML = "";

    orders.forEach(o => {
        box.innerHTML += `
            <div>
                <p>Order ID: ${o.id}</p>
                <p>Buyer: ${o.buyer.name}</p>
                <p>Total: ${o.total}</p>
            </div>
        `;
    });
}
s