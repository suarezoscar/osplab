-- AddColumn: ownerName opcional en Pharmacy
-- Almacena el nombre del titular/propietario cuando la fuente lo distingue
-- del nombre comercial (ej: COF Ourense tiene nombre_fiscal + nombre).
ALTER TABLE "Pharmacy" ADD COLUMN "ownerName" TEXT;

