"use strict";

/* disable zoom */
document.addEventListener("keydown", function (e) {
  if (
    e.ctrlKey &&
    (e.keyCode == "61" ||
      e.keyCode == "107" ||
      e.keyCode == "173" ||
      e.keyCode == "109" ||
      e.keyCode == "187" ||
      e.keyCode == "189")
  ) {
    e.preventDefault();
  }
});
document.addEventListener(
  "wheel",
  function (e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  },
  {
    passive: false,
  }
);

/* human mode / dev mode */
var humanMode = false;
let controller = new Controller(0.2, humanMode);

/* instruction slider */
let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides((slideIndex += n));
}

function currentSlide(n) {
  showSlides((slideIndex = n));
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}
