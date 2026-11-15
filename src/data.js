export const restaurants = {
  'brew-and-bites': {
    id: 'brew-and-bites',
    name: 'Brew & Bites',
    tagline: 'Café & Restaurant',
    emoji: '☕',
    accent: '#b8935a',
    googleReviewUrl: 'https://g.page/r/brew-and-bites/review',
    categories: [
      {
        id: 'starters',
        name: 'Starters',
        icon: '🥗',
        items: [
          { id: 1, name: 'Garlic Bread', price: 99,  desc: 'Toasted sourdough with herb butter, roasted garlic and a sprinkle of parsley.', tag: 'Veg',     image: 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=400&q=80', popular: true  },
          { id: 2, name: 'Nachos',       price: 149, desc: 'Crispy corn nachos loaded with cheddar cheese, salsa and sour cream.', tag: 'Veg',     image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80', popular: true  },
          { id: 3, name: 'Peri Peri Fries', price: 119, desc: 'Golden fries tossed in our signature peri peri masala with a smoky kick.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&q=80', popular: false },
          { id: 4, name: 'Chicken Strips', price: 199, desc: 'Crispy golden chicken strips served with honey mustard dipping sauce.', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80', popular: true },
        ],
      },
      {
        id: 'mains',
        name: 'Main Course',
        icon: '🍽️',
        items: [
          { id: 5, name: 'Grilled Chicken Sandwich', price: 249, desc: 'Juicy grilled chicken with lettuce, tomato and chipotle mayo on a brioche bun.', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80', popular: true  },
          { id: 6, name: 'Mushroom Risotto',         price: 299, desc: 'Creamy arborio rice with wild mushrooms, parmesan and fresh thyme.', tag: 'Veg',     image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80', popular: false },
          { id: 7, name: 'Pasta Arrabbiata',         price: 229, desc: 'Penne in a spicy tomato sauce with garlic, chilli flakes and fresh basil.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80', popular: true },
          { id: 8, name: 'BBQ Chicken Pizza',        price: 349, desc: 'Thin crust pizza with BBQ sauce, grilled chicken, onions and mozzarella.', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', popular: true },
        ],
      },
      {
        id: 'biryani',
        name: 'Biryani',
        icon: '🍛',
        items: [
          { id: 9,  name: 'Chicken Dum Biryani', price: 299, desc: 'Slow-cooked basmati rice layered with spiced chicken, saffron and caramelised onions.', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80', popular: true  },
          { id: 10, name: 'Veg Biryani',         price: 229, desc: 'Fragrant basmati rice with seasonal vegetables, whole spices and fresh mint.', tag: 'Veg',     image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80', popular: false },
          { id: 11, name: 'Egg Biryani',         price: 249, desc: 'Fluffy basmati rice cooked with masala eggs, fried onions and aromatic spices.', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80', popular: false },
        ],
      },
      {
        id: 'drinks',
        name: 'Drinks',
        icon: '☕',
        items: [
          { id: 12, name: 'Cold Brew Coffee',  price: 149, desc: 'Smooth 12-hour cold-steeped coffee served over ice with a hint of vanilla.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', popular: true  },
          { id: 13, name: 'Mango Smoothie',    price: 129, desc: 'Fresh Alphonso mango blended with yogurt, honey and a pinch of cardamom.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80', popular: true  },
          { id: 14, name: 'Lemon Iced Tea',    price: 99,  desc: 'Chilled black tea with fresh lemon, mint and a touch of honey.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80', popular: false },
          { id: 15, name: 'Hot Cappuccino',    price: 119, desc: 'Double espresso with velvety steamed milk foam and a dusting of cocoa.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80', popular: true  },
        ],
      },
      {
        id: 'desserts',
        name: 'Desserts',
        icon: '🍰',
        items: [
          { id: 16, name: 'Chocolate Lava Cake', price: 199, desc: 'Warm dark chocolate cake with a molten centre, served with vanilla ice cream.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80', popular: true  },
          { id: 17, name: 'Tiramisu',             price: 179, desc: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80', popular: true  },
          { id: 18, name: 'Gulab Jamun',          price: 99,  desc: 'Soft milk-solid dumplings soaked in rose-flavoured sugar syrup, served warm.', tag: 'Veg', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Two_Gulab_Jamun_in_a_plate_01.jpg/500px-Two_Gulab_Jamun_in_a_plate_01.jpg', popular: false },
        ],
      },
    ],
  },

  'royal-bistro': {
    id: 'royal-bistro',
    name: 'Royal Bistro',
    tagline: 'Fine Dining Experience',
    emoji: '👑',
    accent: '#c9a040',
    googleReviewUrl: 'https://g.page/r/royal-bistro/review',
    categories: [
      {
        id: 'starters',
        name: 'Starters',
        icon: '🥗',
        items: [
          { id: 1, name: 'Bruschetta',      price: 299, desc: 'Toasted ciabatta with vine tomatoes, fresh basil, garlic and extra virgin olive oil.', tag: 'Veg',     image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&q=80', popular: true  },
          { id: 2, name: 'Chicken Wings',   price: 449, desc: 'Crispy wings tossed in smoky BBQ glaze, served with blue cheese dip.', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=80', popular: true  },
          { id: 3, name: 'Soup of the Day', price: 199, desc: "Chef's special seasonal soup served with warm crusty bread.", tag: 'Veg', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80', popular: false },
        ],
      },
      {
        id: 'mains',
        name: 'Main Course',
        icon: '🍽️',
        items: [
          { id: 4, name: 'Grilled Salmon',  price: 899,  desc: 'Atlantic salmon fillet with lemon butter sauce, capers and seasonal vegetables.', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80', popular: true  },
          { id: 5, name: 'Pasta Alfredo',   price: 549,  desc: 'Fettuccine in a rich parmesan cream sauce with garlic and fresh herbs.', tag: 'Veg',     image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&q=80', popular: false },
          { id: 6, name: 'Lamb Chops',      price: 1099, desc: 'Herb-crusted lamb chops with rosemary jus, roasted garlic and mashed potato.', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', popular: true },
        ],
      },
      {
        id: 'desserts',
        name: 'Desserts',
        icon: '🍰',
        items: [
          { id: 7, name: 'Tiramisu',             price: 349, desc: 'Classic Italian dessert with mascarpone, espresso and a dusting of cocoa.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80', popular: true  },
          { id: 8, name: 'Chocolate Lava Cake',  price: 299, desc: 'Warm chocolate fondant with a molten centre, served with vanilla bean ice cream.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80', popular: true },
        ],
      },
      {
        id: 'drinks',
        name: 'Drinks',
        icon: '🥤',
        items: [
          { id: 9,  name: 'Fresh Lime Soda', price: 129, desc: 'Freshly squeezed lime with chilled soda, served sweet or salted.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80', popular: false },
          { id: 10, name: 'Mango Lassi',     price: 149, desc: 'Thick and creamy Alphonso mango blended with chilled yogurt and cardamom.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80', popular: true  },
        ],
      },
    ],
  },

  'spice-house': {
    id: 'spice-house',
    name: 'Spice House',
    tagline: 'Authentic Indian Flavours',
    emoji: '🌶️',
    accent: '#d4522a',
    googleReviewUrl: 'https://g.page/r/spice-house/review',
    categories: [
      {
        id: 'starters',
        name: 'Starters',
        icon: '🥗',
        items: [
          { id: 1, name: 'Samosa (2 pcs)',  price: 99,  desc: 'Crispy golden pastry filled with spiced potatoes, peas and fresh coriander.', tag: 'Veg',     image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80', popular: true  },
          { id: 2, name: 'Chicken Tikka',   price: 349, desc: 'Tender chicken marinated in yogurt and spices, grilled in a tandoor. Served with mint chutney.', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', popular: true },
        ],
      },
      {
        id: 'mains',
        name: 'Main Course',
        icon: '🍽️',
        items: [
          { id: 3, name: 'Butter Chicken',       price: 449, desc: 'Tender chicken in a rich, velvety tomato-butter gravy with cream and fenugreek.', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80', popular: true  },
          { id: 4, name: 'Paneer Tikka Masala',  price: 379, desc: 'Grilled cottage cheese cubes in a spiced tomato-onion gravy.', tag: 'Veg',     image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', popular: true  },
          { id: 5, name: 'Dal Makhani',          price: 299, desc: 'Slow-cooked black lentils simmered overnight with butter, cream and spices.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80', popular: false },
        ],
      },
      {
        id: 'breads',
        name: 'Breads & Rice',
        icon: '🫓',
        items: [
          { id: 6, name: 'Garlic Naan',  price: 79,  desc: 'Soft leavened bread brushed with garlic butter and baked in a tandoor.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', popular: true  },
          { id: 7, name: 'Jeera Rice',   price: 149, desc: 'Fragrant basmati rice tempered with cumin seeds, ghee and whole spices.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80', popular: false },
        ],
      },
    ],
  },

  'green-leaf': {
    id: 'green-leaf',
    name: 'Green Leaf',
    tagline: 'Pure Veg & Healthy',
    emoji: '🌿',
    accent: '#4a8c5c',
    googleReviewUrl: 'https://g.page/r/green-leaf/review',
    categories: [
      {
        id: 'salads',
        name: 'Salads & Bowls',
        icon: '🥗',
        items: [
          { id: 1, name: 'Caesar Salad',  price: 249, desc: 'Crisp romaine, house-made caesar dressing, parmesan shavings and sourdough croutons.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', popular: true  },
          { id: 2, name: 'Quinoa Bowl',   price: 349, desc: 'Tri-colour quinoa with roasted vegetables, avocado, chickpeas and tahini dressing.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', popular: true  },
        ],
      },
      {
        id: 'mains',
        name: 'Mains',
        icon: '🍽️',
        items: [
          { id: 3, name: 'Veg Burger',      price: 199, desc: 'Crispy black bean patty with lettuce, tomato, pickles and our special herb sauce.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80', popular: true  },
          { id: 4, name: 'Mushroom Pasta',  price: 299, desc: 'Penne with sautéed wild mushrooms, garlic, olive oil and fresh parsley.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80', popular: false },
        ],
      },
      {
        id: 'juices',
        name: 'Juices & Smoothies',
        icon: '🥤',
        items: [
          { id: 5, name: 'Green Detox',  price: 179, desc: 'Cold-pressed spinach, cucumber, green apple, ginger and a squeeze of lemon.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80', popular: true  },
          { id: 6, name: 'Berry Blast',  price: 199, desc: 'Mixed berries, banana, almond milk and a drizzle of raw honey.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&q=80', popular: true  },
        ],
      },
    ],
  },

  'tasty-bites': {
    id: 'tasty-bites',
    name: 'Tasty Bites',
    tagline: 'Street Food & Snacks',
    emoji: '🍴',
    accent: '#9b59b6',
    googleReviewUrl: 'https://g.page/r/tasty-bites/review',
    categories: [
      {
        id: 'snacks',
        name: 'Snacks',
        icon: '🍟',
        items: [
          { id: 1, name: 'Pav Bhaji',     price: 149, desc: 'Spiced mashed vegetable curry served with buttered, toasted pav and a squeeze of lemon.', tag: 'Veg',     image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', popular: true  },
          { id: 2, name: 'Vada Pav',      price: 49,  desc: "Mumbai's iconic street snack — spiced potato fritter in a soft bun with chutneys.", tag: 'Veg',     image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80', popular: true  },
          { id: 3, name: 'Chicken Roll',  price: 179, desc: 'Spiced chicken tikka wrapped in a flaky paratha with onions and green chutney.', tag: 'Non-Veg', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80', popular: true  },
        ],
      },
      {
        id: 'chaat',
        name: 'Chaat Corner',
        icon: '🥘',
        items: [
          { id: 4, name: 'Pani Puri',  price: 79, desc: 'Crispy hollow puris filled with spiced potato and dunked in tangy tamarind water.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80', popular: true  },
          { id: 5, name: 'Bhel Puri',  price: 89, desc: 'Puffed rice tossed with onions, tomatoes, chutneys and crunchy sev.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80', popular: false },
        ],
      },
      {
        id: 'drinks',
        name: 'Drinks',
        icon: '🥤',
        items: [
          { id: 6, name: 'Sugarcane Juice',  price: 59,  desc: 'Freshly pressed sugarcane with a hint of ginger, lemon and black salt.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&q=80', popular: true  },
          { id: 7, name: 'Cold Coffee',      price: 129, desc: 'Chilled coffee blended with full-cream milk, sugar and a scoop of vanilla ice cream.', tag: 'Veg', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', popular: true  },
        ],
      },
    ],
  },
};
