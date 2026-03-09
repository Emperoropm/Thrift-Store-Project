async function loadBuyerOrders() {
    const res = await fetch("http://localhost:3000/api/orders/buyer", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    const orders = await res.json();

    const list = document.getElementById("orders");
    list.innerHTML = "";

    orders.forEach(o => {
        list.innerHTML += `<p>Order ID: ${o.id} | Total: ${o.total}</p>`;
    });
}
