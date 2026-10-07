-- Generated from lib/catalog.ts. Apply after schema.sql.
insert into public.jobs (id,name,category,pay,xp,seconds,required_level,prompt,choices,answer) values
('papers','Zeitungen austragen','Nachbarschaft',3800,14,12,1,'Die Abkürzung führt durch einen Garten. Was machst du?','["Auf dem Gehweg bleiben","Durch die Blumen laufen","Zeitungen einfach werfen"]',0),
('shelves','Regale einräumen','Einzelhandel',4800,18,15,1,'Welches Produkt kommt nach vorne?','["Das mit dem längsten Datum","Das mit dem kürzesten Datum","Das teuerste"]',1),
('lawn','Rasen mähen','Nachbarschaft',5500,20,18,1,'Der Rasen ist nass. Dein Plan?','["Volle Geschwindigkeit","Sicherheit prüfen und langsam mähen","Mit der Schere beginnen"]',1),
('delivery','Lieferfahrer','Gastronomie',6500,24,20,2,'Zwei Lieferungen: Eis und Pizza. Wer zuerst?','["Pizza","Eis","Erst selbst essen"]',1),
('flea','Flohmarkt-Profi','Vertrieb',7200,25,22,2,'Ein Käufer bietet 12 €, du möchtest 15 €.','["Freundlich 14 € anbieten","Den Käufer beleidigen","Auf 100 € erhöhen"]',0),
('tutor','Nachhilfe geben','Bildung',9000,30,25,3,'Was sind 15 % von 200?','["15","30","45"]',1),
('support','IT-Support','IT',11000,35,28,4,'Der Computer geht nicht an. Erster Check?','["Neue Grafikkarte","Stromversorgung","Betriebssystem löschen"]',1),
('craft','Werkstatt-Aushilfe','Handwerk',12500,40,30,5,'Vor der Reparatur einer Maschine …','["Strom trennen","YouTube starten","Mit dem Hammer testen"]',0),
('sales','Junior Sales','Vertrieb',15000,45,35,6,'Dein Kunde ist unsicher. Du …','["hörst zu und klärst den Bedarf","versprichst alles","legst auf"]',0),
('analyst','Finance Analyst','Finanzen',20000,60,40,8,'Umsatz 800 €, Kosten 650 €. Gewinn?','["1.450 €","150 €","650 €"]',1)
on conflict (id) do nothing;

insert into public.industries (id,name,icon,founding_cost,base_revenue,base_costs) values
('kiosk','Kiosk','🏪',50000,1800,600),
('clothing','Clothing Brand','✦',120000,4200,1900),
('food','Streetfood','🍜',180000,6400,3400),
('software','Software Studio','⌘',400000,11200,5300)
on conflict (id) do nothing;

insert into public.items (id,name,brand,slot,color,price,aura,rarity) values
('item-0','Essential Tee','NØRD','top','#d6d2c5',4500,8,'Common'),
('item-1','Studio Hoodie','NØRD','top','#647860',11000,14,'Common'),
('item-2','Wide Leg','NØRD','pants','#37403c',7500,20,'Common'),
('item-3','Daily Runner','NØRD','shoes','#e3e0d5',15000,26,'Common'),
('item-4','Club Cap','NØRD','hat','#9e7b53',5500,32,'Common'),
('item-5','Silver Link','NØRD','accessory','#c4c6c2',18000,38,'Common'),
('item-6','Night Jacket','NØRD','top','#343a33',22000,44,'Common'),
('item-7','Cargo 01','NØRD','pants','#8a806b',13000,50,'Common'),
('item-8','Court Low','NØRD','shoes','#eee7d7',19000,56,'Common'),
('item-9','Oval Shades','NØRD','accessory','#343434',9500,62,'Common'),
('item-10','Heavy Tee','OFF HOURS','top','#d6d2c5',22500,68,'Rare'),
('item-11','Archive Hoodie','OFF HOURS','top','#647860',55000,74,'Rare'),
('item-12','Tailored Pants','OFF HOURS','pants','#37403c',37500,80,'Rare'),
('item-13','Cloud Sneaker','OFF HOURS','shoes','#e3e0d5',75000,86,'Rare'),
('item-14','Script Cap','OFF HOURS','hat','#9e7b53',27500,92,'Rare'),
('item-15','Chrome Watch','OFF HOURS','accessory','#c4c6c2',90000,98,'Rare'),
('item-16','Varsity Jacket','OFF HOURS','top','#343a33',110000,104,'Rare'),
('item-17','Raw Denim','OFF HOURS','pants','#8a806b',65000,110,'Rare'),
('item-18','Track Runner','OFF HOURS','shoes','#eee7d7',95000,116,'Rare'),
('item-19','Gold Link','OFF HOURS','accessory','#343434',47500,122,'Rare'),
('item-20','Signature Tee','MAISON VOID','top','#d6d2c5',40500,128,'Legendary'),
('item-21','Velvet Hoodie','MAISON VOID','top','#647860',99000,134,'Legendary'),
('item-22','Pleated Pants','MAISON VOID','pants','#37403c',67500,140,'Legendary'),
('item-23','Orbit Sneaker','MAISON VOID','shoes','#e3e0d5',135000,146,'Legendary'),
('item-24','Crown Cap','MAISON VOID','hat','#9e7b53',49500,152,'Legendary'),
('item-25','Obsidian Watch','MAISON VOID','accessory','#c4c6c2',162000,158,'Legendary'),
('item-26','Atelier Jacket','MAISON VOID','top','#343a33',198000,164,'Legendary'),
('item-27','Silk Trousers','MAISON VOID','pants','#8a806b',117000,170,'Legendary'),
('item-28','Phantom High','MAISON VOID','shoes','#eee7d7',171000,176,'Legendary'),
('item-29','Halo Chain','MAISON VOID','accessory','#343434',85500,182,'Legendary')
on conflict (id) do nothing;

