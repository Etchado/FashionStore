-- Fashion Store — Seed Data
-- Run after schema.sql

INSERT INTO public.products (id, name, brand, category, price, original_price, rating, review_count, badges, in_stock, stock_count, image, description, notes, specs, sku) VALUES

-- PERFUMES
('p1', 'Bleu de Chanel', 'Chanel', 'perfumes', 185, 220, 4.8, 312, '{"BESTSELLER"}', true, 24,
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80',
  'A bold, clean fragrance that defies the rules of traditional perfumery.',
  'Top: Grapefruit, Lemon | Heart: Ginger, Nutmeg | Base: Sandalwood, Cedarwood',
  '{"Concentration":"EDP","Gender":"Men","Season":"All-Year","Longevity":"8–10 hrs"}', 'CH-BDC-001'),

('p2', 'Miss Dior Blooming Bouquet', 'Dior', 'perfumes', 162, NULL, 4.7, 241, '{"NEW"}', true, 18,
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80',
  'A sparkling floral fragrance that captures the joy of femininity.',
  'Top: Pink Pepper | Heart: Peony, Rose | Base: White Musk',
  '{"Concentration":"EDT","Gender":"Women","Season":"Spring/Summer","Longevity":"6–8 hrs"}', 'DR-MBB-002'),

('p3', 'Oud Wood', 'Tom Ford', 'perfumes', 340, NULL, 4.9, 187, '{"EXCLUSIVE"}', true, 7,
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80',
  'Rare oud wood blended with sandalwood and cardamom.',
  'Top: Chinese Pepper | Heart: Oud Wood | Base: Sandalwood, Vetiver',
  '{"Concentration":"EDP","Gender":"Unisex","Season":"Fall/Winter","Longevity":"10–12 hrs"}', 'TF-OW-003'),

('p4', 'Aventus', 'Creed', 'perfumes', 495, 550, 4.9, 428, '{"BESTSELLER","EXCLUSIVE"}', true, 12,
  'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&q=80',
  'Inspired by Napoleon Bonaparte — strength, power, and success.',
  'Top: Pineapple, Bergamot | Heart: Jasmine, Rose | Base: Oak Moss, Ambergris',
  '{"Concentration":"EDP","Gender":"Men","Season":"Spring/Fall","Longevity":"12+ hrs"}', 'CR-AV-004'),

('p5', 'Replica — Jazz Club', 'Maison Margiela', 'perfumes', 175, 210, 4.6, 156, '{"SALE"}', true, 20,
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80',
  'Transporting you to a late-night jazz club.',
  'Top: Pink Pepper, Neroli | Heart: Tobacco Leaf, Rum | Base: Vetiver, Musk',
  '{"Concentration":"EDT","Gender":"Unisex","Season":"Fall/Winter","Longevity":"7–9 hrs"}', 'MM-JC-005'),

('p6', 'La Nuit de L''Homme', 'Yves Saint Laurent', 'perfumes', 128, NULL, 4.5, 298, '{"BESTSELLER"}', false, 0,
  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',
  'An intense and elegant fragrance for the modern man.',
  'Top: Cardamom, Bergamot | Heart: Cedar | Base: Vetiver, Coumarin',
  '{"Concentration":"EDT","Gender":"Men","Season":"Evening","Longevity":"8 hrs"}', 'YSL-LNH-006'),

-- WATCHES
('w1', 'Submariner Date', 'Rolex', 'watches', 12500, NULL, 5.0, 89, '{"EXCLUSIVE","BESTSELLER"}', true, 3,
  'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80',
  'The benchmark of dive watches with unidirectional rotatable bezel.',
  NULL,
  '{"Case":"41mm Oystersteel","Movement":"Calibre 3235","Water Resistance":"300m","Power Reserve":"70 hrs"}', 'RX-SUB-001'),

('w2', 'Seamaster Diver 300M', 'Omega', 'watches', 5800, 6200, 4.8, 143, '{"SALE"}', true, 8,
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80',
  'Favoured by James Bond. Master Chronometer certified.',
  NULL,
  '{"Case":"42mm Steel","Movement":"Co-Axial 8800","Water Resistance":"300m","Power Reserve":"55 hrs"}', 'OM-SD-002'),

('w3', 'Carrera Chronograph', 'TAG Heuer', 'watches', 3400, NULL, 4.6, 77, '{"NEW"}', true, 11,
  'https://images.unsplash.com/photo-1625614494268-814e3f6cc530?w=600&q=80',
  'Born on the racetrack. Motorsport heritage meets modern precision.',
  NULL,
  '{"Case":"44mm Steel","Movement":"Calibre Heuer 02","Water Resistance":"100m","Power Reserve":"80 hrs"}', 'TH-CAR-003'),

('w4', 'Santos de Cartier', 'Cartier', 'watches', 7200, NULL, 4.9, 62, '{"EXCLUSIVE"}', true, 5,
  'https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?w=600&q=80',
  'Iconic square case, exposed screws, and interchangeable straps.',
  NULL,
  '{"Case":"39.8mm Steel","Movement":"Calibre 1847 MC","Water Resistance":"100m","Power Reserve":"40 hrs"}', 'CT-SDC-004'),

