-- Add clientId to Project model
ALTER TABLE projects ADD COLUMN client_id TEXT;
ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Add clientId to Job model  
ALTER TABLE jobs ADD COLUMN client_id TEXT;
ADD CONSTRAINT jobs_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS projects_client_id_idx ON projects(client_id);
CREATE INDEX IF NOT EXISTS jobs_client_id_idx ON jobs(client_id);

-- Update existing DataFlow Innovations project to link to client
UPDATE projects 
SET client_id = 'client-dataflow-innovations' 
WHERE client_name ILIKE '%DataFlow%';

-- Update existing jobs in DataFlow project to link to client
UPDATE jobs 
SET client_id = 'client-dataflow-innovations' 
WHERE project_id IN (
  SELECT id FROM projects WHERE client_id = 'client-dataflow-innovations'
); 