/* ========================================
   Serenity Homestay - Main JS
   Animations, Forms, Interactions (jQuery)
======================================== */

$(document).ready(function () {

  // ---------- AOS INIT ----------
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60
    });
  }

  // ---------- NAVBAR SCROLL EFFECT ----------
  function handleNavbar() {
    if ($(window).scrollTop() > 50) {
      $('.navbar').addClass('scrolled');
    } else {
      $('.navbar').removeClass('scrolled');
    }
  }
  handleNavbar();
  $(window).on('scroll', handleNavbar);

  // ---------- BACK TO TOP ----------
  const $backToTop = $('.back-to-top');
  $(window).on('scroll', function () {
    if ($(window).scrollTop() > 400) {
      $backToTop.addClass('visible');
    } else {
      $backToTop.removeClass('visible');
    }
  });
  $backToTop.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 600);
  });

  // ---------- TOAST NOTIFICATIONS ----------
  function showToast(message, type = 'success') {
    const $toast = $(`
      <div class="custom-toast">
        <i class="bi bi-check-circle-fill text-success"></i>
        <span>${message}</span>
      </div>
    `);
    $('.toast-container').append($toast);
    setTimeout(() => {
      $toast.fadeOut(300, function () { $(this).remove(); });
    }, 3500);
  }

  // ---------- ANIMATED COUNTERS ----------
  function animateCounters() {
    $('.stat-number').each(function () {
      const $this = $(this);
      if ($this.data('animated')) return;
      const target = parseFloat($this.data('target'));
      if (isNaN(target)) return;

      const isDecimal = target % 1 !== 0;
      $this.data('animated', true);

      $({ count: 0 }).animate({ count: target }, {
        duration: 2000,
        easing: 'swing',
        step: function () {
          if (isDecimal) {
            $this.text(this.count.toFixed(1));
          } else {
            $this.text(Math.floor(this.count));
          }
        },
        complete: function () {
          if (isDecimal) {
            $this.text(target.toFixed(1));
          } else {
            $this.text(target);
          }
        }
      });
    });
  }

  // Trigger counters when in view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
      }
    });
  }, { threshold: 0.3 });

  $('.stats-section, .stat-number').each(function () {
    observer.observe(this);
  });

  // ---------- NEWSLETTER FORM ----------
  $('#newsletter-form').on('submit', function (e) {
    e.preventDefault();
    const email = $(this).find('input[type="email"]').val().trim();
    if (email) {
      showToast('Thank you for subscribing!');
      $(this)[0].reset();
    }
  });

  // ---------- CONTACT FORM ----------
  $('#contact-form').on('submit', function (e) {
    e.preventDefault();
    showToast('Message sent! We will get back to you soon.');
    $(this)[0].reset();
  });

  // ---------- BOOKING MODAL ----------
  $('#bookingModal').on('show.bs.modal', function (e) {
    const button = $(e.relatedTarget);
    const room = button.data('room') || 'Selected Room';
    $('#booking-room').val(room);
    $('#room-display').val(room);

    // Restrict dates to today onward
    const today = new Date().toISOString().split('T')[0];
    $('#checkin, #checkout').attr('min', today);
  });

  $('#booking-form').on('submit', function (e) {
    e.preventDefault();
    const room = $('#room-display').val();
    showToast(`Booking request for "${room}" sent successfully!`);
    $(this)[0].reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
    if (modal) modal.hide();
  });

  // Date validation: checkout after checkin
  $('#checkin').on('change', function () {
    const checkin = $(this).val();
    if (checkin) {
      $('#checkout').attr('min', checkin);
    }
  });

  // ---------- GALLERY LIGHTBOX ----------
  $('.gallery-item').on('click', function () {
    const img = $(this).data('img');
    const title = $(this).data('title') || '';
    $('#gallery-modal-img').attr('src', img).attr('alt', title);
    $('#gallery-modal-title').text(title);
  });

  // ---------- ACTIVE NAV HIGHLIGHT ----------
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  $('.navbar-nav .nav-link').each(function () {
    const href = $(this).attr('href');
    if (href === currentPage) {
      $(this).addClass('active');
    } else {
      $(this).removeClass('active');
    }
  });

});
