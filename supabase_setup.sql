-- ====================================================
-- COPIÁ TODO ESTE TEXTO Y PEGALO EN EL "SQL EDITOR" DE SUPABASE
-- (instrucciones en el PASO 2 del archivo INSTRUCCIONES.txt)
-- ====================================================

-- Tabla de parejas
create table parejas (
  id text primary key,
  categoria text not null,
  grupo_id text not null,
  jugadora1 text not null,
  jugadora2 text not null,
  cardales boolean default false
);

-- Tabla de partidos (zona de grupos)
create table partidos (
  id text primary key,
  categoria text not null,
  grupo_id text not null,
  pareja1_id text references parejas(id),
  pareja2_id text references parejas(id),
  sets jsonb default '[]'::jsonb,
  jugado boolean default false,
  simulado boolean default false
);

-- Tabla de horarios y canchas
create table horarios (
  partido_id text primary key,
  cancha text,
  hora text,
  a_continuacion boolean default false,
  a_continuacion_de text
);

-- Tabla del cuadro de playoff
create table playoff (
  categoria text primary key,
  datos jsonb not null,
  es_vista_previa boolean default true
);

-- Tabla de configuración general (modo de playoff, orden de desempate, etc)
create table configuracion (
  clave text primary key,
  valor jsonb not null
);

-- Permitir que la app lea y escriba en estas tablas
-- (esto es necesario para que la app pueda funcionar sin un login complejo)
alter table parejas enable row level security;
alter table partidos enable row level security;
alter table horarios enable row level security;
alter table playoff enable row level security;
alter table configuracion enable row level security;

create policy "Acceso publico parejas" on parejas for all using (true) with check (true);
create policy "Acceso publico partidos" on partidos for all using (true) with check (true);
create policy "Acceso publico horarios" on horarios for all using (true) with check (true);
create policy "Acceso publico playoff" on playoff for all using (true) with check (true);
create policy "Acceso publico configuracion" on configuracion for all using (true) with check (true);
