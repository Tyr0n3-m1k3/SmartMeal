let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let userRole = null; // "customer" or "owner"

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
  },
  {
    name: "Burger Place",
    cuisine: "American",
    image: "assets/burger.png",
    menu: ["Harmburger", "Cheeseburger", "Chicken Nuggets"]
  },
  {
    name: "Shake Joint",
    cuisine: "Global",
    image: "assets/shake.png",
    menu: ["Chocolate", "Strawberry", "Vanilla"]
  }
];

document.getElementById("menu-toggle")?.addEventListener("click", () => {
  document.querySelector("nav").classList.toggle("show");
});

function toggleLogin() {
  document.getElementById("login-modal").classList.remove("hidden");
}

function handleLogin() {
  const role = document.getElementById("login-role").value;
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const errorField = document.getElementById("login-error");

  if (role === "owner") {
    if (username === "admin" && password === "admin123") {
      userRole = "owner";
      showAdminPanel();
      showToast("Logged in as Restaurant Owner");
    } else {
      errorField.textContent = "Invalid owner credentials.";
      return;
    }
  } else if (role === "customer") {
    if (username.trim() && password.trim()) {
      userRole = "customer";
      showHome();
      showToast("Logged in as Customer");
    } else {
      errorField.textContent = "Enter a valid username and password.";
      return;
    }
  }

  document.getElementById("login-modal").classList.add("hidden");
  loadRestaurants();
}

function loadRestaurants(filter = "") {
  const container = document.getElementById("restaurant-list");
  container.innerHTML = "";
  const savedRestaurants = JSON.parse(localStorage.getItem("restaurants") || "[]");
  const restaurants = [...defaultRestaurants, ...savedRestaurants];

  restaurants
    .filter(res => {
      const search = filter.toLowerCase();
      return res.name.toLowerCase().includes(search) || res.cuisine.toLowerCase().includes(search);
    })
    .forEach((res, index) => {
      const div = document.createElement("div");
      div.className = "restaurant";
      div.innerHTML = `
        <img src="${res.image}" alt="${res.name}" />
        <h2>${res.name}</h2>
        <p><strong>Cuisine:</strong> ${res.cuisine}</p>
        <p><strong>Menu:</strong> ${res.menu.join(", ")}</p>
        <button onclick="addToCart('${res.name}')">Order from ${res.name}</button>
        ${
          userRole === "owner" && index >= defaultRestaurants.length
            ? `<button onclick="editRestaurant(${index})">Edit</button>
               <button onclick="deleteRestaurant(${index})">Delete</button>`
            : ""
        }
      `;
      container.appendChild(div);
    });
}

function addToCart(name) {
  cart.push(name);
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cart-count").textContent = cart.length;
  showToast(`${name} added to cart`);
}

function viewCart() {
  const cartList = document.getElementById("cart-items");
  cartList.innerHTML = "";

  const itemCount = {};
  cart.forEach(item => {
    itemCount[item] = (itemCount[item] || 0) + 1;
  });

  Object.entries(itemCount).forEach(([item, count]) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item} x${count}
      <button onclick="removeFromCart('${item}')">Remove</button>
    `;
    cartList.appendChild(li);
  });

  document.getElementById("cart-modal").classList.remove("hidden");
}

function closeCart() {
  document.getElementById("cart-modal").classList.add("hidden");
}

function removeFromCart(name) {
  const index = cart.indexOf(name);
  if (index !== -1) cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cart-count").textContent = cart.length;
  viewCart();
  showToast(`${name} removed from cart`);
}

function placeOrder() {
  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }
  cart = [];
  localStorage.removeItem("cart");
  document.getElementById("cart-count").textContent = "0";
  closeCart();
  showToast("Order placed successfully!");
}

function showHome() {
  document.getElementById("home-view").classList.remove("hidden");
  document.getElementById("admin-panel").classList.add("hidden");
}

function showAdminPanel() {
  document.getElementById("home-view").classList.add("hidden");
  document.getElementById("admin-panel").classList.remove("hidden");
}

function addRestaurant() {
  const name = document.getElementById("res-name").value.trim();
  const cuisine = document.getElementById("res-cuisine").value.trim();
  const menu = document.getElementById("res-menu").value.split(",").map(item => item.trim());
  const image = document.getElementById("res-image").value.trim();

  if (!name || !cuisine || !menu.length || !image) {
    showToast("Please fill in all fields");
    return;
  }

  let stored = JSON.parse(localStorage.getItem("restaurants") || "[]");
  stored.push({ name, cuisine, menu, image });
  localStorage.setItem("restaurants", JSON.stringify(stored));

  document.getElementById("res-name").value = "";
  document.getElementById("res-cuisine").value = "";
  document.getElementById("res-menu").value = "";
  document.getElementById("res-image").value = "";
  document.getElementById("admin-msg").textContent = "Restaurant added successfully!";
  loadRestaurants();
  showToast("New restaurant added");
}

function deleteRestaurant(index) {
  const saved = JSON.parse(localStorage.getItem("restaurants") || "[]");
  if (index >= defaultRestaurants.length) {
    const adminIndex = index - defaultRestaurants.length;
    saved.splice(adminIndex, 1);
    localStorage.setItem("restaurants", JSON.stringify(saved));
    loadRestaurants();
    showToast("Restaurant deleted.");
  } else {
    showToast("Cannot delete default restaurants.");
  }
}

function editRestaurant(index) {
  const allRestaurants = [...defaultRestaurants, ...JSON.parse(localStorage.getItem("restaurants") || "[]")];
  const res = allRestaurants[index];
  if (index < defaultRestaurants.length) {
    showToast("Cannot edit default restaurants.");
    return;
  }

  const adminIndex = index - defaultRestaurants.length;

  document.getElementById("res-name").value = res.name;
  document.getElementById("res-cuisine").value = res.cuisine;
  document.getElementById("res-menu").value = res.menu.join(", ");
  document.getElementById("res-image").value = res.image;

  showAdminPanel();

  document.getElementById("admin-msg").textContent = "Edit mode: Updating restaurant...";

  const oldButton = document.querySelector('#admin-panel button[onclick="addRestaurant()"]');
  oldButton.textContent = "Update Restaurant";
  oldButton.onclick = function () {
    const name = document.getElementById("res-name").value.trim();
    const cuisine = document.getElementById("res-cuisine").value.trim();
    const menu = document.getElementById("res-menu").value.split(",").map(item => item.trim());
    const image = document.getElementById("res-image").value.trim();

    const stored = JSON.parse(localStorage.getItem("restaurants") || "[]");
    stored[adminIndex] = { name, cuisine, menu, image };
    localStorage.setItem("restaurants", JSON.stringify(stored));

    showToast("Restaurant updated!");
    document.getElementById("admin-msg").textContent = "";
    loadRestaurants();
    oldButton.textContent = "Add Restaurant";
    oldButton.setAttribute("onclick", "addRestaurant()");
    document.getElementById("res-name").value = "";
    document.getElementById("res-cuisine").value = "";
    document.getElementById("res-menu").value = "";
    document.getElementById("res-image").value = "";
  };
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 3000);
}

document.getElementById("search-bar")?.addEventListener("input", (e) => {
  loadRestaurants(e.target.value);
});

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("restaurant-list")) {
    loadRestaurants();
    document.getElementById("cart-count").textContent = cart.length;
  }
});
