document.addEventListener("DOMContentLoaded", function () {
  const navi = document.getElementById("aside");
  const nBtn = document.getElementById("nav-btn");

  nBtn.addEventListener("click", function () {
    if (navi.style.display === "grid") {
      navi.style.display = "none";
    } else {
      navi.style.display = "grid";
    }
  });

  fetch("docs.md")
    .then((response) => response.text())
    .then((markdown) => {
      const converter = new showdown.Converter();
      const html = converter.makeHtml(markdown);
      document.getElementById("markdown-container").innerHTML = html;
    })
    .catch((err) => console.error(err));
});
