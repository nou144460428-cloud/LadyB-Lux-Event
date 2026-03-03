DO $$
BEGIN
  IF to_regclass('"Material"') IS NOT NULL THEN
    ALTER TABLE "Material"
      ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "size" TEXT,
      ADD COLUMN IF NOT EXISTS "colour" TEXT,
      ADD COLUMN IF NOT EXISTS "options" TEXT;
  ELSIF to_regclass('material') IS NOT NULL THEN
    ALTER TABLE material
      ADD COLUMN IF NOT EXISTS "imageUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "size" TEXT,
      ADD COLUMN IF NOT EXISTS "colour" TEXT,
      ADD COLUMN IF NOT EXISTS "options" TEXT;
  ELSE
    CREATE TABLE "Material" (
      "id" TEXT NOT NULL,
      "vendorId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "imageUrl" TEXT,
      "size" TEXT,
      "colour" TEXT,
      "options" TEXT,
      "quantity" DOUBLE PRECISION NOT NULL,
      "unit" TEXT NOT NULL,
      "price" DOUBLE PRECISION NOT NULL,
      "category" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
    );

    ALTER TABLE "Material"
      ADD CONSTRAINT "Material_vendorId_fkey"
      FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
