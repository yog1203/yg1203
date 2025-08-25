-- Complete schema + seeds (SERIAL IDs) with roles: admin, distributor, user
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distributors (
  id SERIAL PRIMARY KEY,
  fname TEXT NOT NULL,
  mname TEXT,
  lname TEXT NOT NULL,
  address TEXT,
  mobile1 TEXT NOT NULL,
  mobile2 TEXT,
  email TEXT,
  location TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reader_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- edition can be negative/zero as requested
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  book_type TEXT NOT NULL,
  edition INTEGER NOT NULL,
  book_language TEXT NOT NULL,
  issue_date TIMESTAMPTZ NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  location TEXT NOT NULL,
  faulty_books INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS storetodistributor (
  id SERIAL PRIMARY KEY,
  distributor_id INTEGER NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT,
  book_type TEXT NOT NULL CHECK (book_type = ANY (ARRAY['BhaktiChaitanya-I','BhaktiChaitanya-II','BhaktiChaitanya-III'])),
  book_language TEXT NOT NULL CHECK (book_language = ANY (ARRAY['Marathi','Hindi','English'])),
  edition INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  location TEXT NOT NULL CHECK (location = ANY (ARRAY['Mumbai','Pune'])),
  distribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reader_assignments (
  id SERIAL PRIMARY KEY,
  distributor_id   INTEGER NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT,
  store_id         INTEGER NOT NULL REFERENCES stores(id)        ON DELETE RESTRICT,
  reader_type_id   INTEGER NOT NULL REFERENCES reader_types(id)  ON DELETE RESTRICT,
  mediator_fname   TEXT,
  mediator_lname   TEXT,
  reader_fname     TEXT NOT NULL,
  reader_lname     TEXT,
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  phone            TEXT,
  assignment_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  reader_place     TEXT
);

-- Seeds: roles
INSERT INTO users (email, password, name, role) VALUES
('admin@example.com','admin123','Admin','admin'),
('dist@example.com','dist123','Distributor User','distributor'),
('user@example.com','user123','Normal User','user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO reader_types (name) VALUES ('Individual') ON CONFLICT (name) DO NOTHING;
INSERT INTO reader_types (name) VALUES ('Organization') ON CONFLICT (name) DO NOTHING;

INSERT INTO distributors (fname,mname,lname,address,mobile1,mobile2,email,location) VALUES
('Ramesh',NULL,'Patil','Pune','9876543210',NULL,'ramesh@distrib.test','Pune'),
('Meera','S.','Joshi','Mumbai','9123456780',NULL,'meera@distrib.test','Mumbai')
ON CONFLICT DO NOTHING;

-- sample stores (including negative/zero editions)
INSERT INTO stores (book_type,edition,book_language,issue_date,owner_id,quantity,location,faulty_books) VALUES
('BhaktiChaitanya-I',  1,'Marathi','2024-01-10T10:00:00+05:30', 1, 120,'Pune', 2),
('BhaktiChaitanya-II', 0,'English','2024-02-20T09:00:00+05:30', 2, 200,'Mumbai',1),
('BhaktiChaitanya-III',-1,'Hindi','2024-03-15T12:00:00+05:30', 1, 80,'Pune',0)
ON CONFLICT DO NOTHING;

INSERT INTO storetodistributor (distributor_id,book_type,book_language,edition,quantity,location,distribution_date) VALUES
(1,'BhaktiChaitanya-I','Marathi',1,30,'Pune','2024-03-01'),
(2,'BhaktiChaitanya-II','English',0,40,'Mumbai','2024-03-05'),
(1,'BhaktiChaitanya-III','Hindi',-1,20,'Pune','2024-04-10')
ON CONFLICT DO NOTHING;

INSERT INTO reader_assignments (distributor_id,store_id,reader_type_id,mediator_fname,mediator_lname,reader_fname,reader_lname,quantity,phone,assignment_date,reader_place) VALUES
(1,1,1,'Ramesh',NULL,'Hari','Achrekar',1,'9769990826','2024-03-10','Mumbai'),
(2,2,2,'Meera','Joshi','Shivam','Trust',10,'9898989898','2024-03-12','Thane'),
(1,3,1,'Ramesh',NULL,'Anita','K',2,'9000000000','2024-04-20','Pune')
ON CONFLICT DO NOTHING;
