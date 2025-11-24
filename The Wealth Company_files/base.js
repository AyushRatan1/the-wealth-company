AOS.init({
  duration: 1000,
  easing: "ease-in-out",
});

window.addEventListener("scroll", () => {
  const navbar = document.getElementById("fixed-nav");
  // Check if the scroll offset is greater than 100vh (window.innerHeight)
  if (window.scrollY > 150) {
    // Make the navbar visible
    navbar.classList.remove("opacity-0", "invisible");
    navbar.classList.add("opacity-100", "visible");
  } else {
    // Hide the navbar again
    navbar.classList.remove("opacity-100", "visible");
    navbar.classList.add("opacity-0", "invisible");
  }
});

// Select all accordion header buttons
const accordionHeaders = document.querySelectorAll(".accordion-header");

accordionHeaders.forEach((header) => {
  header.addEventListener("click", () => {
    // Find the closest parent .accordion-item
    const accordionItem = header.closest(".accordion-item");
    // Inside that .accordion-item, find the .accordion-content
    const accordionContent = accordionItem.querySelector(".accordion-content");

    // (Optional) Close any other open accordions, if you want only one open
    document.querySelectorAll(".accordion-item").forEach((item) => {
      if (item !== accordionItem) {
        const content = item.querySelector(".accordion-content");
        content.style.maxHeight = null; // Close other items
        // Reset chevron rotation on other items
        const icon = item.querySelector("svg");
        icon && icon.classList.remove("rotate-180");
      }
    });

    // Toggle the current accordion
    if (accordionContent.style.maxHeight) {
      // If it's open, close it
      accordionContent.style.maxHeight = null;
      header.querySelector("svg").classList.remove("rotate-180");
    } else {
      // If it's closed, open it
      accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
      header.querySelector("svg").classList.add("rotate-180");
    }
  });
});

function openNav() {
  // open the nav menu from side
  document.getElementById("mobile-nav").style.display = "flex";
  document.getElementById("mobile-nav").style.transform = "translate(0, 0)";
  document.getElementById("mobile-nav").style.opacity = "1";
}
function closeNav() {
  // close the nav menu from side
  document.getElementById("mobile-nav").style.opacity = "0";
  document.getElementById("mobile-nav").style.transform = "translate(100vw, 0)";
}

const rootNode = document.querySelector(".embla");
const viewportNode = rootNode.querySelector(".embla__viewport");
// Grab button nodes
const prevButtonNode = rootNode.querySelector(".embla__prev");
const nextButtonNode = rootNode.querySelector(".embla__next");
const options = {
  loop: true,
  draggable: true,
  dragFree: true,
  alignScroll: true,
  containScroll: true,
};
const plugins = [EmblaCarouselAutoplay(
  {
    speed: 300,
    direction: "ltr",
    pauseOnHover: true,
    pauseOnFocus: true,
    waitForTransitions: true,
  }
)];
const emblaApi = EmblaCarousel(viewportNode, options, plugins);

prevButtonNode.addEventListener("click", emblaApi.scrollPrev, false);
nextButtonNode.addEventListener("click", emblaApi.scrollNext, false);




function scrollDown() {
  // scroll 100vh
  window.scrollTo({
    top: window.innerHeight - 100,
    behavior: "smooth",
  });
}


function subscribeToNewsletter() {
  // Get the email input value
  const emailInput = document.getElementById("emailInput");
  const email = emailInput.value;

  // Basic validation
  if (email.trim() === "") {
    alert("Please enter a valid email address.");
    return;
  }

  // Here you could add an AJAX request to submit the email to your backend.
  // For demonstration, we'll simply show the thank you modal.
  document.getElementById("thankYouModal").classList.remove("invisible");
  document.getElementById("thankYouModal").classList.add("opacity-100");

  // Optionally, clear the input after subscribing:
  emailInput.value = "";
}

function closeThankYouModal() {
  // Hide the modal
  document.getElementById("thankYouModal").classList.remove("opacity-100");
  document.getElementById("thankYouModal").classList.add("invisible");
    document.getElementById("thankYouContactModal").classList.remove("opacity-100");
    document.getElementById("thankYouContactModal").classList.add("invisible");
}