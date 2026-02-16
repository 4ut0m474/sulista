
-- Tabela de estabelecimentos/comércios
CREATE TABLE public.establishments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'comercio',
  city TEXT NOT NULL,
  state_abbr TEXT NOT NULL,
  sub_location TEXT,
  photo_url TEXT,
  address TEXT,
  phone TEXT,
  avg_rating NUMERIC(2,1) DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  is_vip BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de votos (anônimos com device fingerprint)
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  device_fingerprint TEXT NOT NULL,
  voter_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(establishment_id, device_fingerprint)
);

-- Índices para performance
CREATE INDEX idx_establishments_city_state ON public.establishments(city, state_abbr);
CREATE INDEX idx_establishments_avg_rating ON public.establishments(avg_rating DESC);
CREATE INDEX idx_votes_establishment ON public.votes(establishment_id);

-- Enable RLS
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- RLS: Estabelecimentos são públicos para leitura
CREATE POLICY "Establishments are publicly readable"
ON public.establishments FOR SELECT
USING (true);

-- RLS: Votos podem ser inseridos por qualquer um (anônimo)
CREATE POLICY "Anyone can vote"
ON public.votes FOR INSERT
WITH CHECK (true);

-- RLS: Votos são legíveis publicamente
CREATE POLICY "Votes are publicly readable"
ON public.votes FOR SELECT
USING (true);

-- Função para atualizar média de votos
CREATE OR REPLACE FUNCTION public.update_establishment_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.establishments
  SET 
    avg_rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.votes WHERE establishment_id = NEW.establishment_id),
    total_votes = (SELECT COUNT(*) FROM public.votes WHERE establishment_id = NEW.establishment_id),
    updated_at = now()
  WHERE id = NEW.establishment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para atualizar rating automaticamente
CREATE TRIGGER update_rating_on_vote
AFTER INSERT ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.update_establishment_rating();

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_establishments_updated_at
BEFORE UPDATE ON public.establishments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo com fotos reais
INSERT INTO public.establishments (name, description, category, city, state_abbr, photo_url, avg_rating, total_votes, address) VALUES
('Restaurante Madero', 'O melhor hambúrguer artesanal da cidade', 'restaurante', 'Curitiba', 'PR', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80', 4.8, 156, 'Rua XV de Novembro, 123'),
('Café do Mercado', 'Café artesanal e doces coloniais', 'cafeteria', 'Curitiba', 'PR', 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400&q=80', 4.6, 98, 'Mercado Municipal'),
('Padaria Italiana', 'Pães artesanais e massas frescas', 'padaria', 'Morretes', 'PR', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', 4.9, 203, 'Rua das Flores, 45'),
('Barreado do Porto', 'O tradicional barreado paranaense', 'restaurante', 'Morretes', 'PR', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80', 4.7, 178, 'Largo Dr. José Pereira, 12'),
('Artesanato Colonial', 'Peças artesanais da região', 'artesanato', 'Morretes', 'PR', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80', 4.5, 89, 'Centro Histórico'),
('Cachaçaria Terra Nova', 'Degustação de cachaças artesanais', 'bebidas', 'Morretes', 'PR', 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80', 4.4, 67, 'Estrada da Graciosa, km 5'),
('Sorveteria Gelatto', 'Sorvetes artesanais de frutas tropicais', 'sorveteria', 'Florianópolis', 'SC', 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80', 4.6, 134, 'Praia dos Ingleses'),
('Pousada Mar Azul', 'Hospedagem à beira-mar', 'hospedagem', 'Florianópolis', 'SC', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', 4.3, 56, 'Praia da Joaquina'),
('Restaurante Gaúcho', 'Churrascaria tradicional gaúcha', 'restaurante', 'Porto Alegre', 'RS', 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80', 4.5, 145, 'Av. Cristóvão Colombo, 890'),
('Empório Colonial', 'Produtos coloniais e queijos artesanais', 'emporio', 'Gramado', 'RS', 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&q=80', 4.8, 210, 'Rua Coberta');