insert into public.upgrades (id,name,type,price,boost) values
('sign','Neues Ladenschild','marketing',12000,0.08),
('social','Social Media','marketing',24000,0.12),
('quality','Bessere Materialien','quality',35000,0.15),
('tools','Neue Ausstattung','production',45000,0.18),
('checkout','Schneller Checkout','production',60000,0.2),
('website','Eigene Website','marketing',75000,0.24),
('training','Team-Training','quality',90000,0.28),
('supply','Lieferantenvertrag','production',120000,0.32),
('automation','Automatisierung','production',180000,0.4),
('location','Zweiter Standort','expansion',300000,0.65)
on conflict (id) do nothing;

insert into public.employee_candidates (id,name,role,skill,salary,hire_cost,boost) values
('employee-0','Mila','Verkäufer',35,300,9000,0.18),
('employee-1','Ben','Barista',39,300,13000,0.205),
('employee-2','Yuki','Designer',43,300,17000,0.22999999999999998),
('employee-3','Noah','Entwickler',47,500,21000,0.255),
('employee-4','Lina','Marketing Manager',51,500,25000,0.28),
('employee-5','Emil','Buchhalter',55,500,29000,0.305),
('employee-6','Ada','Manager',59,700,33000,0.33),
('employee-7','Omar','Produktion',63,700,37000,0.355),
('employee-8','Zoe','Logistik',67,700,41000,0.38),
('employee-9','Leo','Kundenservice',71,900,45000,0.405),
('employee-10','Nia','Analyst',75,900,49000,0.43),
('employee-11','Finn','Produktmanager',79,900,53000,0.455),
('employee-12','Ivy','Fotograf',83,1100,57000,0.48000000000000004),
('employee-13','Toni','Filialleitung',87,1100,61000,0.505),
('employee-14','Alex','Recruiter',91,1100,65000,0.53)
on conflict (id) do nothing;

insert into public.achievements (id,name,description,target) values
('first-band','FIRST BAND','Verdiene 1.000 €',1000),
('ceo','CEO','Gründe deine erste Firma',1),
('fresh','FRESH','Erreiche 1.000 Aura',1000),
('millionaire','MILLIONAIRE','Erreiche 1 Mio. € Vermögen',1000000),
('mogul','MOGUL','Besitze 5 Firmen',5),
('billionaire','BILLIONAIRE','Erreiche 1 Mrd. € Vermögen',1000000000),
('badge-0','Erste Schicht','1 Job abschließen',1),
('badge-1','Schichtheld','10 Jobs abschließen',2),
('badge-2','Workaholic','50 Jobs abschließen',3),
('badge-3','Erster Fit','1 Item kaufen',4),
('badge-4','Stylist','5 Items kaufen',5),
('badge-5','Sammler','15 Items kaufen',6),
('badge-6','Teamplayer','1 Mitarbeiter einstellen',7),
('badge-7','Arbeitgeber','5 Mitarbeiter einstellen',8),
('badge-8','Upgrade','1 Upgrade kaufen',9),
('badge-9','Optimierer','5 Upgrades kaufen',10),
('badge-10','Profitabel','100 € passiv verdienen',11),
('badge-11','Aufsteiger','Level 5 erreichen',12),
('badge-12','Veteran','Level 10 erreichen',13),
('badge-13','Trendsetter','100 Aura erreichen',14)
on conflict (id) do nothing;
