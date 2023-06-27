const toggleButton = document.querySelector("#toggleSideBar");
const toggleButtonHide = document.getElementById("toggleSideBarHide");
const sidebar = document.querySelector("#accordionSidebar");

toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar-hidden");
    setTimeout(() => {
        sidebar.classList.add("hide");
    }, 200);
    toggleButtonHide.classList.remove("hide");
});

toggleButtonHide.addEventListener("click", () => {
    sidebar.classList.remove("hide");
    sidebar.classList.remove("sidebar-hidden");
    toggleButtonHide.classList.add("hide");
});