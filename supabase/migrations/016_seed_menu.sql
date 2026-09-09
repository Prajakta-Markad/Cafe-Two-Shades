begin;

-- ============================================================
-- CAFE TWO SHADES — CURRENT MENU
-- Source: supplied Deliveroo menu
-- Gelato section intentionally excluded.
-- ============================================================

-- ------------------------------------------------------------
-- Categories
-- ------------------------------------------------------------

insert into public.categories
  (name, description, display_order, is_visible)
values
  ('Breakfast', null, 1, true),
  ('American Waffle Breakfast', null, 2, true),
  ('Street Food', null, 3, true),
  ('Sandwiches', 'Fresh or grilled. Served in brown or white bread.', 4, true),
  ('Paninis', null, 5, true),
  ('American Burger', 'Chicken & Veggie Burger', 6, true),
  ('Wrap With Fries', 'Add Cheese For Extra 75p', 7, true),
  ('Speciality Chips', 'Add cheese for an extra cost.', 8, true),
  ('American Waffles', null, 9, true),
  ('Waffle Lolly', null, 10, true),
  ('Cake', null, 11, true),
  ('Shakes', null, 12, true),
  ('Sundae', null, 13, true),
  ('Two Shades Special Dessert', null, 14, true),
  ('Vegan Milk Shakes', null, 15, true),
  ('Soft Drinks', null, 16, true),
  ('Coffee and Tea', null, 17, true),
  ('Sharbet Lemonade', null, 18, true),
  ('Kids Special', null, 19, true),
  ('Soda Float', null, 20, true),
  ('Nutella Bubble Waffle', null, 21, true),
  ('Croffle Waffles', null, 22, true),
  ('Belgian Waffle', null, 23, true)
on conflict (name) do update
set
  description = excluded.description,
  display_order = excluded.display_order,
  is_visible = true;


-- ============================================================
-- HELPER FUNCTION
-- Inserts an item and its variants without needing hard-coded
-- UUIDs.
-- ============================================================

create or replace function pg_temp.add_menu_item(
  p_category_name text,
  p_item_name text,
  p_description text,
  p_display_order integer,
  p_label text,
  p_price numeric
)
returns void
language plpgsql
as $$
declare
  v_category_id uuid;
  v_item_id uuid;
begin
  select id
  into v_category_id
  from public.categories
  where name = p_category_name
  limit 1;

  if v_category_id is null then
    raise exception 'Menu category not found: %', p_category_name;
  end if;

  select id
  into v_item_id
  from public.menu_items
  where category_id = v_category_id
    and lower(name) = lower(p_item_name)
  limit 1;

  if v_item_id is null then
    insert into public.menu_items
      (category_id, name, description, display_order, is_visible)
    values
      (
        v_category_id,
        p_item_name,
        p_description,
        p_display_order,
        true
      )
    returning id into v_item_id;
  else
    update public.menu_items
    set
      description = p_description,
      display_order = p_display_order,
      is_visible = true
    where id = v_item_id;
  end if;

  if p_price is not null then
    if exists (
      select 1
      from public.menu_item_variants
      where menu_item_id = v_item_id
        and lower(label) = lower(p_label)
    ) then
      update public.menu_item_variants
      set
        price = p_price,
        display_order = 1,
        is_visible = true
      where menu_item_id = v_item_id
        and lower(label) = lower(p_label);
    else
      insert into public.menu_item_variants
        (menu_item_id, label, price, display_order, is_visible)
      values
        (v_item_id, p_label, p_price, 1, true);
    end if;
  end if;
end;
$$;


-- ============================================================
-- BREAKFAST
-- ============================================================

select pg_temp.add_menu_item(
  'Breakfast',
  'Big Breakfast',
  '2 bacon, 2 sausages, 1 egg, beans, mushroom, slice of bread and hash brown.',
  1,
  'Regular',
  11.99
);

select pg_temp.add_menu_item(
  'Breakfast',
  'Breakfast Wrap',
  '2 Becon, 2 Sausages, 1 Hash Brown, 1 Egg & Cheese',
  2,
  'Regular',
  7.99
);

select pg_temp.add_menu_item(
  'Breakfast',
  'Veggie Breakfast Wrap',
  '2 Vegan Sausages, 2 Hash Browns, 1 Egg & Cheese',
  3,
  'Regular',
  7.99
);

select pg_temp.add_menu_item(
  'Breakfast',
  'Single Breakfast',
  '1 bacon, 1 sausage, 1 egg, beans, mushroom, slice of bread and hash brown.',
  4,
  'Regular',
  9.49
);

select pg_temp.add_menu_item(
  'Breakfast',
  'Cheese Omelette',
  'Omelette Served with Toast',
  5,
  'Regular',
  5.49
);

select pg_temp.add_menu_item(
  'Breakfast',
  'Egg on Toast',
  '2 Slice of Toast and Sunkissed Eggs',
  6,
  'Regular',
  4.49
);

select pg_temp.add_menu_item(
  'Breakfast',
  'Ham and Cheese Omelette',
  'Omelette Served with Toast',
  7,
  'Regular',
  6.49
);

select pg_temp.add_menu_item(
  'Breakfast',
  'Toast',
  'Brown or white bread. Slice of toast.',
  8,
  'Regular',
  2.99
);

select pg_temp.add_menu_item(
  'Breakfast',
  'Big Veggie Breakfast',
  '2 vegan sausages, 1 egg, beans, mushroom, slice of bread and hash brown. V.',
  9,
  'Regular',
  10.49
);

select pg_temp.add_menu_item(
  'Breakfast',
  'Disco Omelette',
  '2 egg masala omelette (onion, coriander, tomato) with 2 slices of bread.',
  10,
  'Regular',
  5.99
);

select pg_temp.add_menu_item(
  'Breakfast',
  'Jam Toast',
  '2 Slice of toast & choice of Jam',
  11,
  'Regular',
  2.75
);

select pg_temp.add_menu_item(
  'Breakfast',
  'Breakfast Panini',
  '2 Becon, 2 Sausage, Cheese & Splash of HP Sauce or Ketchup',
  12,
  'Regular',
  7.99
);

select pg_temp.add_menu_item(
  'Breakfast',
  'Mushroom and cheese omelette',
  'Omelette Served with Toast',
  13,
  'Regular',
  6.49
);


