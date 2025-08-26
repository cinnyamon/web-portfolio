export const pageObserver = () => {
  const aboutSect = document.querySelector('.about-section');
  const titleBox = document.querySelector('.title-box');
  const headerHeight = document.querySelector('header').getBoundingClientRect().height;

  const observer = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log('its intersecting')
        aboutSect.classList.remove('about-section-scroll')
        return;
      }
      
      if (!entry.isIntersecting) {
        console.log('its not intersecting anymore')
        aboutSect.classList.add('about-section-scroll')
        return;
      }
    })

  }, {
    threshold: 0.99,
    rootMargin: `-${headerHeight}px 0px 0px 0px`
  })

  observer.observe(titleBox);
}