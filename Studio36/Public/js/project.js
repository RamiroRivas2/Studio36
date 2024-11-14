document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    fetch('/api/projects')
        .then(response => response.json())
        .then(projects => {
            const project = projects.find(proj => proj.id == projectId);
            if (project) {
                const projectDetails = document.getElementById('project-details');
                projectDetails.innerHTML = `
          <h1>${project.title}</h1>
          <p><strong>Location:</strong> ${project.location}</p>
          <p><strong>Year:</strong> ${project.year}</p>
          <p><strong>Client:</strong> ${project.client}</p>
          <p>${project.description}</p>
          <img src="${project.image}" alt="${project.title}">
        `;
            } else {
                projectDetails.innerHTML = '<p>Project not found.</p>';
            }
        })
        .catch(err => console.error('Error loading project details:', err));
});
