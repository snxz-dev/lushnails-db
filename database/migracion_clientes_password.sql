-- Permite el registro e inicio de sesión de clientes en bases existentes.
-- Los clientes registrados por recepción pueden seguir sin contraseña.
ALTER TABLE cliente ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
