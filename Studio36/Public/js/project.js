document.addEventListener("DOMContentLoaded", () => {
    const projectId = new URLSearchParams(window.location.search).get('id');

    fetch(`/api/project/${projectId}`)
        .then(response => {
            if (!response.ok) throw new Error('Project not found');
            return response.json();
        })
        .then(project => {
            document.getElementById('projectTitle').innerText = project.title;
            document.getElementById('projectLocation').innerText = project.location;
            document.getElementById('projectYear').innerText = project.year;
            document.getElementById('projectClient').innerText = project.client;
            document.getElementById('projectTypology').innerText = project.typology;
            document.getElementById('projectSize').innerText = project.size;
            document.getElementById('projectStatus').innerText = project.status;
            document.getElementById('projectDescription').innerText = project.description;
            document.getElementById('projectImage').src = project.image;
        })
        .catch(error => {
            document.getElementById('projectDetails').innerHTML = `<p>${error.message}</p>`;
        });

    // Back to projects button
    document.getElementById('backButton').addEventListener('click', () => {
        window.history.back();
    });
});
