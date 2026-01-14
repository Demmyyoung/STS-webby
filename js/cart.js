// --- Cart Logic (localStorage) ---

const CART_KEY = "sts_cart";

// Helper: Get cart from storage
function getCart() {
  const cartJson = localStorage.getItem(CART_KEY);
  return cartJson ? JSON.parse(cartJson) : [];
}

// Helper: Save cart to storage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

// Add item to cart
function addToCart(product) {
  const cart = getCart();

  // Check if item already exists (optional: increment quantity)
  // For simplicity, we'll just push a new item or increment quantity if found
  const existingItem = cart.find(
    (item) => item.id === product.id && item.name === product.name
  );

  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);

  // Optional: Show a toast or alert
  alert(`${product.name} added to cart!`);
}

// Remove item from cart (by index for simplicity, or by ID)
function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  // If we are on the cart page, we might want to refresh the list
  if (typeof renderCartItems === "function") {
    renderCartItems();
  }
}

// Update quantity
function updateQuantity(index, newQty) {
  const cart = getCart();
  if (newQty <= 0) {
    removeFromCart(index);
    return;
  }
  cart[index].quantity = newQty;
  saveCart(cart);
  if (typeof renderCartItems === "function") {
    renderCartItems();
  }
}

// Calculate total
function getCartTotal() {
  const cart = getCart();
  return cart.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );
}

// Update Nav Count
function updateCartCount() {
  const cartItems = getCart();
  const count = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Update the badge
  const badge = document.querySelector(".cart-count");
  if (badge) {
    badge.textContent = count;
    // Optional: Hide if 0
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});