-- ============================================================
-- AMERICAN WAFFLE BREAKFAST
-- ============================================================

select pg_temp.add_menu_item(
  'American Waffle Breakfast',
  'Big Waffle Breakfast',
  'Freshly Made American Waffle served with 2 Becons, 2 Sausages. 1 egg, beans and Cheese',
  1,
  'Regular',
  12.99
);

select pg_temp.add_menu_item(
  'American Waffle Breakfast',
  'Big Waffle Veggie Breakfast (V)',
  'Freshly Made American Waffle served with 2 Vegan Sausages. 1 egg, beans and Cheese',
  2,
  'Regular',
  11.99
);

select pg_temp.add_menu_item(
  'American Waffle Breakfast',
  'Bacon Maple Waffle Breakfast',
  'Freshly Made American Waffle served with Maple Syrup and Streaky Bacon',
  3,
  'Regular',
  8.99
);


-- ============================================================
-- STREET FOOD
-- ============================================================

select pg_temp.add_menu_item(
  'Street Food',
  'Chicken Frankie',
  'Chicken tikka, Two Shades special sauce, mint chutney, salad garnished with garlic mayo. All frankie’s contains nuts.',
  1,
  'Regular',
  6.99
);

select pg_temp.add_menu_item(
  'Street Food',
  'Wada Pav (2pc)',
  'Most popular Mumbai''s Street food.',
  2,
  'Regular',
  6.99
);

select pg_temp.add_menu_item(
  'Street Food',
  'Pav Bhaji',
  'Flavourful Mashed Vegetable in Home Made Pav Bhaji Masala, Served with Buttered Bread Roll',
  3,
  'Regular',
  7.99
);

select pg_temp.add_menu_item(
  'Street Food',
  'Dabeli',
  'Stuffed bread roll with sweet spicy mashed potato mixer and sev garnished with pomegranate and roasted peanuts. V.',
  4,
  'Regular',
  5.99
);

select pg_temp.add_menu_item(
  'Street Food',
  'Samosa Chaat',
  'V.',
  5,
  'Regular',
  6.99
);

select pg_temp.add_menu_item(
  'Street Food',
  'Masala Maggi',
  'Onion, tomato, peas.',
  6,
  'Regular',
  5.49
);

select pg_temp.add_menu_item(
  'Street Food',
  'Paneer Frankie',
  'Paneer tikka, mint chutney, Two Shades special sauce, onion, fresh coriander. All frankie’s contains nuts. (V)',
  7,
  'Regular',
  6.75
);

select pg_temp.add_menu_item(
  'Street Food',
  'Gol Gappa (Pani Puri)',
  'Round hollow puri, filled with a mixture of mint coriander water, tamarind and date chutney, potato, chickpeas, garnished with onion, coriander, tomato, sev. V.',
  8,
  'Regular',
  6.25
);

select pg_temp.add_menu_item(
  'Street Food',
  'Dahi Puri',
  'Crispy Shell Stuffed with Boiled potato, onion, tomato, yogurt, shev and chuteny',
  9,
  'Regular',
  5.99
);

select pg_temp.add_menu_item(
  'Street Food',
  'Samosa',
  'V.',
  10,
  'Regular',
  5.49
);

select pg_temp.add_menu_item(
  'Street Food',
  'Chana Chaat',
  'Mixer of mouthwatering chana, mashed potato, papdi, tamarind chutney, mint chutney garnished with sev and pomegranate. V.',
  11,
  'Regular',
  6.75
);

select pg_temp.add_menu_item(
  'Street Food',
  'Bhel Puri',
  'Savoury snack made of puffed rice, sev, tomato, potato, onion and homemade sweet tangy chutneys. V.',
  12,
  'Regular',
  6.25
);

select pg_temp.add_menu_item(
  'Street Food',
  'Paneer Masala Maggi',
  'Paneer Masala Maggi Noodles',
  13,
  'Regular',
  6.00
);

select pg_temp.add_menu_item(
  'Street Food',
  'Misal Pav',
  'Sprouted lentils cooked in flavoured spicy gravy, topped with farsan, onion, corriender. served with pav',
  14,
  'Regular',
  9.49
);

select pg_temp.add_menu_item(
  'Street Food',
  'Bhurji Pav',
  'Spicy Scrumbbled eggs, served with buttered bread roll',
  15,
  'Regular',
  7.49
);

select pg_temp.add_menu_item(
  'Street Food',
  'Chicken Egg Roll',
  'Served with Paratha, Egg, chicken, Mayo, Ketchup and onion',
  16,
  'Regular',
  6.99
);

select pg_temp.add_menu_item(
  'Street Food',
  'Egg Frankie',
  'Egg omelette, Two Shades special sauce, onion, and fresh coriander. All frankie’s contains nuts.',
  17,
  'Regular',
  6.49
);

select pg_temp.add_menu_item(
  'Street Food',
  'Samosa Pav',
  'Samosa served in Pav (Bread Roll)',
  18,
  'Regular',
  5.25
);

select pg_temp.add_menu_item(
  'Street Food',
  'Maggi',
  'Indian Maggi',
  19,
  'Regular',
  4.99
);

select pg_temp.add_menu_item(
  'Street Food',
  'Chilli Cheese Maggi',
  'Chilli flakes, cheese.',
  20,
  'Regular',
  5.49
);

select pg_temp.add_menu_item(
  'Street Food',
  'Kat Wada',
  'Spicy Potata wada dipped in spicy curry topped with farsan, onion, corrianderm served with slice of bread',
  21,
  'Regular',
  6.99
);


-- ============================================================
-- SANDWICHES
-- ============================================================

select pg_temp.add_menu_item(
  'Sandwiches',
  'Paneer Tikka sandwich (v)',
  'Marinated paneer, mixed pepper, fresh onion & cheese with burger sauce',
  1,
  'Regular',
  6.49
);

select pg_temp.add_menu_item(
  'Sandwiches',
  'Tuna Mayo Sandwich',
  null,
  2,
  'Regular',
  5.99
);

select pg_temp.add_menu_item(
  'Sandwiches',
  'Ham and Cheese Sandwich',
  null,
  3,
  'Regular',
  5.99
);

select pg_temp.add_menu_item(
  'Sandwiches',
  'Chicken Tikka Sandwich',
  null,
  4,
  'Regular',
  6.99
);

