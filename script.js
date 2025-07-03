let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let userRole = null;
let selectedImageBase64 = "";
let currentRestaurantIndex = null;

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
  }
];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("menu-toggle")?.addEventListener("click", () => {
    document.querySelector("nav").classList.toggle("show");
  });

  document.getElementById("search-bar")?.addEventListener("input", (e) => {
    loadRestaurants(e.target.value);
  });

  document.getElementById("res-image-file")?.addEventListener("change", function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById("image-preview");
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        selectedImageBase64 = evt.target.result;
        preview.src = selectedImageBase64;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // Payment method selection
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', function() {
      document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
      this.classList.add('selected');
      document.querySelectorAll('.payment-form').forEach(form => form.classList.add('hidden'));
      document.getElementById(`${this.dataset.method}-payment`).classList.remove('hidden');
    });
  });

  loadRestaurants();
  document.getElementById("cart-count").textContent = cart.length;
});

function flipCard() {
  document.querySelector('.flip-card').classList.toggle('flipped');
}

function socialLogin(provider) {
  showToast(`Logging in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`);
  setTimeout(() => {
    userRole = "customer";
    showHome();
    showToast("Logged in successfully!");
    document.getElementById("login-modal").classList.add("hidden");
  }, 1000);
}

function ownerLogin() {
  const username = document.getElementById("owner-username").value;
  const password = document.getElementById("owner-password").value;
  
  if (username === "admin" && password === "admin123") {
    userRole = "owner";
    showAdminPanel();
    showToast("Logged in as Restaurant Owner");
    document.getElementById("login-modal").classList.add("hidden");
  } else {
    document.getElementById("login-error").textContent = "Invalid owner credentials.";
  }
}

function toggleLogin() {
  document.getElementById("login-modal").classList.remove("hidden");
  document.querySelector('.flip-card').classList.remove('flipped');
}

function showHome() {
  document.getElementById("home-view").classList.remove("hidden");
  document.getElementById("restaurant-view").classList.add("hidden");
  document.getElementById("admin-panel").classList.add("hidden");
  document.getElementById("payment-view").classList.add("hidden");
}

function showAdminPanel() {
  document.getElementById("home-view").classList.add("hidden");
  document.getElementById("restaurant-view").classList.add("hidden");
  document.getElementById("admin-panel").classList.remove("hidden");
  document.getElementById("payment-view").classList.add("hidden");
  document.getElementById("admin-msg").textContent = "";
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
        <button onclick="viewRestaurant(${index})">View Menu</button>
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
  currentRestaurantIndex = index;
  const savedRestaurants = JSON.parse(localStorage.getItem("restaurants") || "[]");
  const restaurants = [...defaultRestaurants, ...savedRestaurants];
  const restaurant = restaurants[index];

  document.getElementById("home-view").classList.add("hidden");
  document.getElementById("admin-panel").classList.add("hidden");
  document.getElementById("restaurant-view").classList.remove("hidden");

  const coverImg = document.getElementById("restaurant-cover");
  coverImg.src = restaurant.image;
  coverImg.onload = function() {
    // Ensure image fits properly
    this.style.objectFit = "contain";
    this.style.maxHeight = "250px";
    this.style.width = "100%";
  };

  document.getElementById("restaurant-name").textContent = restaurant.name;
  document.getElementById("restaurant-cuisine").textContent = `Cuisine: ${restaurant.cuisine}`;

  const menuList = document.getElementById("restaurant-menu-list");
  menuList.innerHTML = "";

  restaurant.menu.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";
    div.innerHTML = `
      <p><strong>${item.name}</strong> - $${item.price.toFixed(2)}</p>
      <button onclick="addItemToCart(${index}, '${encodeURIComponent(JSON.stringify(item))}')">Add to Cart</button>
    `;
    menuList.appendChild(div);
  });
}

