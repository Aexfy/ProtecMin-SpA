// Endpoint configurable de Formspree.
// Endpoint activo de Formspree para el formulario de contacto.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xzdavjao";

const header = document.querySelector(".site-header");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const navLinks = document.querySelectorAll("a[href^='#']");
const form = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const yearEl = document.getElementById("currentYear");
const phoneInput = form?.elements?.telefono;

// Ano dinamico en footer.
yearEl.textContent = new Date().getFullYear();

// Menu hamburguesa movil.
function setMenuState(isOpen) {
  mainNav.classList.toggle("is-open", isOpen);
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
}

menuToggle.addEventListener("click", () => {
  const willOpen = !mainNav.classList.contains("is-open");
  setMenuState(willOpen);
});

// Cerrar menu al hacer click fuera en movil.
document.addEventListener("click", (event) => {
  if (!mainNav.classList.contains("is-open")) {
    return;
  }

  const clickedInsideMenu = mainNav.contains(event.target) || menuToggle.contains(event.target);
  if (!clickedInsideMenu) {
    setMenuState(false);
  }
});

// Scroll suave con compensacion de header fijo.
function smoothScrollToSection(targetId) {
  const target = document.querySelector(targetId);
  if (!target) {
    return;
  }

  const headerOffset = header.offsetHeight;
  const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset + 1;

  window.scrollTo({
    top: targetTop,
    behavior: "smooth"
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) {
      return;
    }

    event.preventDefault();
    smoothScrollToSection(targetId);

    if (mainNav.classList.contains("is-open")) {
      setMenuState(false);
    }
  });
});

// Cerrar menu al cambiar tamano de pantalla.
window.addEventListener("resize", () => {
  if (window.innerWidth > 768 && mainNav.classList.contains("is-open")) {
    setMenuState(false);
  }
});

// Animacion al hacer scroll.
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  // Fallback para navegadores antiguos.
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

function clearFieldError(fieldName) {
  const errorEl = form.querySelector(`[data-error-for='${fieldName}']`);
  const input = form.elements[fieldName];

  if (errorEl) {
    errorEl.textContent = "";
  }

  if (input) {
    input.classList.remove("error");
  }
}

function setFieldError(fieldName, message) {
  const errorEl = form.querySelector(`[data-error-for='${fieldName}']`);
  const input = form.elements[fieldName];

  if (errorEl) {
    errorEl.textContent = message;
  }

  if (input) {
    input.classList.add("error");
  }
}

function validateEmail(emailValue) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(emailValue);
}

function formatChileMobilePhone(value) {
  let subscriber = value.replace(/\D/g, "");

  // Normaliza entradas con prefijos comunes (+56, 56, 09 o 9XXXXXXXX).
  if (subscriber.startsWith("56")) {
    subscriber = subscriber.slice(2);
    if (subscriber.startsWith("9")) {
      subscriber = subscriber.slice(1);
    }
  } else if (subscriber.startsWith("09")) {
    subscriber = subscriber.slice(2);
  } else if (subscriber.length === 9 && subscriber.startsWith("9")) {
    // Caso tipico al pegar numero nacional: 9XXXXXXXX.
    subscriber = subscriber.slice(1);
  }

  // Solo se permiten 8 digitos del abonado.
  subscriber = subscriber.slice(0, 8);
  if (!subscriber) {
    return "";
  }

  const firstBlock = subscriber.slice(0, 4);
  const secondBlock = subscriber.slice(4);

  if (!secondBlock) {
    return `+56 9 ${firstBlock}`;
  }

  return `+56 9 ${firstBlock} ${secondBlock}`;
}

function isValidChileMobilePhone(value) {
  return /^\+56 9 \d{4} \d{4}$/.test(value.trim());
}

if (phoneInput) {
  const applyPhoneMask = () => {
    phoneInput.value = formatChileMobilePhone(phoneInput.value);
  };

  // Cubre escritura, pegado, autocomplete y cambios manuales.
  ["input", "change", "blur", "keyup"].forEach((eventName) => {
    phoneInput.addEventListener(eventName, applyPhoneMask);
  });

  phoneInput.addEventListener("paste", () => {
    setTimeout(applyPhoneMask, 0);
  });

  // Formatea valor inicial si el navegador autocompleta el campo.
  setTimeout(applyPhoneMask, 0);
}

function validateForm() {
  let isValid = true;

  ["nombre", "correo", "telefono", "mensaje"].forEach((name) => clearFieldError(name));
  formStatus.textContent = "";
  formStatus.className = "form-status";

  const nombre = form.nombre.value.trim();
  const correo = form.correo.value.trim();
  const telefono = form.telefono.value.trim();
  const mensaje = form.mensaje.value.trim();

  if (!nombre) {
    setFieldError("nombre", "Ingresa tu nombre.");
    isValid = false;
  }

  if (!correo) {
    setFieldError("correo", "Ingresa tu correo.");
    isValid = false;
  } else if (!validateEmail(correo)) {
    setFieldError("correo", "Ingresa un correo válido.");
    isValid = false;
  }

  if (!telefono) {
    setFieldError("telefono", "Ingresa tu teléfono.");
    isValid = false;
  } else if (!isValidChileMobilePhone(telefono)) {
    setFieldError("telefono", "Usa el formato +56 9 xxxx xxxx.");
    isValid = false;
  }

  if (!mensaje) {
    setFieldError("mensaje", "Ingresa tu mensaje.");
    isValid = false;
  }

  return isValid;
}

async function handleFormSubmit(event) {
  event.preventDefault();

  if (!validateForm()) {
    formStatus.textContent = "Revisa los campos marcados antes de enviar.";
    formStatus.classList.add("error");
    return;
  }

  const configuredEndpoint = form.dataset.endpoint?.trim() || FORMSPREE_ENDPOINT;
  if (!configuredEndpoint || configuredEndpoint.includes("REEMPLAZAR_ENDPOINT")) {
    formStatus.textContent = "Configura tu endpoint de Formspree antes de enviar.";
    formStatus.classList.add("error");
    return;
  }

  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";

  try {
    const formData = new FormData(form);

    const response = await fetch(configuredEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error("No fue posible enviar la solicitud.");
    }

    form.reset();
    formStatus.textContent = "Solicitud enviada correctamente. Te contactaremos pronto.";
    formStatus.classList.add("success");
  } catch (error) {
    formStatus.textContent = "Ocurrió un error al enviar. Intenta nuevamente.";
    formStatus.classList.add("error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar solicitud";
  }
}

form.addEventListener("submit", handleFormSubmit);
