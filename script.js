let cart = JSON.parse(localStorage.getItem("cart") || "[]");

const defaultRestaurants = [
  {
    name: "Mama's Kitchen",
    cuisine: "African",
    image: "assets/ugali.png",
    menu: ["Ugali", "Sukuma Wiki", "Nyama Choma"]
  },
  {
    name: "Pizza Hub",
    cuisine: "Italian",
    image: "assets/pizza.png",
    menu: ["Margherita", "Pepperoni", "Veggie"]
  },
  {
    name: "Wok & Roll",
    cuisine: "Asian",
    image: "assets/noodles.png",
    menu: ["Noodles", "Fried Rice", "Spring Rolls"]
  }
];

function loadRestaurants() {
  const container = document.getElementById("restaurant-list");
  container.innerHTML = "";
  const savedRestaurants = JSON.parse(localStorage.getItem("restaurants") || "[]");
  const restaurants = [...defaultRestaurants, ...savedRestaurants];
  
  restaurants.forEach(res => {
    const div = document.createElement("div");
    div.className = "restaurant";
    div.innerHTML = `
      <img src="${res.image}" alt="${res.name}" />
      <h2>${res.name}</h2>
      <p><strong>Cuisine:</strong> ${res.cuisine}</p>
      <p><strong>Menu:</strong> ${res.menu.join(", ")}</p>
      <button onclick="addToCart('${res.name}')">Order from ${res.name}</button>
    `;
    container.appendChild(div);
  });
}

function addToCart(name) {
  cart.push(name);
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cart-count").textContent = cart.length;
  alert(name + " added to cart!");
}

function viewCart() {
  const cartList = document.getElementById("cart-items");
  cartList.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    cartList.appendChild(li);
  });
  document.getElementById("cart-modal").classList.remove("hidden");
}

function closeCart() {
  document.getElementById("cart-modal").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("restaurant-list")) {
    loadRestaurants();
    document.getElementById("cart-count").textContent = cart.length;
  }
});
