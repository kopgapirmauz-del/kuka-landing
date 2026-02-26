// footer year
document.getElementById("year").textContent = new Date().getFullYear();

// catalog filter
const chips = document.querySelectorAll(".chip");
const products = document.querySelectorAll(".product");

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");

    const f = chip.dataset.filter;
    products.forEach(p => {
      const ok = (f === "all") || (p.dataset.type === f);
      p.style.display = ok ? "block" : "none";
    });
  });
});