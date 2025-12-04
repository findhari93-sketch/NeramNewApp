-- Create exam_centers table for NATA and JEE Paper 2 exam centers
-- This table stores information about all exam centers across India

CREATE TABLE IF NOT EXISTS exam_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  exam_type VARCHAR(50) NOT NULL CHECK (exam_type IN ('NATA', 'JEE Paper 2')),
  state VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  center_name VARCHAR(255) NOT NULL,
  center_code VARCHAR(50),
  description TEXT,
  
  -- Address & Location
  address TEXT NOT NULL,
  pincode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_link VARCHAR(500),
  
  -- Contact Information
  phone_number VARCHAR(20),
  alternate_phone VARCHAR(20),
  email VARCHAR(255),
  contact_person VARCHAR(255),
  contact_designation VARCHAR(255),
  
  -- Additional Details
  facilities TEXT,
  instructions TEXT,
  nearest_railway VARCHAR(255),
  nearest_bus_stand VARCHAR(255),
  landmarks TEXT,
  capacity INTEGER,
  
  -- Years & Status
  active_years INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  is_confirmed_current_year BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_by UUID,
  updated_by UUID
);

-- Add indexes for faster queries
CREATE INDEX idx_exam_centers_exam_type ON exam_centers(exam_type);
CREATE INDEX idx_exam_centers_state ON exam_centers(state);
CREATE INDEX idx_exam_centers_city ON exam_centers(city);
CREATE INDEX idx_exam_centers_status ON exam_centers(status);
CREATE INDEX idx_exam_centers_exam_type_state_city ON exam_centers(exam_type, state, city);
CREATE INDEX idx_exam_centers_is_confirmed ON exam_centers(is_confirmed_current_year);
CREATE INDEX idx_exam_centers_center_name ON exam_centers USING GIN (to_tsvector('english', center_name));
CREATE INDEX idx_exam_centers_address ON exam_centers USING GIN (to_tsvector('english', address));

-- Create view for unique states by exam type
CREATE OR REPLACE VIEW exam_center_states AS
SELECT DISTINCT 
  exam_type,
  state,
  COUNT(*) as center_count
FROM exam_centers
WHERE status != 'discontinued'
GROUP BY exam_type, state
ORDER BY exam_type, state;

-- Create view for unique cities by state and exam type
CREATE OR REPLACE VIEW exam_center_cities AS
SELECT DISTINCT 
  exam_type,
  state,
  city,
  COUNT(*) as center_count
FROM exam_centers
WHERE status != 'discontinued'
GROUP BY exam_type, state, city
ORDER BY exam_type, state, city;

-- Create view for exam center statistics
CREATE OR REPLACE VIEW exam_center_stats AS
SELECT 
  exam_type,
  COUNT(*) as total_centers,
  COUNT(CASE WHEN is_confirmed_current_year THEN 1 END) as confirmed_current_year,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
  COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_count,
  COUNT(CASE WHEN status = 'discontinued' THEN 1 END) as discontinued_count
FROM exam_centers
GROUP BY exam_type;

-- Enable Row Level Security
ALTER TABLE exam_centers ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (select only)
CREATE POLICY "Public read exam centers" 
ON exam_centers FOR SELECT
USING (status != 'discontinued');

-- Create policy for authenticated users to read all centers
CREATE POLICY "Authenticated read all exam centers" 
ON exam_centers FOR SELECT
TO authenticated
USING (true);

-- Create policy for admin users to insert/update/delete
-- This assumes you have a is_admin function or admin role
CREATE POLICY "Admin insert exam centers" 
ON exam_centers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by OR EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admin update exam centers" 
ON exam_centers FOR UPDATE
TO authenticated
USING (auth.uid() = updated_by OR EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (auth.uid() = updated_by OR EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admin delete exam centers" 
ON exam_centers FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_exam_centers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS exam_centers_updated_at_trigger ON exam_centers;
CREATE TRIGGER exam_centers_updated_at_trigger
BEFORE UPDATE ON exam_centers
FOR EACH ROW
EXECUTE FUNCTION update_exam_centers_updated_at();

-- Add helpful comments
COMMENT ON TABLE exam_centers IS 'Exam centers for NATA and JEE Paper 2 across India';
COMMENT ON COLUMN exam_centers.exam_type IS 'Type of exam: NATA or JEE Paper 2';
COMMENT ON COLUMN exam_centers.active_years IS 'Array of years when this center was/is active (e.g., {2022, 2023, 2024})';
COMMENT ON COLUMN exam_centers.is_confirmed_current_year IS 'Whether this center is confirmed for the current year';
COMMENT ON COLUMN exam_centers.status IS 'Center status: active, inactive, or discontinued';

-- Grant permissions
GRANT SELECT ON exam_centers TO anon, authenticated;
GRANT ALL ON exam_centers TO authenticated;
GRANT SELECT ON exam_center_states TO anon, authenticated;
GRANT SELECT ON exam_center_cities TO anon, authenticated;
GRANT SELECT ON exam_center_stats TO anon, authenticated;
