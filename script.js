let cart = JSON.parse(localStorage.getItem("cart") || "[]"); let isAdmin = false;

const defaultRestaurants = [ { name: "Mama's Kitchen", cuisine: "African", image: "assets/ugali.jpg", menu: ["Ugali", "Sukuma Wiki", "Nyama Choma"] }, { name: "Pizza Hub", cuisine: "Italian", image: "assets/pizza.jpg", menu: ["Margherita", "Pepperoni", "Veggie"] }, { name: "Wok & Roll", cuisine: "Asian", image: "assets/noodles.jpg", menu: ["Noodles", "Fried Rice", "Spring Rolls"] } ];

function showToast(message) { const toast = document.getElementById("toast"); toast.textContent = message; toast.classList.remove("hidden"); setTimeout(() => toast.classList.add("hidden"), 3000); }

function showHome() { document.getElementById("home-view").classList.remove("hidden"); document.getElementById("admin-login").classList.add("hidden"); document.getElementById("admin-panel").classList.add("hidden"); }

function showLogin() { document.getElementById("home-view").classList.add("hidden"); document.getElementById("admin-login").classList.remove("hidden"); document.getElementById("admin-panel").classList.add("hidden"); }

function showAdminPanel() { document.getElementById("home-view").classList.add("hidden"); document.getElementById("admin-login").classList.add("hidden"); document.getElementById("admin-panel").classList.remove("hidden"); }

function loginAdmin() { const username = document.getElementById("admin-username").value; const password = document.getElementById("admin-password").value; if (username === "admin" && password === "admin123") { isAdmin = true; showAdminPanel(); } else { document.getElementById("admin-error").textContent = "Invalid credentials."; } }

function addRestaurant() { const name = document.getElementById("res-name").value; const cuisine = document.getElementById("res-cuisine").value; const menu = document.getElementById("res-menu").value.split(","); const image = document.getElementById("res-image").value;

let stored = JSON.parse(localStorage.getItem("restaurants") || "[]"); stored.push({ name, cuisine, menu, image }); localStorage.setItem("restaurants", JSON.stringify(stored));

document.getElementById("admin-msg").textContent = "Restaurant added successfully!"; showToast("Restaurant added!"); loadRestaurants(); document.getElementById("res-name").value = ""; document.getElementById("res-cuisine").value = ""; document.getElementById("res-menu").value = ""; document.getElementById("res-image").value = ""; }

function loadRestaurants() { const container = document.getElementById("restaurant-list"); container.innerHTML = ""; const savedRestaurants = JSON.parse(localStorage.getItem("restaurants") || "[]"); const restaurants = [...defaultRestaurants, ...savedRestaurants];

const searchQuery = document.getElementById("search-bar")?.value.toLowerCase() || "";

restaurants.filter(res => res.name.toLowerCase().includes(searchQuery) || res.cuisine.toLowerCase().includes(searchQuery) ).forEach(res => { const div = document.createElement("div"); div.className = "restaurant"; div.innerHTML = <img src="${res.image}" alt="${res.name}" /> <h2>${res.name}</h2> <p><strong>Cuisine:</strong> ${res.cuisine}</p> <p><strong>Menu:</strong> ${res.menu.join(", ")}</p> <button onclick="addToCart('${res.name}')">Order from ${res.name}</button>; container.appendChild(div); }); }

function addToCart(name) { cart.push(name); localStorage.setItem("cart", JSON.stringify(cart)); document.getElementById("cart-count").textContent = cart.length; showToast(${name} added to cart!); }

function viewCart() { const cartList = document.getElementById("cart-items"); cartList.innerHTML = ""; cart.forEach((item, index) => { const li = document.createElement("li"); li.textContent = item; const removeBtn = document.createElement("button"); removeBtn.textContent = "Remove"; removeBtn.onclick = () => removeFromCart(index); li.appendChild(removeBtn); cartList.appendChild(li); }); document.getElementById("cart-modal").classList.remove("hidden"); }

function closeCart() { document.getElementById("cart-modal").classList.add("hidden"); }

function removeFromCart(index) { cart.splice(index, 1); localStorage.setItem("cart", JSON.stringify(cart)); viewCart(); document.getElementById("cart-count").textContent = cart.length; }

function placeOrder() { cart = []; localStorage.setItem("cart", JSON.stringify(cart)); closeCart(); document.getElementById("cart-count").textContent = 0; showToast("Order placed successfully!"); }

document.addEventListener("DOMContentLoaded", () => { if (document.getElementById("restaurant-list")) { loadRestaurants(); document.getElementById("cart-count").textContent = cart.length; }

document.getElementById("search-bar")?.addEventListener("input", loadRestaurants); document.getElementById("menu-toggle")?.addEventListener("click", () => { document.querySelector("nav").classList.toggle("show"); }); });

