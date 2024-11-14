document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/projects')
        .then(response => response.json())
        .then(projects => {
            const gallery = document.getElementById('gallery');
            projects.forEach(project => {
                const card = document.createElement('div');
                card.classList.add('project-card');
                card.innerHTML = `
          <img src="${project.image}" alt="${project.title}">
          <div class="project-info">
            <h3>${project.title}</h3>
            <p>${project.location} | ${project.year}</p>
          </div>
        `;
                card.addEventListener('click', () => {
                    window.location.href = `/project.html?id=${project.id}`;
                });
                gallery.appendChild(card);
            });

            // Add hover animation to project cards
            document.querySelectorAll('.project-card').forEach(card => {
                card.addEventListener('mouseenter', () => {
                    gsap.to(card, { scale: 1.05, duration: 0.3 });
                });
                card.addEventListener('mouseleave', () => {
                    gsap.to(card, { scale: 1, duration: 0.3 });
                });
            });
        })
        .catch(err => console.error('Error loading projects:', err));
});