select pg_temp.add_menu_item(
  'Sandwiches',
  'Roast Chicken Sandwich',
  null,
  5,
  'Regular',
  6.99
);

select pg_temp.add_menu_item(
  'Sandwiches',
  'Mushroom Onion Cheese Sandwich',
  'V.',
  6,
  'Regular',
  5.99
);

select pg_temp.add_menu_item(
  'Sandwiches',
  'Bombay Sandwich',
  'V.',
  7,
  'Regular',
  6.99
);

select pg_temp.add_menu_item(
  'Sandwiches',
  'Cheese Sandwich',
  null,
  8,
  'Regular',
  4.99
);

select pg_temp.add_menu_item(
  'Sandwiches',
  'Bacon Sandwich',
  'Brown Sauce, Bacon and Tomato',
  9,
  'Regular',
  5.99
);


-- ============================================================
-- PANINIS
-- ============================================================

select pg_temp.add_menu_item(
  'Paninis',
  'Chicken Tikka Panini',
  'Marinated chicken, mayonnaise, onions, mix papers, mozzarella and cheddar cheese, chilli flakes (optional) and add bacon or pepperoni for an extra cost.',
  1,
  'Regular',
  7.99
);

select pg_temp.add_menu_item(
  'Paninis',
  'Italian Panini',
  'Chicken, tomato or pepperoni. Pesto, mozzarella cheese, onion.',
  2,
  'Regular',
  6.49
);

select pg_temp.add_menu_item(
  'Paninis',
  'Tuna Panini',
  'Tuna mayonnaise, red onion, mozzarella and cheddar cheese.',
  3,
  'Regular',
  7.49
);

select pg_temp.add_menu_item(
  'Paninis',
  'Halloumi Panini',
  'Grilled halloumi, mozzarella, cranberry sauce, onion. V.',
  4,
  'Regular',
  7.49
);

select pg_temp.add_menu_item(
  'Paninis',
  'Vegetables Panini',
  'Rocket, tomato, onion, mix pepper, mozzarella and cheddar cheese, chili flakes (optional). V.',
  5,
  'Regular',
  7.49
);

select pg_temp.add_menu_item(
  'Paninis',
  'Paneer Panini',
  'V.',
  6,
  'Regular',
  7.49
);

select pg_temp.add_menu_item(
  'Paninis',
  'Sausage Melt Panini',
  '2 sausages, caramalised onion & Cheese',
  7,
  'Regular',
  7.49
);

select pg_temp.add_menu_item(
  'Paninis',
  'Two Shades Special Panini',
  'paneer or Chicken, Fresh Onion, Mix Paper, Two Shades Special Sauce',
  8,
  'Regular',
  7.75
);

select pg_temp.add_menu_item(
  'Paninis',
  'Italian Chicken Panini',
  'Pesto, Roast Chicken, Rocket and cheese',
  9,
  'Regular',
  7.49
);

select pg_temp.add_menu_item(
  'Paninis',
  'Italian Pepperoni Panini',
  'Pasto, Pepperoni, Rockets an Cheese',
  10,
  'Regular',
  7.49
);

select pg_temp.add_menu_item(
  'Paninis',
  'Ham and Cheese Panini',
  'Ham and Cheese',
  11,
  'Regular',
  7.49
);


-- ============================================================
-- AMERICAN BURGER
-- ============================================================

select pg_temp.add_menu_item(
  'American Burger',
  'Mayo Chicken Delight',
  'Mayo, Lettuce, Tomato, Chicken & Cheese.',
  1,
  'Regular',
  7.49
);

select pg_temp.add_menu_item(
  'American Burger',
  'Chicken Bacon Burger',
  'Mayo, Lettuce, Bacon, Chicken & Cheese.',
  2,
  'Regular',
  7.99
);

select pg_temp.add_menu_item(
  'American Burger',
  'Little Italian Burger',
  'Pesto, Rocket, Cheese, Tomato & Chicken',
  3,
  'Regular',
  7.49
);

select pg_temp.add_menu_item(
  'American Burger',
  'Veggie Delight (V)',
  'Mayo, Lettuce, Tomato, Veg Patty & Cheese.',
  4,
  'Regular',
  7.99
);

select pg_temp.add_menu_item(
  'American Burger',
  'Sweet Chilly Chicken',
  'Sweet Chilli Sauce, Chicken Patty, Lettuce, Tomato & Cheese',
  5,
  'Regular',
  7.49
);

select pg_temp.add_menu_item(
  'American Burger',
  'Chicken El Fuego (H)',
  'Chicken patty, chilli sauce, mayo, onion ring, lettuce and cheese',
  6,
  'Regular',
  8.49
);


-- ============================================================
-- WRAP WITH FRIES
-- ============================================================

select pg_temp.add_menu_item(
  'Wrap With Fries',
  'Spicy Chicken',
  'Chicken Fillet With Homemade Spicy Sauce And Salad',
  1,
  'Regular',
  6.99
);

select pg_temp.add_menu_item(
  'Wrap With Fries',
  'Chicken Mayo',
  'Chicken Fillet With Mayo Sauce And Salad',
  2,
  'Regular',
  6.99
);

select pg_temp.add_menu_item(
  'Wrap With Fries',
  'Sweet Chilly Chicken',
  'Chicken Fillet With Sweet Chilly Sauce And Salad',
  3,
  'Regular',
  6.99
);

select pg_temp.add_menu_item(
  'Wrap With Fries',
  'veggie',
  'veggie Patty WithMayo Sauce And Salad',
  4,
  'Regular',
  6.99
);


-- ============================================================
-- SPECIALITY CHIPS
-- ============================================================

select pg_temp.add_menu_item(
  'Speciality Chips',
  'Loaded Chips',
  'Onion, coriander, tomato, perinaise sauce, garlic mint sauce and chaat masala.',
  1,
  'Regular',
  6.49
);

select pg_temp.add_menu_item(
  'Speciality Chips',
  'Cheesy Chips',
  'Chips with cheese',
  2,
  'Regular',
  5.49
);

select pg_temp.add_menu_item(
  'Speciality Chips',
  'Peri Peri Chips',
  'Chips with Peri-peri salt & sauce',
  3,
  'Regular',
  5.49
);

select pg_temp.add_menu_item(
  'Speciality Chips',
  'Bacon Loaded Chips',
  'Bacon, cheese.',
  4,
  'Regular',
  5.99
);

