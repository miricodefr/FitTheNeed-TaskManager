// This function loads the navbar into any page automatically
function loadNavbar() {
    fetch("components/navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar").innerHTML = data;
        });
}

// Run it when the page loads
document.addEventListener("DOMContentLoaded", loadNavbar);