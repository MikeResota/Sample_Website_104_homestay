/* ========================================
   Serenity Homestay & Bakery - Main JS
   Cart, Animations, Interactions (jQuery)
======================================== */

$(document).ready(function () {
  // ---------- CART SYSTEM (localStorage) ----------
  const CART_KEY = 'serenity_cart';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
  }

  function updateCartUI() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    $('.cart-count').text(count > 0 ? count : '0');
    if (count > 0) {
      $('.cart-count').show();
    } else {
      $('.cart-count').text('0');
    }

    // If on cart page, render items
    if ($('#cart-items-body').length) {
      renderCartPage();
    }
  }

  function addToCart(product) {
    let cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart(cart);
    showToast(`"${product.name}" added to cart!`);
  }

  function removeFromCart(id) {
    let cart = getCart().filter(item => item.id !== id);
    saveCart(cart);
    showToast('Item removed from cart');
  }

  function updateQty(id, delta) {
    let cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
      saveCart(cart);
    }
  }

  function getCartTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  // ---------- RENDER CART PAGE ----------
  function renderCartPage() {
    const cart = getCart();
    const $body = $('#cart-items-body');
    const $empty = $('#empty-cart-msg');
    const $tableWrap = $('#cart-table-wrap');
    const $summary = $('#cart-summary');

    if (cart.length === 0) {
      $tableWrap.hide();
      $summary.hide();
      $empty.show();
      return;
    }

    $empty.hide();
    $tableWrap.show();
    $summary.show();

    let html = '';
    cart.forEach(item => {
      const subtotal = (item.price * item.qty).toFixed(2);
      html += `
        <tr data-id="${item.id}">
          <td>
            <div class="d-flex align-items-center gap-3">
              <img src="${item.image}" alt="${item.name}" class="cart-item-img">
              <div>
                <strong>${item.name}</strong>
                <div class="text-muted small">${item.category || ''}</div>
              </div>
            </div>
          </td>
          <td class="text-center">$${item.price.toFixed(2)}</td>
          <td>
            <div class="qty-control justify-content-center">
              <button class="qty-btn qty-minus" data-id="${item.id}">−</button>
              <span class="fw-bold px-2">${item.qty}</span>
              <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
            </div>
          </td>
          <td class="text-end fw-bold">$${subtotal}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}" title="Remove">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
    $body.html(html);

    // Update totals
    const subtotal = getCartTotal();
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    $('#cart-subtotal').text('$' + subtotal.toFixed(2));
    $('#cart-shipping').text(shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2));
    $('#cart-tax').text('$' + tax.toFixed(2));
    $('#cart-total').text('$' + total.toFixed(2));
  }

  // Cart page event delegation
  $(document).on('click', '.qty-plus', function () {
    updateQty($(this).data('id'), 1);
  });
  $(document).on('click', '.qty-minus', function () {
    updateQty($(this).data('id'), -1);
  });
  $(document).on('click', '.remove-item', function () {
    if (confirm('Remove this item from cart?')) {
      removeFromCart($(this).data('id'));
    }
  });

  // ---------- ADD TO CART BUTTONS ----------
  $(document).on('click', '.btn-add-cart', function (e) {
    e.preventDefault();
    const $btn = $(this);
    const product = {
      id: $btn.data('id'),
      name: $btn.data('name'),
      price: parseFloat($btn.data('price')),
      image: $btn.data('image'),
      category: $btn.data('category') || 'Bakery'
    };
    addToCart(product);

    // Visual feedback
    $btn.addClass('added').html('<i class="bi bi-check-lg"></i> Added');
    setTimeout(() => {
      $btn.removeClass('added').html('<i class="bi bi-cart-plus"></i> Add to Cart');
    }, 1500);
  });

  // ---------- TOAST ----------
  function showToast(message) {
    const toast = $(`
      <div class="custom-toast">
        <i class="bi bi-check-circle-fill text-success fs-4"></i>
        <div>${message}</div>
      </div>
    `);
    $('.toast-container').append(toast);
    setTimeout(() => {
      toast.fadeOut(300, function () { $(this).remove(); });
    }, 2800);
  }

  // Ensure toast container exists
  if (!$('.toast-container').length) {
    $('body').append('<div class="toast-container"></div>');
  }

  // Init cart count
  updateCartUI();

  // ---------- NAVBAR SCROLL ----------
  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 50) {
      $('.navbar').addClass('scrolled');
      $('.back-to-top').addClass('show');
    } else {
      $('.navbar').removeClass('scrolled');
      $('.back-to-top').removeClass('show');
    }
  });

  // Back to top
  $('.back-to-top').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 600);
  });

  // ---------- SCROLL ANIMATIONS ----------
  function checkFadeIn() {
    $('.fade-in-up').each(function () {
      const elTop = $(this).offset().top;
      const winBottom = $(window).scrollTop() + $(window).height();
      if (elTop < winBottom - 60) {
        $(this).addClass('visible');
      }
    });
  }
  $(window).on('scroll', checkFadeIn);
  checkFadeIn();

  // ---------- PRODUCT FILTER ----------
  $('.filter-btn').on('click', function () {
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');
    const filter = $(this).data('filter');

    if (filter === 'all') {
      $('.product-item').fadeIn(300);
    } else {
      $('.product-item').hide();
      $(`.product-item[data-category="${filter}"]`).fadeIn(300);
    }
  });

  // ---------- SEARCH PRODUCTS ----------
  $('#product-search').on('input', function () {
    const term = $(this).val().toLowerCase().trim();
    $('.product-item').each(function () {
      const name = $(this).find('.product-title').text().toLowerCase();
      const desc = $(this).find('.product-desc').text().toLowerCase();
      if (name.includes(term) || desc.includes(term)) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  });

  // ---------- NEWSLETTER ----------
  $('#newsletter-form').on('submit', function (e) {
    e.preventDefault();
    const email = $(this).find('input[type="email"]').val();
    if (email) {
      showToast('Thank you for subscribing!');
      $(this)[0].reset();
    }
  });

  // ---------- CONTACT FORM ----------
  $('#contact-form').on('submit', function (e) {
    e.preventDefault();
    const $btn = $(this).find('button[type="submit"]');
    $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Sending...');
    setTimeout(() => {
      showToast('Message sent successfully! We will reply soon.');
      $(this)[0].reset();
      $btn.prop('disabled', false).html('Send Message');
    }, 1200);
  });

  // ---------- BOOKING FORM ----------
  $('#booking-form').on('submit', function (e) {
    e.preventDefault();
    const $btn = $(this).find('button[type="submit"]');
    $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Processing...');
    setTimeout(() => {
      showToast('Booking request received! Confirmation email will be sent.');
      $(this)[0].reset();
      $btn.prop('disabled', false).html('Request Booking');
    }, 1500);
  });

  // ---------- CHECKOUT FORM ----------
  $('#checkout-form').on('submit', function (e) {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) {
      showToast('Your cart is empty!');
      return;
    }
    const $btn = $(this).find('button[type="submit"]');
    $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Placing Order...');
    setTimeout(() => {
      // Clear cart
      localStorage.removeItem(CART_KEY);
      updateCartUI();
      // Show success
      $('#checkout-content').hide();
      $('#order-success').removeClass('d-none');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1800);
  });

  // Populate checkout order summary
  if ($('#checkout-order-summary').length) {
    const cart = getCart();
    if (cart.length === 0) {
      $('#checkout-content').html(`
        <div class="text-center py-5">
          <i class="bi bi-cart-x display-1 text-muted"></i>
          <h3 class="mt-3">Your cart is empty</h3>
          <a href="bakery.html" class="btn btn-primary-custom mt-3">Browse Bakery</a>
        </div>
      `);
    } else {
      let html = '';
      cart.forEach(item => {
        html += `
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex align-items-center gap-2">
              <img src="${item.image}" width="50" height="50" style="object-fit:cover;border-radius:8px;">
              <div>
                <div class="fw-semibold">${item.name}</div>
                <small class="text-muted">Qty: ${item.qty}</small>
              </div>
            </div>
            <span class="fw-bold">$${(item.price * item.qty).toFixed(2)}</span>
          </div>
        `;
      });
      const subtotal = getCartTotal();
      const shipping = subtotal > 50 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;
      html += `
        <hr>
        <div class="d-flex justify-content-between mb-1"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="d-flex justify-content-between mb-1"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span></div>
        <div class="d-flex justify-content-between mb-2"><span>Tax</span><span>$${tax.toFixed(2)}</span></div>
        <div class="d-flex justify-content-between fw-bold fs-5 text-primary"><span>Total</span><span>$${total.toFixed(2)}</span></div>
      `;
      $('#checkout-order-summary').html(html);
    }
  }

  // ---------- COUNTER ANIMATION ----------
  function animateCounters() {
    $('.stat-number').each(function () {
      const $this = $(this);
      if ($this.hasClass('counted')) return;
      const target = parseInt($this.data('target'), 10);
      if (isNaN(target)) return;
      $this.addClass('counted');
      $({ count: 0 }).animate({ count: target }, {
        duration: 2000,
        easing: 'swing',
        step: function () {
          $this.text(Math.floor(this.count));
        },
        complete: function () {
          $this.text(target);
        }
      });
    });
  }

  // Trigger counters when in view
  $(window).on('scroll', function () {
    if ($('.stats-section').length) {
      const sectionTop = $('.stats-section').offset().top;
      if ($(window).scrollTop() + $(window).height() > sectionTop + 100) {
        animateCounters();
      }
    }
  });

  // ---------- SMOOTH ACTIVE NAV ----------
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  $('.navbar-nav .nav-link').each(function () {
    const href = $(this).attr('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      $(this).addClass('active');
    }
  });

  // ---------- GALLERY LIGHTBOX (simple) ----------
  $('.gallery-item').on('click', function () {
    const src = $(this).find('img').attr('src');
    const modal = $(`
      <div class="modal fade" id="galleryModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content bg-transparent border-0">
            <div class="modal-body p-0 position-relative">
              <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" style="z-index:10;"></button>
              <img src="${src}" class="img-fluid rounded" alt="Gallery">
            </div>
          </div>
        </div>
      </div>
    `);
    $('body').append(modal);
    const bsModal = new bootstrap.Modal(document.getElementById('galleryModal'));
    bsModal.show();
    $('#galleryModal').on('hidden.bs.modal', function () {
      $(this).remove();
    });
  });

  // ---------- DATE MIN FOR BOOKING ----------
  const today = new Date().toISOString().split('T')[0];
  $('input[type="date"]').attr('min', today);

  // ---------- CLEAR CART BUTTON ----------
  $('#clear-cart').on('click', function () {
    if (confirm('Clear entire cart?')) {
      localStorage.removeItem(CART_KEY);
      updateCartUI();
      showToast('Cart cleared');
    }
  });
});