select pg_temp.add_menu_item(
  'Speciality Chips',
  'Plain Chips',
  null,
  5,
  'Regular',
  4.49
);

select pg_temp.add_menu_item(
  'Speciality Chips',
  'Chicken Loaded Chips',
  'Chips with chicken, cheese & Burger sauce',
  6,
  'Regular',
  7.49
);

select pg_temp.add_menu_item(
  'Speciality Chips',
  'Spicy Chatpata chips',
  'chips topped with extra spicy sauces, garnished with onion and corriender',
  7,
  'Regular',
  5.49
);


-- ============================================================
-- AMERICAN WAFFLES
-- ============================================================

select pg_temp.add_menu_item(
  'American Waffles',
  'Lotus Biscoff Waffle American Waffle',
  'Served With Scoop of Biscoff Gelato topped with Biscoff Sauce & Biscoff Crumbs',
  1,
  'Regular',
  10.99
);

select pg_temp.add_menu_item(
  'American Waffles',
  'Kinder Bueno Wave American Waffle',
  'Delicious combination of hazelnut chocolate and white chocolate gelato topped with Nutella and Kinder Bueno bar.',
  2,
  'Regular',
  10.99
);

select pg_temp.add_menu_item(
  'American Waffles',
  'Oreo Volcano American Waffle',
  'Waffle served with delicious Oreo cookies and cream gelato, drizzled with white chocolate sauce dusted with Oreo crumbles.',
  3,
  'Regular',
  10.99
);

select pg_temp.add_menu_item(
  'American Waffles',
  'Banana Toffee Blast American Waffle',
  'Waffle served with delicious banana gelato, fresh banana slices drizzled with toffee sauce and fudge cubs.',
  4,
  'Regular',
  10.99
);

select pg_temp.add_menu_item(
  'American Waffles',
  'Strawberry Explosion American Waffle',
  'Waffle served with delicious strawberry gelato, fresh strawberry slices drizzled with strawberry sauce.',
  5,
  'Regular',
  10.99
);

select pg_temp.add_menu_item(
  'American Waffles',
  'Strawberry Chocolate River American Waffle',
  'Waffle served with combination of chocolate and strawberry gelato, fresh strawberry slices drizzled with Belgium chocolate.',
  6,
  'Regular',
  10.99
);

select pg_temp.add_menu_item(
  'American Waffles',
  'Brownie Temptation American Waffle',
  'Vanilla gelato served with melted milk chocolate and warm brownie slices.',
  7,
  'Regular',
  10.99
);

select pg_temp.add_menu_item(
  'American Waffles',
  'Dirty Chocolate American Waffle',
  'Luxurious chocolate gelato served with melted chocolate and chocolate flakes.',
  8,
  'Regular',
  10.99
);

select pg_temp.add_menu_item(
  'American Waffles',
  'Rani Raspberry American Waffle',
  'Waffle drizzled with raspberry syrup served with luxury raspberry sorbet and fresh raspberry.',
  9,
  'Regular',
  10.99
);

select pg_temp.add_menu_item(
  'American Waffles',
  'Cherry Blossom Waffle American Waffle',
  'Served With Scoop of Cream Cheery gelato, topped with Cheery Sauce and White Flakes / Cheery ( On Availability)',
  10,
  'Regular',
  10.99
);

select pg_temp.add_menu_item(
  'American Waffles',
  'Ferrero Roche Mountain American Waffle',
  'Served With Scoop of Roche Gelato, Topped with Nutella Sauce, Ferrero Roche and Nuts',
  11,
  'Regular',
  11.99
);

select pg_temp.add_menu_item(
  'American Waffles',
  'Pistachio Choconut Waffle American Waffle',
  'Served With Scoop Of Pistachio & Nutella Gelato, Topped with Nutella and Nuts',
  12,
  'Regular',
  10.99
);

select pg_temp.add_menu_item(
  'American Waffles',
  'Bubblegum-Rainbow American Waffle',
  'Served with Scoop of Bubble-Gum Gelato, Topped with Bubble Gum Sauce and Sprinklers',
  13,
  'Regular',
  10.99
);


-- ============================================================
-- WAFFLE LOLLY
-- ============================================================

select pg_temp.add_menu_item(
  'Waffle Lolly',
  'Biscoff Waffle Lolly',
  'Waffle lolly dipped in Biscoff sauce and sprinkled with Biscoff crumbs.',
  1,
  'Regular',
  5.25
);

select pg_temp.add_menu_item(
  'Waffle Lolly',
  'Rainbow Waffle Lolly',
  'Waffle lolly dipped in milk chocolate river and sprinkled with rainbow sugar strands.',
  2,
  'Regular',
  5.25
);

select pg_temp.add_menu_item(
  'Waffle Lolly',
  'Oreo Crunch Waffle Lolly',
  'Waffle lolly dipped in melted white chocolate sauce sprinkled with Oreo crumbs.',
  3,
  'Regular',
  5.25
);

select pg_temp.add_menu_item(
  'Waffle Lolly',
  'M&Ms Chocolate Waffle Lolly',
  'Waffle lolly dipped in melted milk chocolate and topped with M&Ms chocolate.',
  4,
  'Regular',
  5.25
);

select pg_temp.add_menu_item(
  'Waffle Lolly',
  'Triple Waffle Lolly',
  'Choose any three lollies.',
  5,
  'Regular',
  13.99
);

select pg_temp.add_menu_item(
  'Waffle Lolly',
  'Marshmallow Waffle Lolly',
  null,
  6,
  'Regular',
  5.25
);

select pg_temp.add_menu_item(
  'Waffle Lolly',
  'Rani Rasberry Waffle Lolly',
  null,
  7,
  'Regular',
  5.25
);

select pg_temp.add_menu_item(
  'Waffle Lolly',
  'Nutella Waffle Lolly',
  null,
  8,
  'Regular',
  5.25
);

select pg_temp.add_menu_item(
  'Waffle Lolly',
  'Salted Caramel Waffle Lolly',
  null,
  9,
  'Regular',
  5.25
);

select pg_temp.add_menu_item(
  'Waffle Lolly',
  'White Chocolate Waffle Lolly',
  null,
  10,
  'Regular',
  5.25
);


-- ============================================================
-- CAKE
-- ============================================================

