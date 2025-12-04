// ---------------------------------------------------
// POPUP
// ---------------------------------------------------
class PopupController {
  constructor(container) {
    this.container = container;
    this.openBtn = this.container.querySelector('[data-open-js]');
    this.popup = document.getElementById('prime-popup__init');

    if (!this.openBtn || !this.popup) return;

    this.overlay = this.popup.querySelector('.prime-popup__overlay');
    this.closeBtns = this.popup.querySelectorAll('[data-popup-close-js]');

    this.init();
  }

  init() {
    this.openBtn.addEventListener('click', () => this.openPopup());
    this.overlay.addEventListener('click', () => this.closePopup());
    this.closeBtns.forEach(btn => btn.addEventListener('click', () => this.closePopup()));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closePopup();
    });
  }

  openPopup() {
    this.popup.classList.add('prime-popup--visible', 'prime-popup--active');
    document.body.style.overflow = 'hidden';
  }

  closePopup() {
    this.popup.classList.remove('prime-popup--active', 'prime-popup--visible');
    document.body.style.overflow = '';
  }
}

// ---------------------------------------------------
// MOBILE SLIDER
// ---------------------------------------------------
class MobileSlider {
  constructor(container) {
    this.container = container;
    this.wrapper = this.container.querySelector(".prime-table__mobile-slider[data-slider-mob-js]");
    if (!this.wrapper) return;

    this.slides = this.wrapper.querySelectorAll(".prime-table__levels-mobile[data-slide-mob]");
    if (!this.slides.length) return;

    this.currentSlide = 0;
    this.mobileSliderInitialized = false;

    this.startX = 0;
    this.startY = 0;
    this.isHorizontalSwipe = false;

    this.checkSlider = this.checkSlider.bind(this);
    this.touchStartHandler = this.touchStartHandler.bind(this);
    this.touchMoveHandler = this.touchMoveHandler.bind(this);
    this.touchEndHandler = this.touchEndHandler.bind(this);

    this.initListeners();
    this.checkSlider();
  }

  initListeners() {
    window.addEventListener('load', this.checkSlider);
    window.addEventListener('resize', this.checkSlider);
  }

  initSlider() {
    this.slides.forEach((s) => s.classList.remove('prime-table__levels-mobile--active'));
    this.slides[this.currentSlide].classList.add('prime-table__levels-mobile--active');

    this.wrapper.addEventListener('touchstart', this.touchStartHandler, { passive: true });
    this.wrapper.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
    this.wrapper.addEventListener('touchend', this.touchEndHandler);

    this.mobileSliderInitialized = true;
  }

  destroySlider() {
    if (!this.mobileSliderInitialized) return;

    this.slides.forEach(s => s.classList.remove('prime-table__levels-mobile--active'));

    this.wrapper.removeEventListener('touchstart', this.touchStartHandler);
    this.wrapper.removeEventListener('touchmove', this.touchMoveHandler);
    this.wrapper.removeEventListener('touchend', this.touchEndHandler);

    this.mobileSliderInitialized = false;
  }

  showSlide(index, direction = 'left') {
    if (index === this.currentSlide) return;

    const oldSlide = this.slides[this.currentSlide];
    const newSlide = this.slides[index];

    // Скрываем старый слайд
    // oldSlide.style.display = 'none';
    oldSlide.classList.remove('prime-table__levels-mobile--active');

    // Показываем новый слайд
    // newSlide.style.display = 'block';
    newSlide.classList.add('prime-table__levels-mobile--active');

    // Анимация
    const animClass = direction === 'left'
      ? 'prime-table__levels-mobile--anim-in-left'
      : 'prime-table__levels-mobile--anim-in-right';

    newSlide.classList.add(animClass);
    newSlide.addEventListener(
      'animationend',
      () => newSlide.classList.remove(animClass),
      { once: true }
    );

    this.currentSlide = index;

    // --- Проверяем последний слайд ---
    const allSpots = this.wrapper.querySelectorAll('.prime-table__levels-progress-spot-after');

    // Сначала показываем все споты
    allSpots.forEach(spot => spot.style.display = 'block');
      
    // Если дошли до последнего слайда, скрываем споты
    if (this.currentSlide === this.slides.length - 1) {
      allSpots.forEach(spot => spot.style.display = 'none');
    }
  }

  touchStartHandler(e) {
    const t = e.touches[0];
    this.startX = t.clientX;
    this.startY = t.clientY;
    this.isHorizontalSwipe = false;
  }

  touchMoveHandler(e) {
    const t = e.touches[0];
    const diffX = Math.abs(t.clientX - this.startX);
    const diffY = Math.abs(t.clientY - this.startY);

    if (!this.isHorizontalSwipe && diffX > diffY && diffX > 10) {
      this.isHorizontalSwipe = true;
    }

    if (this.isHorizontalSwipe) {
      e.preventDefault();
    }
  }

  touchEndHandler(e) {
    if (!this.isHorizontalSwipe) return;

    const endX = e.changedTouches[0].clientX;

    if (endX - this.startX > 50 && this.currentSlide > 0) {
      this.showSlide(this.currentSlide - 1, 'right'); // свайп вправо — новый слайд с левой стороны
    } else if (this.startX - endX > 50 && this.currentSlide < this.slides.length - 1) {
      this.showSlide(this.currentSlide + 1, 'left'); // свайп влево — новый слайд с правой стороны
    }

  }

  checkSlider() {
    if (window.innerWidth <= 479) {
      if (!this.mobileSliderInitialized) this.initSlider();
    } else {
      this.destroySlider();
    }
  }
}

// ---------------------------------------------------
// YEAR SELECT
// ---------------------------------------------------
class TransactionYearSelect {
  constructor(container) {
    this.container = container;
    this.select = this.container.querySelector('.prime-table__transaction-select');
    if (!this.select) return;

    this.current = this.select.querySelector('.prime-table__transaction-select-current');
    this.currentValue = this.select.querySelector('.prime-table__transaction-select-value');
    this.options = this.select.querySelectorAll('.prime-table__transaction-select-option');

    this.init();
  }

  init() {
    this.current.addEventListener('click', () => this.toggle());
    this.options.forEach(option => {
      option.addEventListener('click', () =>
        this.selectYear(option.getAttribute('data-value'))
      );
    });

    document.addEventListener('click', (e) => {
      if (!this.select.contains(e.target)) this.close();
    });
  }

  toggle() {
    this.select.classList.toggle('prime-table__transaction-select--open');
  }

  open() {
    this.select.classList.add('prime-table__transaction-select--open');
  }

  close() {
    this.select.classList.remove('prime-table__transaction-select--open');
  }

  selectYear(value) {
    this.currentValue.textContent = value;
    this.close();
  }
}

// ---------------------------------------------------
// INIT
// ---------------------------------------------------
const primeTableContainer = document.getElementById('prime-table__init');
if (primeTableContainer) {
  new PopupController(primeTableContainer);
  new MobileSlider(primeTableContainer);
  new TransactionYearSelect(primeTableContainer);
}



