DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    WHERE t.typname = 'Role'
  ) THEN
    ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STAFF';
  END IF;
END $$;