select pg_temp.add_menu_item(
  'Cake',
  'Chocolate and Orange Cake',
  null,
  1,
  'Regular',
  5.75
);

select pg_temp.add_menu_item(
  'Cake',
  'Triple Chocolate Fudge Cake',
  null,
  2,
  'Regular',
  5.75
);

select pg_temp.add_menu_item(
  'Cake',
  'Carrot Cake (GF)',
  null,
  3,
  'Regular',
  5.75
);

select pg_temp.add_menu_item(
  'Cake',
  'Vanilla Cheese Cake',
  'Served with Melted Belgium White Choc Sauce',
  4,
  'Regular',
  5.75
);

select pg_temp.add_menu_item(
  'Cake',
  'Salted Caramel Cheese Cake',
  'Vanilla Cheese Cake Served with Salted Caramel Sauce & Fudge cubes',
  5,
  'Regular',
  6.49
);

select pg_temp.add_menu_item(
  'Cake',
  'Nutella Cheese Cake',
  'Vanilla Cheese Cake Served with nutella sauce and Ferrero Rocher',
  6,
  'Regular',
  6.49
);

select pg_temp.add_menu_item(
  'Cake',
  'Lotus Biscoff Cheese Cake',
  'Vanilla Cheese Cake served with Biscoff Sauce and Biscoff Crumbs.',
  7,
  'Regular',
  6.49
);

select pg_temp.add_menu_item(
  'Cake',
  'Oreo Cheese Cake',
  'Vanilla Cheese Cake served with White Chocolate & Oreo Crumbs.',
  8,
  'Regular',
  6.49
);

select pg_temp.add_menu_item(
  'Cake',
  'Raspberry Cheese cake',
  'Vanilla Cheese Cake served with Raspberry Sauce & Fresh Raspberry.',
  9,
  'Regular',
  6.49
);


-- ============================================================
-- SHAKES
-- ============================================================

select pg_temp.add_menu_item(
  'Shakes',
  'Two Shade Special Royal Mango Mastani Milkshake',
  'Royal dessert thick mango milkshake topped with dry fruits and whipped cream.',
  1,
  'Regular',
  6.99
);

select pg_temp.add_menu_item('Shakes', 'Lotus Biscoff Milkshake', null, 2, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Oreo Milkshake', null, 3, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Kinder Bueno Milkshake', null, 4, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Salted Caramel Milkshake', null, 5, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Strawberry Milkshakes', null, 6, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Chocolate Milkshake', null, 7, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Ferrero Milkshake', null, 8, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Mango Milkshake', null, 9, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'M&M Chocolate Milkshake', null, 10, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Vanilla Milkshake', null, 11, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Rani Raspberry Milkshake', null, 12, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Brownie Milkshake', null, 13, 'Regular', 6.99);

select pg_temp.add_menu_item(
  'Shakes',
  'Two Shade Special Cad B Milkshake',
  'Thick chocolate shake with chocolate crumbs, whipped cream on top with delicious melted Belgium chocolates',
  14,
  'Regular',
  6.99
);

select pg_temp.add_menu_item('Shakes', 'Aeromint Milkshake', null, 15, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'After Eight Milkshake', null, 16, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Snickers Milkshake', null, 17, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Bounty Milkshake', null, 18, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Banana Toffee Blast', null, 19, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Rees''s Milkshake', null, 20, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Milkybar Milkshake', null, 21, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Hershey`s Milkshake', null, 22, 'Regular', 6.99);
select pg_temp.add_menu_item('Shakes', 'Maltesers Milkshake', null, 23, 'Regular', 6.99);


-- ============================================================
-- SUNDAE
-- ============================================================

select pg_temp.add_menu_item(
  'Sundae',
  'Banana Toffee Blast',
  'Served with delicious banana gelato, fresh banana slices drizzled with toffee sauce topped with whipped cream and fudge cubs.',
  1,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Strawberry Explosion',
  'Served with delicious strawberry gelato, fresh strawberry slices drizzled with strawberry sauce and topped with whipped cream.',
  2,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Strawberry Chocolate River',
  'Served with combination of chocolate and strawberry gelato, fresh strawberry slices drizzled with Belgium chocolate river.',
  3,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Oreo Volcano',
  'Served with delicious Oreo cookies and cream gelato, drizzled with white chocolate sauce dusted with Oreo crumbles and topped with whipped cream.',
  4,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Kinder Bueno Wave',
  'Delicious combination of hazelnut chocolate and white chocolate gelato topped with Nutella whipped cream and Kinder Bueno bar.',
  5,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Brownie Temptation',
  'Spreaded with melted milk chocolate sauce served with chocolate and vanilla gelato topped with warm brownie slices.',
  6,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Mango Tutti Frutti',
  'Spreaded with rich mango pulp served with mango sorbet ice cream topped with mango and tutti frutti.',
  7,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Dirty Chocolate',
  'Spreaded with melted chocolate served with luxury chocolate gelato topped with whipped cream and chocolate flakes.',
  8,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Affogato',
  'one scoop vanilla, one scoop latte machiato, whipped cream, caramel sauce, coffee beans',
  9,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Rani Raspberry',
  'Raspberry syrup served with luxury raspberry sorbet topped whipped cream and fresh raspberry.',
  10,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Mint Choc Sundae',
  'Served With Scoop of Mint Chocolate & Chocolate Gelato, Topped with Whipped Cream, Mint Sauce & After Eight Bar',
  11,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Bubblegum-Rainbow Sundae',
  'Served With Scoop of Strawberry & Bubblegum Gelato, Topped with Strawberry & Bubblegum Sauce & Sprinkles',
  12,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Cherry Blossom Sundae',
  'Served With Scoop of Cream Cheery gelato, topped with Cheery Sauce and White Flakes / Cheery ( On Availability)',
  13,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Rocher (Ferrero Rocher) Mountain Sundae',
  'Served With Two Scoops of Roche Gelato, Topped with Whipped Cream, Nutella Ferrero Rocher & Nuts',
  14,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Choc-Peanut Sundae (Reeses) Sundae',
  'Served With Scoop of Chocolate & Chocolate Peanut Gelato, Topped with Whipped Cream, Chocolate Sauce, Reese’s Cup & Nuts',
  15,
  'Regular',
  9.99
);

