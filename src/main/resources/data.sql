INSERT INTO tasks (title, description, priority, status, due_date, created_at) VALUES
('Design landing page', 'Create a modern, responsive landing page with hero section and animations', 'HIGH', 'IN_PROGRESS', DATEADD('DAY', 3, CURRENT_DATE), CURRENT_TIMESTAMP),
('Set up CI/CD pipeline', 'Configure Jenkins pipelines for build, push and deploy to Kubernetes', 'HIGH', 'PENDING', DATEADD('DAY', 5, CURRENT_DATE), CURRENT_TIMESTAMP),
('Write API documentation', 'Document all REST endpoints with request/response examples', 'MEDIUM', 'PENDING', DATEADD('DAY', 7, CURRENT_DATE), CURRENT_TIMESTAMP),
('Fix login validation bug', 'Users can submit empty password field', 'HIGH', 'COMPLETED', DATEADD('DAY', -1, CURRENT_DATE), CURRENT_TIMESTAMP),
('Optimize database queries', 'Add indexes to improve dashboard load time', 'MEDIUM', 'IN_PROGRESS', DATEADD('DAY', 4, CURRENT_DATE), CURRENT_TIMESTAMP),
('Update dependencies', 'Bump Spring Boot and related libraries to latest stable versions', 'LOW', 'PENDING', DATEADD('DAY', 10, CURRENT_DATE), CURRENT_TIMESTAMP),
('Team standup notes', 'Summarize yesterday blockers and today plan', 'LOW', 'COMPLETED', DATEADD('DAY', -2, CURRENT_DATE), CURRENT_TIMESTAMP),
('Design dark mode palette', 'Pick accessible color tokens for the dark theme', 'MEDIUM', 'COMPLETED', DATEADD('DAY', -3, CURRENT_DATE), CURRENT_TIMESTAMP);
