let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let userRole = null; // "customer" or "owner"
let selectedImageBase64 = "";

const defaultRestaurants = [
  {
    name: "Mama's Kitchen",
    cuisine: "African",
    image: "assets/ugali.png",
    menu: [
      { name: "Ugali", price: 200 },
      { name: "Sukuma Wiki", price: 150 },
      { name: "Nyama Choma", price: 300 }
    ]
  },
  {
    name: "Pizza Hub",
    cuisine: "Italian",
    image: "assets/pizza.png",
    menu: [
      { name: "Margherita", price: 500 },
      { name: "Pepperoni", price: 600 },
      { name: "Veggie", price: 450 }
    ]
  },
  {
    name: "Wok & Roll",
    cuisine: "Asian",
    image: "assets/noodles.png",
    menu: [
      { name: "Noodles", price: 350 },
      { name: "Fried Rice", price: 300 },
      { name: "Spring Rolls", price: 250 }
    ]
  },
  {
    name: "Burger Place",
    cuisine: "American",
    image: "assets/burger.png",
    menu: [
      { name: "Hamburger", price: 400 },
      { name: "Cheeseburger", price: 450 },
      { name: "Chicken Nuggets", price: 300 }
    ]
  },
  {
    name: "Shake Joint",
    cuisine: "Global",
    image: "assets/shake.png",
    menu: [
      { name: "Chocolate", price: 200 },
      { name: "Strawberry", price: 200 },
      { name: "Vanilla", price: 180 }
    ]
  },
  {
    name: "Sushi Palace",
    cuisine: "Seafood",
    image: "assets/sushi.png",
    menu: [
      { name: "Crab", price: 600 },
      { name: "Shrimp", price: 650 },
      { name: "Sushi", price: 700 }
    ]
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

function showHome() {
  document.getElementById("home-view").classList.remove("hidden");
  document.getElementById("restaurant-view").classList.add("hidden");
  document.getElementById("admin-panel").classList.add("hidden");
}

function showAdminPanel() {
  document.getElementById("home-view").classList.add("hidden");
  document.getElementById("restaurant-view").classList.add("hidden");
  document.getElementById("admin-panel").classList.remove("hidden");
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
      const menuNames = res.menu.map(item => (typeof item === "string" ? item : item.name));
      div.innerHTML = `
        <img src="${res.image}" alt="${res.name}" />
        <h2>${res.name}</h2>
        <p><strong>Cuisine:</strong> ${res.cuisine}</p>
        <p><strong>Menu:</strong> ${menuNames.join(", ")}</p>
        <button onclick="viewRestaurant(${index})">Order from ${res.name}</button>
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

function viewRestaurant(index) {
  const savedRestaurants = JSON.parse(localStorage.getItem("restaurants") || "[]");
  const restaurants = [...defaultRestaurants, ...savedRestaurants];
  const restaurant = restaurants[index];

  const formattedMenu = restaurant.menu.map(item =>
    typeof item === "string" ? { name: item, price: 100 } : item
  );

  document.getElementById("home-view").classList.add("hidden");
  document.getElementById("admin-panel").classList.add("hidden");
  document.getElementById("restaurant-view").classList.remove("hidden");

  document.getElementById("restaurant-cover").src = restaurant.image;
  document.getElementById("restaurant-name").textContent = restaurant.name;
  document.getElementById("restaurant-cuisine").textContent = `Cuisine: ${restaurant.cuisine}`;

  const menuList = document.getElementById("restaurant-menu-list");
  menuList.innerHTML = "";

  formattedMenu.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";
    div.innerHTML = `
      <p><strong>${item.name}</strong> - $${item.price}</p>
      <button onclick='addItemToCart(${JSON.stringify(JSON.stringify(item))})'>Add to Cart</button>
    `;
    menuList.appendChild(div);
  });
}

function addItemToCart(itemJsonStr) {
  const item = JSON.parse(JSON.parse(itemJsonStr));
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cart-count").textContent = cart.length;
  showToast(`${item.name} added to cart`);
}

function viewCart() {
  const cartList = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");
  cartList.innerHTML = "";

  const itemMap = {};
  cart.forEach(item => {
    const key = item.name;
    if (!itemMap[key]) {
      itemMap[key] = { ...item, quantity: 0 };
    }
    itemMap[key].quantity += 1;
  });

  let total = 0;

  Object.values(itemMap).forEach(({ name, price, quantity }) => {
    const subtotal = price * quantity;
    total += subtotal;

    const li = document.createElement("li");
    li.innerHTML = `
      ${name} x${quantity} - $${subtotal}
      <button onclick="removeFromCartByName('${name}')">Remove</button>
    `;
    cartList.appendChild(li);
  });

  totalElement.textContent = total.toFixed(2);
  document.getElementById("cart-modal").classList.remove("hidden");
}

function removeFromCartByName(name) {
  const index = cart.findIndex(item => item.name === name);
  if (index !== -1) cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cart-count").textContent = cart.length;
  viewCart();
  showToast(`${name} removed from cart`);
}

function closeCart() {
  document.getElementById("cart-modal").classList.add("hidden");
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

function addRestaurant() {
  const name = document.getElementById("res-name").value.trim();
  const cuisine = document.getElementById("res-cuisine").value.trim();
  const menu = document.getElementById("res-menu").value.split(",").map(item => ({
    name: item.trim(),
    price: 100
  }));
  const image = selectedImageBase64 || "assets/placeholder.png";

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
  document.getElementById("res-image-file").value = "";
  document.getElementById("image-preview").src = "";
  document.getElementById("image-preview").style.display = "none";
  selectedImageBase64 = "";

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
  document.getElementById("res-menu").value = res.menu.map(m => m.name).join(", ");
  document.getElementById("image-preview").src = res.image;
  document.getElementById("image-preview").style.display = "block";
  selectedImageBase64 = res.image;

  showAdminPanel();
  document.getElementById("admin-msg").textContent = "Edit mode: Updating restaurant...";

  const oldButton = document.querySelector('#admin-panel button[onclick="addRestaurant()"]');
  oldButton.textContent = "Update Restaurant";
  oldButton.onclick = function () {
    const name = document.getElementById("res-name").value.trim();
    const cuisine = document.getElementById("res-cuisine").value.trim();
    const menu = document.getElementById("res-menu").value.split(",").map(item => ({
      name: item.trim(),
      price: 100
    }));
    const image = selectedImageBase64 || "assets/placeholder.png";

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
    document.getElementById("res-image-file").value = "";
    document.getElementById("image-preview").src = "";
    document.getElementById("image-preview").style.display = "none";
    selectedImageBase64 = "";
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

document.getElementById("res-image-file")?.addEventListener("change", function (e) {
  const file = e.target.files[0];
  const preview = document.getElementById("image-preview");

  if (file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      selectedImageBase64 = evt.target.result;
      preview.src = selectedImageBase64;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    selectedImageBase64 = "";
    preview.src = "";
    preview.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("restaurant-list")) {
    loadRestaurants();
    document.getElementById("cart-count").textContent = cart.length;
  }
});