select pg_temp.add_menu_item(
  'Sundae',
  'Pistachio Choconut Sundae',
  'Served With Scoop of Pistachio & Nutella Gelato, Topped with Whipped Cream, Nutella Sauce & Nuts',
  16,
  'Regular',
  9.99
);


-- ============================================================
-- TWO SHADES SPECIAL DESSERT
-- ============================================================

select pg_temp.add_menu_item(
  'Two Shades Special Dessert',
  'Strawberry Affairs',
  'Dipped in Nutella or Melted Belgium Milk choc or Melted Belgium White Cho. (Choose One)',
  1,
  'Regular',
  6.75
);

select pg_temp.add_menu_item(
  'Two Shades Special Dessert',
  'Two Shades of Brownies',
  'Served with Warm Brownies and scoop of Madagascan Vanilla Gelato, topped with Melted Belgium Milk Chocolate or Nutella, dry fruits nuts.',
  2,
  'Regular',
  6.75
);

select pg_temp.add_menu_item(
  'Two Shades Special Dessert',
  'Fudge Explosion',
  'Warm Fudge cake drizzled in Milk and White melted belgian chocolate sauce, served with scoop of vanilla gelato',
  3,
  'Regular',
  7.49
);


-- ============================================================
-- VEGAN MILK SHAKES
-- ============================================================

select pg_temp.add_menu_item(
  'Vegan Milk Shakes',
  'Vegan Milk Shakes',
  null,
  1,
  'Regular',
  7.25
);


-- ============================================================
-- SOFT DRINKS
-- ============================================================

select pg_temp.add_menu_item('Soft Drinks', 'Coke Diet Can 330ml', null, 1, 'Regular', 2.20);
select pg_temp.add_menu_item('Soft Drinks', 'Masala Soda', null, 2, 'Regular', 4.99);
select pg_temp.add_menu_item('Soft Drinks', 'Coca Cola Can 330ml', null, 3, 'Regular', 2.20);
select pg_temp.add_menu_item('Soft Drinks', 'Fanta', null, 4, 'Regular', 2.20);
select pg_temp.add_menu_item('Soft Drinks', 'Fruit Shoot 200ml Apple & Black Current', null, 5, 'Regular', 1.50);
select pg_temp.add_menu_item('Soft Drinks', 'J2O Bottle 275ml', null, 6, 'Regular', 2.99);
select pg_temp.add_menu_item('Soft Drinks', 'Sprite 330ml', null, 7, 'Regular', 2.20);
select pg_temp.add_menu_item('Soft Drinks', 'Bottled Water', null, 8, 'Regular', 2.00);
select pg_temp.add_menu_item('Soft Drinks', 'Orange juice 220 ml', null, 9, 'Regular', 2.20);
select pg_temp.add_menu_item('Soft Drinks', 'Fruit Shoot 200ml Orange', 'Fruit Shoot 200ml Orange', 10, 'Regular', 1.50);
select pg_temp.add_menu_item('Soft Drinks', 'Strawberry Slush', null, 11, 'Regular', 3.99);
select pg_temp.add_menu_item('Soft Drinks', 'Rubicon Sparkling Mango Can 330ml', null, 12, 'Regular', 2.20);
select pg_temp.add_menu_item('Soft Drinks', 'Pepsi Max Can 330ml', 'No Sugar', 13, 'Regular', 2.20);
select pg_temp.add_menu_item('Soft Drinks', 'Nimbu (Lemon) Lemonade', null, 14, 'Regular', 4.99);
select pg_temp.add_menu_item('Soft Drinks', 'Blue Raspberry Slush', null, 15, 'Regular', 3.99);


-- ============================================================
-- COFFEE AND TEA
-- ============================================================

select pg_temp.add_menu_item(
  'Coffee and Tea',
  'Adrak Chai (Ginger Tea)',
  null,
  1,
  'Regular',
  3.99
);

select pg_temp.add_menu_item(
  'Coffee and Tea',
  'Mocha',
  'Small or large. Add syrup and cream and marshmallow for an extra cost.',
  2,
  'Regular',
  3.75
);

select pg_temp.add_menu_item('Coffee and Tea', 'Karak Chai', null, 3, 'Regular', 3.75);

select pg_temp.add_menu_item(
  'Coffee and Tea',
  'Latte',
  'Small or large. Add syrup and cream and marshmallow for an extra cost.',
  4,
  'Regular',
  3.99
);

select pg_temp.add_menu_item(
  'Coffee and Tea',
  'Chai Latte',
  'Small or large.',
  5,
  'Regular',
  3.75
);

select pg_temp.add_menu_item('Coffee and Tea', 'Indian Masala Tea', null, 6, 'Regular', 3.75);

select pg_temp.add_menu_item(
  'Coffee and Tea',
  'Hot Chocolate',
  'Small or large. Add syrup and cream and marshmallow for an extra cost.',
  7,
  'Regular',
  3.99
);

select pg_temp.add_menu_item(
  'Coffee and Tea',
  'Flat White',
  'Add syrup and cream and marshmallow for an extra cost.',
  8,
  'Regular',
  3.99
);

select pg_temp.add_menu_item(
  'Coffee and Tea',
  'Americano',
  'Small or large. Add syrup and cream and marshmallow for an extra cost.',
  9,
  'Regular',
  3.75
);

select pg_temp.add_menu_item(
  'Coffee and Tea',
  'Cappuccino',
  'Small or large. Add syrup and cream and marshmallow for an extra cost.',
  10,
  'Regular',
  3.75
);

select pg_temp.add_menu_item(
  'Coffee and Tea',
  'Espresso',
  'Small or large. Add syrup and cream and marshmallow for an extra cost.',
  11,
  'Regular',
  3.49
);

select pg_temp.add_menu_item('Coffee and Tea', 'English Tea', null, 12, 'Regular', 3.75);
select pg_temp.add_menu_item('Coffee and Tea', 'Kashmiri Pink Chai', null, 13, 'Regular', 4.99);
select pg_temp.add_menu_item('Coffee and Tea', 'Praline Hot Chocolate', null, 14, 'Regular', 3.99);
select pg_temp.add_menu_item('Coffee and Tea', 'Illachi Chai (Cardamom Tea)', null, 15, 'Regular', 3.75);
select pg_temp.add_menu_item('Coffee and Tea', 'Decaf Tea', null, 16, 'Regular', 3.75);
select pg_temp.add_menu_item('Coffee and Tea', 'Earls Grey Tea', null, 17, 'Regular', 3.75);
select pg_temp.add_menu_item('Coffee and Tea', 'Green Tea', null, 18, 'Regular', 3.75);

