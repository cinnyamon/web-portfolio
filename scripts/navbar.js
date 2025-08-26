export const navDropDownAction = () => {
  const openDropdownBtn = document.querySelector('.open-link-bar');
  const dropdownBtnSVG = document.querySelector('.open-link-bar > svg');
  const dropdownMenu = document.querySelector('.dropdown-link-menu');

  const toggleDropdown = () => {
    dropdownBtnSVG.classList.toggle('svg-rotated');
    dropdownMenu.classList.toggle('dropdown-show');
  }

  openDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // makes event listener on document not take the button in consideration
    toggleDropdown();
  });

  document.addEventListener('click', (e) => {
    if (
      dropdownBtnSVG.classList.contains('svg-rotated') &&
      dropdownMenu.classList.contains('dropdown-show')) 
      {
        toggleDropdown()
      }
  })
}