('w5', 'Portugieser Chronograph', 'IWC', 'watches', 8900, 9500, 4.7, 48, '{"SALE","EXCLUSIVE"}', true, 4,
  'https://images.unsplash.com/photo-1509941943102-10c232535736?w=600&q=80',
  'Elegant proportions, clean white dial, and finest Swiss movement.',
  NULL,
  '{"Case":"41mm Steel","Movement":"Calibre 79350","Water Resistance":"30m","Power Reserve":"44 hrs"}', 'IW-PTC-005'),

-- ACCESSORIES
('a1', 'GG Marmont Sunglasses', 'Gucci', 'accessories', 385, NULL, 4.6, 134, '{"BESTSELLER"}', true, 22,
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
  'Oversized square frames with the iconic GG logo.',
  NULL,
  '{"Frame":"Acetate","Lens":"Grey Gradient","UV Protection":"UV400","Made In":"Italy"}', 'GC-GGM-001'),

('a2', 'Clic H Bracelet', 'Hermès', 'accessories', 725, NULL, 4.9, 88, '{"EXCLUSIVE"}', true, 9,
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
  'The Clic H bracelet with iconic H clasp and calfskin leather.',
  NULL,
  '{"Material":"Calfskin + Gold-Plated","Width":"12mm","Closure":"H Clasp","Made In":"France"}', 'HM-CLH-002'),

('a3', 'Monogram Canvas Wallet', 'Louis Vuitton', 'accessories', 630, NULL, 4.8, 201, '{"BESTSELLER"}', true, 15,
  'https://images.unsplash.com/photo-1531190260877-c8d11eb5afaf?w=600&q=80',
  'The iconic Monogram canvas bifold wallet with multiple card slots.',
  NULL,
  '{"Material":"Monogram Canvas + Cowhide","Slots":"6 Card + 2 Bill","Dimensions":"11×9cm","Made In":"France"}', 'LV-MCW-003'),

('a4', 'Saffiano Leather Belt', 'Prada', 'accessories', 490, 580, 4.5, 67, '{"SALE"}', true, 18,
  'https://images.unsplash.com/photo-1684510334550-0c4fa8aaffd1?w=600&q=80',
  'Prada''s signature Saffiano leather with polished gold-tone triangular logo buckle.',
  NULL,
  '{"Material":"Saffiano Leather","Buckle":"Gold-Tone","Width":"3.5cm","Made In":"Italy"}', 'PR-SLB-004'),

('a5', 'Intrecciato Leather Card Case', 'Bottega Veneta', 'accessories', 360, NULL, 4.7, 54, '{"NEW"}', true, 13,
  'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
  'The Intrecciato weave rendered in butter-soft nappa leather.',
  NULL,
  '{"Material":"Nappa Leather","Slots":"4 Card","Weave":"Intrecciato","Made In":"Italy"}', 'BV-ICC-005')

ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, label, price, stock) VALUES
('p1-50',  'p1', '50 ml',  185, 10),
('p1-100', 'p1', '100 ml', 225, 14),
('p1-150', 'p1', '150 ml', 265, 8),
('p2-30',  'p2', '30 ml',  162, 8),
('p2-50',  'p2', '50 ml',  198, 10),
('p3-50',  'p3', '50 ml',  340, 4),
('p3-250', 'p3', '250 ml', 970, 3),
('p4-100', 'p4', '100 ml', 495, 12),
('p5-100', 'p5', '100 ml', 175, 20),
('p6-100', 'p6', '100 ml', 128, 0),
('w1-black',  'w1', 'Black Dial',   12500, 2),
('w1-blue',   'w1', 'Blue Dial',    13200, 1),
('w2-blue',   'w2', 'Blue Wave',    5800,  5),
('w2-black',  'w2', 'Black',        5700,  3),
('w3-silver', 'w3', 'Silver Dial',  3400,  6),
('w3-black',  'w3', 'Black Dial',   3500,  5),
('w4-med',    'w4', 'Medium Steel', 7200,  3),
('w4-large',  'w4', 'Large Steel',  7800,  2),
('w5-white',  'w5', 'White Dial',   8900,  4),
('a1-black',       'a1', 'Black',          385, 12),
('a1-havana',      'a1', 'Havana',         395, 10),
('a2-gold-black',  'a2', 'Gold / Black',   725,  4),
('a2-gold-red',    'a2', 'Gold / Rouge',   725,  5),
('a3-mono',        'a3', 'Monogram',       630, 15),
('a4-black-85',    'a4', 'Black / 85cm',   490,  6),
('a4-black-90',    'a4', 'Black / 90cm',   490,  7),
('a4-caramel-85',  'a4', 'Caramel / 85cm', 490,  5),
('a5-black',       'a5', 'Black',          360,  7),
('a5-almond',      'a5', 'Almond',         360,  6)
ON CONFLICT (id) DO NOTHING;