select pg_temp.add_menu_item(
  'Coffee and Tea',
  'Create Your Own Milk Shake',
  'Choose Any two Gelato',
  19,
  'Regular',
  7.50
);


-- ============================================================
-- SHARBET LEMONADE
-- ============================================================

select pg_temp.add_menu_item(
  'Sharbet Lemonade',
  'Lemon Lemonade',
  'freshly made lemon soda with hint of cumin powder',
  1,
  'Regular',
  4.75
);


-- ============================================================
-- KIDS SPECIAL
-- ============================================================

select pg_temp.add_menu_item(
  'Kids Special',
  'Kids Meal',
  '4pc Nuggets, fries and Fruit shoot',
  1,
  'Regular',
  6.49
);


-- ============================================================
-- SODA FLOAT
-- ============================================================

select pg_temp.add_menu_item(
  'Soda Float',
  'Chocolate Coke Float',
  null,
  1,
  'Regular',
  5.49
);

select pg_temp.add_menu_item(
  'Soda Float',
  'Classic Coke Float',
  null,
  2,
  'Regular',
  5.49
);

select pg_temp.add_menu_item(
  'Soda Float',
  'Strawberry',
  null,
  3,
  'Regular',
  5.49
);


-- ============================================================
-- NUTELLA BUBBLE WAFFLE
-- ============================================================

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Oreo Volcano Bubble Waffle',
  'Oreo Volcano Bubble Waffle served with delicious Oreo Cookies gelato, topped with White Chocolate sauce dusted with Oreo Crumbles and Whipped Cream',
  1,
  'Regular',
  11.99
);

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Banana Toffee Blast Bubble Waffle',
  'Banana Toffee Blast Bubble Waffle served with delicious Banana gelato, Fudge Cubes, Toffee sauce and fresh Banana slices Topped with Whipped Cream',
  2,
  'Regular',
  11.99
);

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Strawberry Chocolate River Bubble Waffle',
  'Nutella Bubble Waffle served with combination of Chocolate and Strawberry gelato, fresh Strawberry slices and Belgian Chocolate sauce, topped with whipped cream.',
  3,
  'Regular',
  11.99
);

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Kinder Bueno Wave Bubble Waffle',
  'Nutella Bubble Waffle served with combination of Chocolate Hazelnut and White chocolate gelato, warm Nutella sauce and kinder bueno bar, topped with whipped cream.',
  4,
  'Regular',
  11.99
);

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Dirty Chocolate Bubble Waffle',
  'Nutella Bubble Waffle served with Luxurious chocolate gelato, melted Belgian chocolate and chocolate Flake, topped with Whipped Cream',
  5,
  'Regular',
  11.99
);

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Rani Raspberry Bubble Waffle',
  'Rani Raspberry Bubble Waffle served with Luxury Raspberry Sorbet, Raspberry syrup and Fresh Raspberry, Topped with whiped cream',
  6,
  'Regular',
  11.99
);

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Strawberry Explosion Bubble Waffle',
  'Strawberry Explosion Bubble Waffle served with delicious Strawberry gelato, Strawberry sauce and Fresh Strawberry slices. Topped with Whipped ceram',
  7,
  'Regular',
  11.99
);

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Brownie Temptation Bubble Waffle',
  'Brownie Temptation Bubble Waffle served with Vanilla gelato topped with melted milk chocolate, Warm Brownie and Whipped Cream',
  8,
  'Regular',
  11.99
);

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Lotus Biscoff Bubble Waffle',
  'Lotus Biscoff Bubble Waffle served with Biscoff Gelato, Biscoff sauce, dusted with Biscoff Crumbs, topped with Whipped Cream',
  9,
  'Regular',
  11.99
);

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Cherry Blossom',
  'Cherry Blossom Bubble Waffle Served With Scoop of Cream Cheery gelato, topped with Cheery Sauce, White Flakes / Cheery and Whipped Cream ( On Availability)',
  10,
  'Regular',
  10.49
);

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Ferrero Rocher Mountain Bubble Waffle',
  'Ferrero Rocher Bubble Waffle Served With Scoop of Roche Gelato, Topped with Nutella Sauce, Ferrero Roche, Nuts with Whipped Cream',
  11,
  'Regular',
  12.49
);

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Bubble-Gum Rainbow Bubble Waffle',
  'Bubble-Gum Bubble Waffle Served with Scoop of Bubble-Gum Gelato, Topped with Bubble Gum Sauce, Sprinklers and Whipped Cream',
  12,
  'Regular',
  11.99
);

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Pistachio Choco-nut Bubble Waffle',
  'Pistachio Choco-nut Bubble Waffle Served With Scoop Of Pistachio & Nutella Gelato, Topped with Nutella, Nuts and Whipped Cream',
  13,
  'Regular',
  12.99
);

select pg_temp.add_menu_item(
  'Nutella Bubble Waffle',
  'Dark Chocolate and Pistachio Bubble Waffle',
  'Dark Chocolate and Pistachio Bubble Waffle Served with Scoop of Dark Chocolate and Pistachio Gelato topped with Nuts, Dark Chocolate Sauce, Pistachio and Whipped Cream',
  14,
  'Regular',
  11.99
);


