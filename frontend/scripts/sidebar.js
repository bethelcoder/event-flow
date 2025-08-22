document.addEventListener("DOMContentLoaded", function() {
    const toggleBtn = document.getElementById("toggle_btn");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");

    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("hidden");
        mainContent.classList.toggle("expanded");
    });
});