function addItemToCart(restaurantIndex, encodedItemStr) {
  try {
    const item = JSON.parse(decodeURIComponent(encodedItemStr));
    item.restaurantIndex = restaurantIndex;
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    document.getElementById("cart-count").textContent = cart.length;
    showToast(`${item.name} added to cart`);
  } catch (e) {
    console.error("Error adding item to cart:", e);
    showToast("Failed to add item to cart");
  }
}

function viewCart() {
  const cartList = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");
  cartList.innerHTML = "";

  const itemMap = {};
  cart.forEach(item => {
    const key = item.name + item.restaurantIndex;
    if (!itemMap[key]) {
      itemMap[key] = { ...item, quantity: 0 };
    }
    itemMap[key].quantity += 1;
  });

  let total = 0;

  Object.values(itemMap).forEach(({ name, price, quantity, restaurantIndex }) => {
    const subtotal = price * quantity;
    total += subtotal;

    const li = document.createElement("li");
    li.innerHTML = `
      ${name} x${quantity} - $${subtotal.toFixed(2)}
      <button onclick="removeFromCart('${name}', ${restaurantIndex})">Remove</button>
    `;
    cartList.appendChild(li);
  });

  totalElement.textContent = total.toFixed(2);
  document.getElementById("cart-modal").classList.remove("hidden");
}

function removeFromCart(name, restaurantIndex) {
  const index = cart.findIndex(item => item.name === name && item.restaurantIndex === restaurantIndex);
  if (index !== -1) cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cart-count").textContent = cart.length;
  viewCart();
  showToast(`${name} removed from cart`);
}

function closeCart() {
  document.getElementById("cart-modal").classList.add("hidden");
}

function showPayment() {
  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }
  document.getElementById("cart-modal").classList.add("hidden");
  document.getElementById("payment-view").classList.remove("hidden");
}

function processPayment() {
  const selectedMethod = document.querySelector('.payment-method.selected').dataset.method;
  
  if (selectedMethod === 'card') {
    const cardNumber = document.getElementById('card-number').value;
    const cardName = document.getElementById('card-name').value;
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvv = document.getElementById('card-cvv').value;
    
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      showToast('Please fill all card details');
      return;
    }
  }
  
  showToast(`Processing ${selectedMethod} payment...`);
  setTimeout(() => {
    cart = [];
    localStorage.removeItem("cart");
    document.getElementById("cart-count").textContent = "0";
    showToast("Payment successful! Order placed.");
    showHome();
  }, 2000);
}

function addMenuItem() {
  const container = document.getElementById('menu-items-container');
  const newItem = document.createElement('div');
  newItem.className = 'menu-item-input';
  newItem.innerHTML = `
    <input type="text" class="menu-item-name" placeholder="Item Name">
    <input type="number" class="menu-item-price" placeholder="Price" min="0" step="0.01">
    <button class="remove-item-btn" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(newItem);
}

function addRestaurant() {
  const name = document.getElementById("res-name").value.trim();
  const cuisine = document.getElementById("res-cuisine").value.trim();
  
  const menuItems = [];
  document.querySelectorAll('.menu-item-input').forEach(item => {
    const name = item.querySelector('.menu-item-name').value.trim();
    const price = parseFloat(item.querySelector('.menu-item-price').value);
    if (name && !isNaN(price)) {
      menuItems.push({ name, price });
    }
  });
  
  const image = selectedImageBase64 || "assets/placeholder.png";

  if (!name || !cuisine || menuItems.length === 0 || !image) {
    showToast("Please fill in all fields");
    return;
  }

  let stored = JSON.parse(localStorage.getItem("restaurants") || "[]");
  stored.push({ name, cuisine, menu: menuItems, image });
  localStorage.setItem("restaurants", JSON.stringify(stored));

  // Reset form
  document.getElementById("res-name").value = "";
  document.getElementById("res-cuisine").value = "";
  document.getElementById("menu-items-container").innerHTML = `
    <div class="menu-item-input">
      <input type="text" class="menu-item-name" placeholder="Item Name">
      <input type="number" class="menu-item-price" placeholder="Price" min="0" step="0.01">
      <button class="remove-item-btn">×</button>
    </div>
  `;
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