-- ============================================================
-- CROFFLE WAFFLES
-- ============================================================

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Banana Toffee Blast Croffle',
  'Banana Toffee Blast Croffle Waffle served with delicious Banana gelato, Fudge Cubes, Toffee sauce and fresh Banana slices',
  1,
  'Regular',
  10.50
);

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Strawberry Chocolate River Croffle',
  'Strawberry Chocolate River Croffle Waffle served with combination of Chocolate and Strawberry gelato, fresh Strawberry slices and Belgium Chocolate.',
  2,
  'Regular',
  10.95
);

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Kinder Bueno Wave Croffle Waffle',
  'Kinder Bueno Wave Croffle Waffle served with combination of Hazelnut nougat and White chocolate gelato, warm Nutella sauce and kinder bueno bar',
  3,
  'Regular',
  10.95
);

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Dirty Chocolate Croffle Waffle',
  'Dirty Chocolate Croffle Waffle served with Luxurious chocolate gelato, melted Belgium chocolate and chocolate Flakes.',
  4,
  'Regular',
  10.50
);

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Rani Raspberry Croffle Waffle',
  'Rani Raspberry Croffle Waffle served with Luxury Raspberry Sorbet, Raspberry syrup and Fresh Raspberry',
  5,
  'Regular',
  10.50
);

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Strawberry Explosion Croffle Waffle',
  'Strawberry Explosion Croffle Waffle served with delicious Strawberry gelato, Strawberry sauce and Fresh Strawberry slices.',
  6,
  'Regular',
  10.50
);

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Oreo Volcano',
  'Oreo Volcano Croffle Waffle served with delicious Oreo Cookies gelato, topped with White Chocolate sauce dusted with Oreo Crumbles',
  7,
  'Regular',
  10.50
);

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Brownie Temptation Croffle Waffle',
  'Broenie Temptation Croffle Waffle served with Vanilla gelato topped with melted milk chocolate and warm Brownie',
  8,
  'Regular',
  10.50
);

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Lotus Biscoff Croffle Waffle',
  'Lotus Biscoff Croffle Waffle served with Biscoff Gelato, Biscoff sauce, dusted with Biscoff Crumbs.',
  9,
  'Regular',
  10.50
);

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Cherry Blossom Croffle Waffle',
  'Cherry Blossom Croffle Waffle Served With Scoop of Cream Cheery gelato, topped with Cheery Sauce and White Flakes / Cheery ( On Availability)',
  10,
  'Regular',
  10.50
);

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Ferrero Rocher Mountain Croffle Waffle',
  'Ferrero Rocher Mountain Croffle Waffle Served With Scoop of Roche Gelato, Topped with Nutella Sauce, Ferrero Roche and Nuts',
  11,
  'Regular',
  10.50
);

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Bubble-Gum Rainbow Croffle Waffle',
  'Bubble-Gum Rainbow Croffle Waffle Served with Scoop of Bubble-Gum Gelato, Topped with Bubble Gum Sauce and Sprinklers',
  12,
  'Regular',
  10.50
);

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Pistachio Choco-nut Croffle Waffle',
  'Pistachio Choco-nut Croffle Waffle Served With Scoop Of Pistachio & Nutella Gelato, Topped with Nutella and Nuts',
  13,
  'Regular',
  10.50
);

select pg_temp.add_menu_item(
  'Croffle Waffles',
  'Dark Chocolate and Pistachio Croffle Waffle',
  'Dark Chocolate and Pistachio Croffle Waffle Served with Scoop of Dark Chocolate and Pistachio Gelato topped with Nuts, Dark Chocolate Sauce and Pistachio',
  14,
  'Regular',
  10.95
);


-- ============================================================
-- BELGIAN WAFFLE
-- ============================================================

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Banana Toffee Blast Belgain Waffle',
  'Banana Toffee Blast Belgain Waffle served with delicious Banana gelato, Fudge Cubes, Toffee sauce and fresh Banana slices',
  1,
  'Regular',
  7.25
);

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Strawberry Chocolate River Belgain Waffle',
  'Strawberry Chocolate River Belgain Waffle served with combination of Chocolate and Strawberry gelato, fresh Strawberry slices and Belgium Chocolate.',
  2,
  'Regular',
  7.75
);

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Kinder Bueno Wave Belgain Waffle',
  'Kinder Bueno Wave Belgain Waffle served with combination of Hazelnut nougat and White chocolate gelato, warm Nutella sauce and kinder bueno bar',
  3,
  'Regular',
  7.75
);

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Dirty Chocolate Belgain Waffle',
  'Dirty Chocolate Belgain Waffle served with Luxurious chocolate gelato, melted Belgium chocolate and chocolate Flakes.',
  4,
  'Regular',
  7.25
);

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Rani Raspberry Belgain Waffle',
  'Rani Raspberry Belgain Waffle served with Luxury Raspberry Sorbet, Raspberry syrup and Fresh Raspberry',
  5,
  'Regular',
  7.25
);

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Strawberry Explosion Belgain Waffle',
  'Strawberry Explosion Belgain Waffle served with Luxury Raspberry Sorbet, Raspberry syrup and Fresh Raspberry',
  6,
  'Regular',
  7.25
);

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Oreo Volcano Belgain Waffle',
  'Oreo Volcano Belgain Waffle served with delicious Oreo Cookies gelato, topped with White Chocolate sauce dusted with Oreo Crumbles',
  7,
  'Regular',
  7.25
);

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Brownie Temptation Belgain Waffle',
  'Brownie Temptation Belgain Waffle served with Vanilla gelato topped with melted milk chocolate and warm Brownie',
  8,
  'Regular',
  7.75
);

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Lotus Biscoff Belgain Waffle',
  'Lotus Biscoff Belgain Waffle served with Biscoff Gelato, Biscoff sauce, dusted with Biscoff Crumbs.',
  9,
  'Regular',
  7.25
);

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Cherry Blossom Belgain Waffle',
  'Cherry Blossom Belgain Waffle Served With Scoop of Cream Cheery gelato, topped with Cheery Sauce and White Flakes / Cheery ( On Availability)',
  10,
  'Regular',
  7.25
);

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Ferrero Rocher Mountain Belgain Waffle',
  'Ferrero Rocher Mountain Belgain Served With Scoop of Roche Gelato, Topped with Nutella Sauce, Ferrero Roche, Nuts',
  11,
  'Regular',
  7.25
);

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Bubble-Gum Rainbow Belgain Waffle',
  'Bubble-Gum Rainbow Belgain Waffle Served with Scoop of Bubble-Gum Gelato, Topped with Bubble Gum Sauce and Sprinklers',
  12,
  'Regular',
  7.25
);

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Pistachio Choco-nut Belgain Waffle',
  'Pistachio Choco-nut Belgain Waffle Served With Scoop Of Pistachio & Nutella Gelato, Topped with Nutella and Nuts',
  13,
  'Regular',
  7.25
);

select pg_temp.add_menu_item(
  'Belgian Waffle',
  'Dark Chocolate and Pistachio Belgain Waffle',
  'Dark Chocolate and Pistachio Belgain Waffle Served with Scoop of Dark Chocolate and Pistachio Gelato topped with Nuts, Dark Chocolate Sauce, Pistachio',
  14,
  'Regular',
  7.75
);


commit;